const express = require('express');
const path = require('node:path');
const { Readable } = require('node:stream');

const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const APP_PASSWORD = process.env.APP_PASSWORD;
const ANTHROPIC_VERSION = '2023-06-01';

if (!ANTHROPIC_KEY) {
  console.error('[FATAL] ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}
if (!APP_PASSWORD) {
  console.error('[FATAL] APP_PASSWORD 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const app = express();

// JSON body with generous limit for base64 images (max ~5MB image + overhead)
app.use(express.json({ limit: '12mb' }));

// Disable etag/caching for API routes
app.set('etag', false);

function requireAuth(req, res, next) {
  const pwd = req.headers['x-app-password'];
  if (!pwd || pwd !== APP_PASSWORD) {
    return res.status(401).json({ error: { message: 'Invalid password' } });
  }
  next();
}

// Verify password endpoint (used by client to validate before saving)
app.post('/api/auth', (req, res) => {
  const ok = req.body?.password === APP_PASSWORD;
  res.status(ok ? 200 : 401).json({ ok });
});

// Proxy to Anthropic
app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(req.body),
    });

    const isStream = req.body?.stream === true && upstream.ok && upstream.body;

    if (isStream) {
      res.status(upstream.status);
      res.setHeader('content-type', 'text/event-stream; charset=utf-8');
      res.setHeader('cache-control', 'no-cache');
      res.setHeader('connection', 'keep-alive');
      const stream = Readable.fromWeb(upstream.body);
      stream.pipe(res);
      // Clean up if client disconnects
      req.on('close', () => stream.destroy());
    } else {
      const ct = upstream.headers.get('content-type') || 'application/json';
      const body = await upstream.text();
      res.status(upstream.status);
      res.setHeader('content-type', ct);
      res.send(body);
    }
  } catch (err) {
    console.error('[PROXY ERROR]', err);
    res.status(502).json({ error: { message: '상위 API 호출 실패: ' + err.message } });
  }
});

// Static files
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('service-worker.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('.html') || filePath.endsWith('manifest.json')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// Fallback: index.html for unknown routes (so refreshing in a "page" still works)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`저점추 서버가 포트 ${PORT}에서 실행 중`);
});
