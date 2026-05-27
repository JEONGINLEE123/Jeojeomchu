const express = require('express');
const path = require('node:path');
const { Readable } = require('node:stream');

const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_VERSION = '2023-06-01';

if (!ANTHROPIC_KEY) {
  console.error('[FATAL] ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '12mb' })); // base64 images can be ~5MB
app.set('etag', false);

// Proxy to Anthropic
app.post('/api/chat', async (req, res) => {
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

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`저점추 서버가 포트 ${PORT}에서 실행 중`);
});
