const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const DIST = path.join(__dirname, 'dist');

const OPENCLAW_URL = 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = 'fd6aa805e3747416b6e83eb3e66bfbc7969561eb903c22c3';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ── AI PROXY ────────────────────────────────────────────────
  // These paths all get forwarded to OpenClaw gateway as /v1/chat/completions
  const isAI = pathname === '/v1/messages'
    || pathname === '/api/v1/messages'
    || pathname === '/api/chat'
    || pathname === '/v1/chat/completions';

  if (isAI && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        // Translate Anthropic format to OpenAI format
        const openAIBody = {
          model: parsed.model || 'openclaw',
          max_tokens: Number(parsed.max_tokens) || 2048,
          messages: parsed.messages || [],
        };
        if (parsed.system) {
          openAIBody.messages = [{ role: 'system', content: parsed.system }, ...openAIBody.messages];
        }
        const postData = JSON.stringify(openAIBody);
        const proxyReq = http.request({
          hostname: '127.0.0.1',
          port: 18789,
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + OPENCLAW_TOKEN,
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: 30000,
        }, (proxyRes) => {
          let data = '';
          proxyRes.on('data', chunk => { data += chunk; });
          proxyRes.on('end', () => {
            res.writeHead(proxyRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(data);
          });
        });
        proxyReq.on('timeout', () => {
          proxyReq.destroy();
          res.writeHead(504, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Gateway timeout' }));
        });
        proxyReq.on('error', (e) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
        proxyReq.write(postData);
        proxyReq.end();
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  // ── SERVE STATIC FILES ───────────────────────────────────
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);
  // If path has no extension or is a route, serve index.html (SPA)
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ico': 'image/x-icon',
  };

  fs.readFile(filePath, (err, data) => {
    if (err || !ext) {
      // SPA fallback — serve index.html for client-side routing
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(data2 || 'Not found');
      });
      return;
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(data);
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 APEX PIXEL OFFICE — SERVER MODE`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   LAN:     http://192.168.0.207:${PORT}`);
  console.log(`   Proxies: /v1/messages, /api/chat → OpenClaw gateway`);
});
