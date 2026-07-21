const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const webpush = require("web-push");

const ROOT = __dirname;
const DATA_DIR = process.env.DORAN_DATA_DIR
  ? path.resolve(process.env.DORAN_DATA_DIR)
  : process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
    : path.join(ROOT, ".data");
const DATA_FILE = path.join(DATA_DIR, "household.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const PUSH_FILE = path.join(DATA_DIR, "push-subscriptions.json");
const VAPID_FILE = path.join(DATA_DIR, "push-keys.json");
const PORT = Number(process.env.PORT || 4173);
const APP_USERNAME = process.env.WORKINGMOM_USERNAME || "family";
const APP_PASSWORD = process.env.WORKINGMOM_PASSWORD || "";
const SESSION_SECRET = process.env.WORKINGMOM_SESSION_SECRET || crypto.createHash("sha256").update(`workingmom:${APP_PASSWORD}`).digest("hex");
const SESSION_COOKIE = "workingmom_session";
const SESSION_AGE_SECONDS = 90 * 24 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 8;
const clients = new Set();
const loginAttempts = new Map();
const PUBLIC_FILES = new Set([
  "/", "/index.html", "/styles.css", "/app.js", "/manifest.webmanifest",
  "/sw.js",
  "/icons/favicon-32.png", "/icons/apple-touch-icon.png", "/icons/icon-192.png",
  "/icons/icon-512.png", "/icons/icon-1024.png",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function readState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (Number(parsed.version || 1) < 8) {
      const migratedAt = Number(parsed.updatedAt || 0) + 1;
      parsed.household ||= {};
      parsed.household.workSchedule ||= {};
      parsed.household.workSchedule.wife ||= {};
      parsed.household.workSchedule.wife.nightDays = [1, 2];
      parsed.household.workSchedule.wife.recoveryEnd = "18:00";
      parsed.syncMeta ||= { fields: {}, objects: {} };
      parsed.syncMeta.fields ||= {};
      parsed.syncMeta.fields.household = Math.max(migratedAt, Number(parsed.syncMeta.fields.household || 0));
      parsed.version = 8;
      parsed.updatedAt = migratedAt;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2), "utf8");
  fs.renameSync(temporary, file);
}

function seoulDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function ensureDailyBackup(state) {
  if (!state) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `${seoulDateKey()}.json`);
  if (!fs.existsSync(file)) writeJsonAtomic(file, state);
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort()
    .reverse();
  for (const old of backups.slice(31)) fs.unlinkSync(path.join(BACKUP_DIR, old));
}

function listBackupSnapshots() {
  try {
    return fs.readdirSync(BACKUP_DIR)
      .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
      .sort()
      .reverse()
      .map((name) => {
        const file = path.join(BACKUP_DIR, name);
        return { date: name.slice(0, 10), size: fs.statSync(file).size };
      });
  } catch {
    return [];
  }
}

function readBackupSnapshot(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, `${date}.json`), "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  ensureDailyBackup(readState() || state);
  writeJsonAtomic(DATA_FILE, state);
}

function mergeTimestampMaps(left = {}, right = {}) {
  const result = { ...left };
  for (const [key, value] of Object.entries(right || {})) result[key] = Math.max(Number(result[key] || 0), Number(value || 0));
  return result;
}

function fieldTimestamp(state, field) {
  return Number(state?.syncMeta?.fields?.[field] || state?.updatedAt || 0);
}

function objectTimestamp(state, field, key) {
  return Number(state?.syncMeta?.objects?.[field]?.[key] || state?.updatedAt || 0);
}

function mergeKeyedObject(current, incoming, field) {
  const left = current?.[field] || {};
  const right = incoming?.[field] || {};
  const result = {};
  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    const leftTime = objectTimestamp(current, field, key);
    const rightTime = objectTimestamp(incoming, field, key);
    const source = rightTime >= leftTime ? right : left;
    if (Object.prototype.hasOwnProperty.call(source, key)) result[key] = source[key];
  }
  return result;
}

