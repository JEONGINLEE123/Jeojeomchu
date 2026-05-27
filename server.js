const express = require('express');
const path = require('node:path');
const { Readable } = require('node:stream');

const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_VERSION = '2023-06-01';
// Optional. If unset, /api/image returns 503 and the client falls back to emoji cards.
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ANTHROPIC_KEY) {
  console.error('[FATAL] ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

if (!UNSPLASH_KEY) {
  console.warn('[INFO] UNSPLASH_ACCESS_KEY 미설정 — 메뉴 사진 없이 이모지 카드로 표시됩니다.');
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

// Unsplash image search proxy. Caches per query for the process lifetime.
const imageCache = new Map();
const IMAGE_CACHE_MAX = 500;

app.get('/api/image', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: { message: 'query required' } });
  }
  if (!UNSPLASH_KEY) {
    return res.status(503).json({ error: { message: 'image search not configured' } });
  }
  if (imageCache.has(q)) {
    return res.json({ url: imageCache.get(q) });
  }
  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', q + ' food');
    url.searchParams.set('per_page', '1');
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('content_filter', 'high');
    const upstream = await fetch(url, {
      headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` },
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: { message: 'unsplash error' } });
    }
    const data = await upstream.json();
    const imgUrl = data.results?.[0]?.urls?.small || null;
    if (imgUrl) {
      if (imageCache.size >= IMAGE_CACHE_MAX) {
        // Drop oldest entry (Map preserves insertion order)
        imageCache.delete(imageCache.keys().next().value);
      }
      imageCache.set(q, imgUrl);
    }
    res.json({ url: imgUrl });
  } catch (err) {
    console.error('[IMAGE ERROR]', err);
    res.status(502).json({ error: { message: err.message } });
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
