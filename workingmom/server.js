const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = process.env.DORAN_DATA_DIR
  ? path.resolve(process.env.DORAN_DATA_DIR)
  : process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
    : path.join(ROOT, ".data");
const DATA_FILE = path.join(DATA_DIR, "household.json");
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
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
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
    if (current?.updatedAt && current.updatedAt > incoming.updatedAt) {
      sendJson(response, 409, { ok: false, state: current });
      broadcast(current);
      return;
    }
    writeState(incoming);
    broadcast(incoming);
    sendJson(response, 200, { ok: true });
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

module.exports = server;