function mergeStates(current, incoming) {
  if (!current) return incoming;
  const result = { ...current, ...incoming };

  for (const field of ["household", "customTasks", "shoppingHistory"]) {
    result[field] = fieldTimestamp(incoming, field) >= fieldTimestamp(current, field) ? incoming[field] : current[field];
  }

  for (const field of ["claims", "postponed", "subtaskProgress", "taskOverrides"]) {
    result[field] = mergeKeyedObject(current, incoming, field);
  }

  result.deletedEventIds = mergeTimestampMaps(current.deletedEventIds, incoming.deletedEventIds);
  const eventMap = new Map();
  for (const event of [...(current.events || []), ...(incoming.events || [])]) eventMap.set(event.id, event);
  result.events = [...eventMap.values()].filter((event) => !result.deletedEventIds[event.id] && event.taskId !== "laundry-batches");

  result.shoppingDeletedIds = mergeTimestampMaps(current.shoppingDeletedIds, incoming.shoppingDeletedIds);
  const shoppingMap = new Map();
  for (const item of [...(current.shoppingItems || []), ...(incoming.shoppingItems || [])]) {
    const existing = shoppingMap.get(item.id);
    if (!existing || Number(item.updatedAt || 0) >= Number(existing.updatedAt || 0)) shoppingMap.set(item.id, item);
  }
  result.shoppingItems = [...shoppingMap.values()].filter((item) => Number(item.updatedAt || 0) > Number(result.shoppingDeletedIds[item.id] || 0));

  const fields = mergeTimestampMaps(current.syncMeta?.fields, incoming.syncMeta?.fields);
  const objects = {};
  for (const field of ["claims", "postponed", "subtaskProgress", "taskOverrides"]) {
    objects[field] = mergeTimestampMaps(current.syncMeta?.objects?.[field], incoming.syncMeta?.objects?.[field]);
  }
  result.syncMeta = { fields, objects };
  result.notificationSummary = Number(incoming.updatedAt || 0) >= Number(current.updatedAt || 0)
    ? incoming.notificationSummary
    : current.notificationSummary;
  const startedAtCandidates = [current.startedAt, incoming.startedAt]
    .filter(Boolean)
    .sort((left, right) => new Date(left) - new Date(right));
  result.startedAt = startedAtCandidates[0] || new Date().toISOString();
  const historyMap = new Map();
  for (const item of [...(current.shoppingHistory || []), ...(incoming.shoppingHistory || [])]) {
    const key = `${String(item.name || "").trim().toLocaleLowerCase("ko-KR")}|${item.category || "other"}`;
    const existing = historyMap.get(key);
    if (!existing || new Date(item.lastBoughtAt || 0) >= new Date(existing.lastBoughtAt || 0)) historyMap.set(key, item);
  }
  result.shoppingHistory = [...historyMap.values()]
    .sort((left, right) => new Date(right.lastBoughtAt || 0) - new Date(left.lastBoughtAt || 0))
    .slice(0, 40);
  result.version = Math.max(Number(current.version || 1), Number(incoming.version || 1), 8);
  result.clientId = incoming.clientId;
  result.updatedAt = Math.max(Date.now(), Number(current.updatedAt || 0) + 1, Number(incoming.updatedAt || 0));
  return result;
}

function readPushData() {
  try {
    const parsed = JSON.parse(fs.readFileSync(PUSH_FILE, "utf8"));
    return { subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [] };
  } catch {
    return { subscriptions: [] };
  }
}

function writePushData(data) {
  writeJsonAtomic(PUSH_FILE, data);
}

