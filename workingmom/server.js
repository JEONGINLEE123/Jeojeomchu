const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

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
const clients = new Set();
const PUBLIC_FILES = new Set(["/", "/index.html", "/styles.css", "/app.js"]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
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

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function broadcast(state) {
  const message = `event: state\ndata: ${JSON.stringify(state)}\n\n`;
  for (const client of clients) client.write(message);
}

function isAuthorized(request) {
  if (!APP_PASSWORD) return true;
  const expected = `Basic ${Buffer.from(`${APP_USERNAME}:${APP_PASSWORD}`).toString("base64")}`;
  return request.headers.authorization === expected;
}

function handleStatePost(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 2_000_000) request.destroy();
  });
  request.on("end", () => {
    try {
      const incoming = JSON.parse(body);
      const current = readState();
      if (current?.updatedAt && current.updatedAt > incoming.updatedAt) {
        sendJson(response, 409, { ok: false, state: current });
        broadcast(current);
        return;
      }
      writeState(incoming);
      broadcast(incoming);
      sendJson(response, 200, { ok: true });
    } catch {
      sendJson(response, 400, { ok: false, error: "invalid_state" });
    }
  });
}

function handleStatic(request, response) {
  const requestPath = request.url === "/" ? "/index.html" : decodeURIComponent(request.url.split("?")[0]);
  if (!PUBLIC_FILES.has(request.url === "/" ? "/" : requestPath)) {
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
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  if (!isAuthorized(request)) {
    response.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="WorkingMOM", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end("가족용 아이디와 비밀번호가 필요합니다.");
    return;
  }
  if (request.url === "/api/state" && request.method === "GET") {
    sendJson(response, 200, { state: readState() });
    return;
  }
  if (request.url === "/api/state" && request.method === "POST") {
    handleStatePost(request, response);
    return;
  }
  if (request.url === "/api/events" && request.method === "GET") {
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
  if (APP_PASSWORD) console.log(`가족 로그인: ${APP_USERNAME} / 설정된 비밀번호`);
  console.log("\n두 휴대폰에서 같은 주소를 열면 변경사항이 바로 공유됩니다.\n");
});

module.exports = server;
