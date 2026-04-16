const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const DIST = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Proxy API calls to OpenClaw gateway (/api/* and /v1/*)
  if (pathname.startsWith('/api/') || pathname.startsWith('/v1/')) {
    const targetPath = pathname.startsWith('/api/') ? pathname.replace('/api', '') : pathname;
    const targetOptions = {
      hostname: '127.0.0.1',
      port: 18789,
      path: targetPath,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'fd6aa805e3747416b6e83eb3e66bfbc7969561eb903c22c3',
        'anthropic-version': '2023-06-01',
      }
    };
    try {
      const proxyReq = http.request(targetOptions, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });
      req.pipe(proxyReq, { end: true });
      proxyReq.on('error', (e) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Serve static files from dist (SPA)
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);
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
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback to index.html
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
        res.end(data2 || 'Not found');
      });
      return;
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600'
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
  console.log(`   API:     /api/v1/messages → OpenClaw gateway`);
});