function configureWebPush() {
  try {
    let keys;
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      keys = { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
    } else {
      try { keys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8")); } catch { keys = webpush.generateVAPIDKeys(); writeJsonAtomic(VAPID_FILE, keys); }
    }
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:workingmom@jeojeomchu.xyz", keys.publicKey, keys.privateKey);
    return { enabled: true, publicKey: keys.publicKey };
  } catch (error) {
    console.warn("푸시 알림을 준비하지 못했습니다.", error.message);
    return { enabled: false, publicKey: "" };
  }
}

const pushConfiguration = configureWebPush();

async function sendPush(record, payload) {
  if (!pushConfiguration.enabled) return "failed";
  try {
    await webpush.sendNotification(record.subscription, JSON.stringify(payload), { TTL: 60 * 60 * 12 });
    return "sent";
  } catch (error) {
    if (![404, 410].includes(error.statusCode)) console.warn("푸시 알림 전송 실패:", error.statusCode || error.message);
    return [404, 410].includes(error.statusCode) ? "expired" : "failed";
  }
}

async function sendToSubscriptions(payload, predicate = () => true) {
  const data = readPushData();
  const kept = [];
  for (const record of data.subscriptions) {
    if (!predicate(record)) {
      kept.push(record);
      continue;
    }
    const status = await sendPush(record, payload);
    if (status !== "expired") kept.push(record);
  }
  if (kept.length !== data.subscriptions.length) writePushData({ subscriptions: kept });
}

function memberName(state, memberId) {
  if (memberId === "wife") return state?.household?.wifeName || "엄마";
  if (memberId === "husband") return state?.household?.husbandName || "아빠";
  return "두 사람";
}

async function notifyPartnerChanges(previous, next) {
  if (!previous || !next?.household?.partnerAlerts) return;
  const wifeRecovering = wifeIsRecovering(next);
  const canNotify = (record, excludedMemberId) => record.memberId !== excludedMemberId && !(record.memberId === "wife" && wifeRecovering);
  const previousEventIds = new Set((previous.events || []).map((event) => event.id));
  const completion = (next.events || []).find((event) => event.eventType === "completed" && !previousEventIds.has(event.id));
  if (completion && completion.memberId !== "together") {
    await sendToSubscriptions({
      title: "집안일을 하나 끝냈어요",
      body: `${memberName(next, completion.memberId)}이(가) 완료했어요. 서로의 수고를 확인해 보세요.`,
      url: "/?page=history",
      tag: `completion-${completion.id}`,
    }, (record) => canNotify(record, completion.memberId));
    return;
  }
  for (const [taskId, claim] of Object.entries(next.claims || {})) {
    if (claim?.claimedAt && previous.claims?.[taskId]?.claimedAt !== claim.claimedAt) {
      await sendToSubscriptions({
        title: "집안일을 맡았어요",
        body: `${memberName(next, claim.memberId)}이(가) 집안일 하나를 맡았어요.`,
        url: "/",
        tag: `claim-${taskId}-${claim.claimedAt}`,
      }, (record) => canNotify(record, claim.memberId));
      break;
    }
  }
}

function handlePushSubscribe(request, response) {
  readJsonBody(request, (error, body) => {
    const subscription = body?.subscription;
    if (error || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return sendJson(response, 400, { ok: false, error: "invalid_subscription" });
    }
    const data = readPushData();
    const record = {
      subscription,
      memberId: ["wife", "husband"].includes(body.memberId) ? body.memberId : "wife",
      createdAt: new Date().toISOString(),
      lastSent: data.subscriptions.find((item) => item.subscription?.endpoint === subscription.endpoint)?.lastSent || {},
    };
    data.subscriptions = data.subscriptions.filter((item) => item.subscription?.endpoint !== subscription.endpoint);
    data.subscriptions.push(record);
    writePushData(data);
    sendJson(response, 200, { ok: true });
  });
}

function handlePushUnsubscribe(request, response) {
  readJsonBody(request, (error, body) => {
    if (error || !body?.endpoint) return sendJson(response, 400, { ok: false, error: "invalid_subscription" });
    const data = readPushData();
    data.subscriptions = data.subscriptions.filter((item) => item.subscription?.endpoint !== body.endpoint);
    writePushData(data);
    sendJson(response, 200, { ok: true });
  });
}

function handlePushTest(request, response) {
  readJsonBody(request, async (error, body) => {
    if (error || !body?.endpoint) return sendJson(response, 400, { ok: false, error: "invalid_subscription" });
    const record = readPushData().subscriptions.find((item) => item.subscription?.endpoint === body.endpoint);
    if (!record) return sendJson(response, 404, { ok: false, error: "subscription_not_found" });
    const status = await sendPush(record, { title: "알림이 잘 연결됐어요", body: "도란도란이 정한 시각에 가볍게 알려드릴게요.", url: "/", tag: "push-test" });
    sendJson(response, status === "sent" ? 200 : 503, { ok: status === "sent" });
  });
}

function seoulClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, minutes: Number(values.hour) * 60 + Number(values.minute) };
}

function timeToMinutes(value, fallback) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : fallback;
}

function wifeIsRecovering(state, clock = seoulClock()) {
  const schedule = state?.household?.workSchedule?.wife || {};
  const nightDays = (schedule.nightDays || []).map(Number);
  const day = new Date(`${clock.date}T00:00:00Z`).getUTCDay();
  const previousDay = (day + 6) % 7;
  const shiftEnd = timeToMinutes(schedule.end, 8 * 60);
  const recoveryEnd = timeToMinutes(schedule.recoveryEnd, 18 * 60);
  return nightDays.includes(previousDay) && clock.minutes >= shiftEnd && clock.minutes < recoveryEnd;
}

let notificationCheckRunning = false;
async function checkScheduledNotifications() {
  if (notificationCheckRunning || !pushConfiguration.enabled) return;
  notificationCheckRunning = true;
  try {
    const state = readState();
    const data = readPushData();
    if (!state || !data.subscriptions.length) return;
    const clock = seoulClock();
    const morning = timeToMinutes(state.household?.morningAlert, 9 * 60);
    const evening = timeToMinutes(state.household?.eveningAlert, 20 * 60 + 30);
    const summary = state.notificationSummary || {};
    const wifeRecovering = wifeIsRecovering(state, clock);
    let changed = false;
    const kept = [];
    for (const record of data.subscriptions) {
      record.lastSent ||= {};
      let payload = null;
      let kind = "";
      const summaryIsCurrent = summary.date === clock.date;
      if (clock.minutes >= evening && summaryIsCurrent && Number(summary.remaining || 0) > 0 && record.lastSent.evening !== clock.date) {
        kind = "evening";
        payload = { title: "오늘 남은 집안일", body: `${summary.remaining}개가 남아 있어요. 하나만 골라도 충분해요.`, url: "/", tag: `evening-${clock.date}` };
      } else if (clock.minutes >= morning && clock.minutes < evening && record.lastSent.morning !== clock.date) {
        kind = "morning";
        const count = summaryIsCurrent ? Number(summary.remaining || 0) : 0;
        const scheduleNote = summary.needsDaysOff ? " 아빠의 다음 2주 휴무도 입력해 주세요." : "";
        payload = { title: "오늘의 집안일", body: `${count ? `오늘 살펴볼 일 ${count}개가 있어요.` : "오늘의 집안일을 가볍게 확인해 보세요."}${scheduleNote}`, url: summary.needsDaysOff ? "/?page=settings" : "/", tag: `morning-${clock.date}` };
      }
      if (!payload) {
        kept.push(record);
        continue;
      }
      if (record.memberId === "wife" && wifeRecovering) {
        record.lastSent[kind] = clock.date;
        kept.push(record);
        changed = true;
        continue;
      }
      const status = await sendPush(record, payload);
      if (status === "sent") {
        record.lastSent[kind] = clock.date;
        kept.push(record);
        changed = true;
      } else if (status !== "expired") {
        kept.push(record);
      }
    }
    if (changed || kept.length !== data.subscriptions.length) writePushData({ subscriptions: kept });
  } finally {
    notificationCheckRunning = false;
  }
}

function sendJson(response, status, data, headers = {}) {
  response.writeHead(status, { "Content-Type": MIME[".json"], "Cache-Control": "no-store", ...headers });
  response.end(JSON.stringify(data));
}

function broadcast(state) {
  const message = `event: state\ndata: ${JSON.stringify(state)}\n\n`;
  for (const client of clients) client.write(message);
}

function safeEqual(left, right) {
  const a = crypto.createHash("sha256").update(String(left)).digest();
  const b = crypto.createHash("sha256").update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function makeSessionToken() {
  const payload = base64url(JSON.stringify({ username: APP_USERNAME, expiresAt: Date.now() + SESSION_AGE_SECONDS * 1000 }));
  return `${payload}.${sign(payload)}`;
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

function validSession(request) {
  if (!APP_PASSWORD) return true;
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.username === APP_USERNAME && Number(session.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

function validBasicAuth(request) {
  if (!APP_PASSWORD) return true;
  const header = request.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const splitAt = decoded.indexOf(":");
    return splitAt >= 0 && safeEqual(decoded.slice(0, splitAt), APP_USERNAME) && safeEqual(decoded.slice(splitAt + 1), APP_PASSWORD);
  } catch {
    return false;
  }
}

function isAuthorized(request) {
  return validSession(request) || validBasicAuth(request);
}

function isHttps(request) {
  return String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https" || request.socket.encrypted;
}

function sessionCookie(request, token, maxAge = SESSION_AGE_SECONDS) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(request) ? "; Secure" : ""}`;
}

function clientAddress(request) {
  return String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function canTryLogin(request) {
  const key = clientAddress(request);
  const now = Date.now();
  const recent = (loginAttempts.get(key) || []).filter((time) => now - time < LOGIN_WINDOW_MS);
  loginAttempts.set(key, recent);
  return recent.length < LOGIN_LIMIT;
}

function noteFailedLogin(request) {
  const key = clientAddress(request);
  loginAttempts.set(key, [...(loginAttempts.get(key) || []), Date.now()]);
}

function readJsonBody(request, callback) {
  let body = "";
  let tooLarge = false;
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 2_000_000) tooLarge = true;
  });
  request.on("end", () => {
    if (tooLarge) return callback(new Error("too_large"));
    try {
      callback(null, JSON.parse(body || "{}"));
    } catch {
      callback(new Error("invalid_json"));
    }
  });
}

function handleLogin(request, response) {
  if (!canTryLogin(request)) {
    sendJson(response, 429, { ok: false, error: "too_many_attempts" });
    return;
  }
  readJsonBody(request, (error, credentials) => {
    if (error) return sendJson(response, 400, { ok: false, error: "invalid_request" });
    const matches = !APP_PASSWORD || (safeEqual(credentials.username || "", APP_USERNAME) && safeEqual(credentials.password || "", APP_PASSWORD));
    if (!matches) {
      noteFailedLogin(request);
      return sendJson(response, 401, { ok: false, error: "invalid_credentials" });
    }
    loginAttempts.delete(clientAddress(request));
    sendJson(response, 200, { ok: true, username: APP_USERNAME }, { "Set-Cookie": sessionCookie(request, makeSessionToken()) });
  });
}

function handleStatePost(request, response) {
  readJsonBody(request, (error, incoming) => {
    if (error) return sendJson(response, 400, { ok: false, error: "invalid_state" });
    const current = readState();
    const merged = mergeStates(current, incoming);
    writeState(merged);
    broadcast(merged);
    notifyPartnerChanges(current, merged).catch(() => {});
    sendJson(response, 200, { ok: true, state: merged });
  });
}

function handleStateReplace(request, response) {
  readJsonBody(request, (error, incoming) => {
    if (error || !incoming || !Array.isArray(incoming.events)) return sendJson(response, 400, { ok: false, error: "invalid_state" });
    const replaced = { ...incoming, version: 8, updatedAt: Math.max(Date.now(), Number(incoming.updatedAt || 0)) };
    ensureDailyBackup(readState());
    writeJsonAtomic(DATA_FILE, replaced);
    broadcast(replaced);
    sendJson(response, 200, { ok: true, state: replaced });
  });
}

function handleStatic(request, response) {
  const pathname = decodeURIComponent(request.url.split("?")[0]);
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  if (!PUBLIC_FILES.has(pathname === "/" ? "/" : requestPath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  const filePath = path.resolve(ROOT, `.${requestPath}`);
  const relativePath = path.relative(ROOT, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || filePath.startsWith(DATA_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const pathname = request.url.split("?")[0];
  if (pathname === "/api/login" && request.method === "POST") return handleLogin(request, response);
  if (pathname === "/api/logout" && request.method === "POST") {
    sendJson(response, 200, { ok: true }, { "Set-Cookie": sessionCookie(request, "", 0) });
    return;
  }
  if (pathname === "/api/session" && request.method === "GET") {
    if (!isAuthorized(request)) return sendJson(response, 401, { authenticated: false });
    sendJson(response, 200, { authenticated: true, username: APP_USERNAME });
    return;
  }
  if (pathname.startsWith("/api/") && !isAuthorized(request)) {
    sendJson(response, 401, { ok: false, error: "authentication_required" });
    return;
  }
  if (pathname === "/api/state" && request.method === "GET") {
    sendJson(response, 200, { state: readState() });
    return;
  }
  if (pathname === "/api/state" && request.method === "POST") return handleStatePost(request, response);
  if (pathname === "/api/state/replace" && request.method === "POST") return handleStateReplace(request, response);
  if (pathname === "/api/backups" && request.method === "GET") {
    sendJson(response, 200, { backups: listBackupSnapshots() });
    return;
  }
  if (pathname.startsWith("/api/backups/") && request.method === "GET") {
    const date = pathname.slice("/api/backups/".length);
    const snapshot = readBackupSnapshot(date);
    if (!snapshot) return sendJson(response, 404, { ok: false, error: "backup_not_found" });
    sendJson(response, 200, { state: snapshot });
    return;
  }
  if (pathname === "/api/backup" && request.method === "GET") {
    const state = readState();
    if (!state) return sendJson(response, 404, { ok: false, error: "no_state" });
    sendJson(response, 200, state, { "Content-Disposition": `attachment; filename="doran-backup-${seoulDateKey()}.json"` });
    return;
  }
  if (pathname === "/api/push/config" && request.method === "GET") {
    sendJson(response, 200, { enabled: pushConfiguration.enabled, publicKey: pushConfiguration.publicKey });
    return;
  }
  if (pathname === "/api/push/subscribe" && request.method === "POST") return handlePushSubscribe(request, response);
  if (pathname === "/api/push/unsubscribe" && request.method === "POST") return handlePushUnsubscribe(request, response);
  if (pathname === "/api/push/test" && request.method === "POST") return handlePushTest(request, response);
  if (pathname === "/api/events" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write(": connected\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }
  handleStatic(request, response);
});

server.listen(PORT, "0.0.0.0", () => {
  const addresses = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) addresses.push(`http://${entry.address}:${PORT}`);
    }
  }
  console.log(`\n도란도란 집안일이 시작됐어요.`);
  console.log(`이 컴퓨터: http://localhost:${PORT}`);
  for (const address of addresses) console.log(`같은 와이파이: ${address}`);
  if (APP_PASSWORD) console.log(`가족 로그인: ${APP_USERNAME} / 설정된 비밀번호 (90일 자동 로그인)`);
  console.log("\n두 휴대폰에서 같은 주소를 열면 변경사항이 바로 공유됩니다.\n");
});

setTimeout(checkScheduledNotifications, 5000).unref();
setInterval(checkScheduledNotifications, 30 * 1000).unref();

module.exports = server;
