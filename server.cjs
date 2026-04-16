// APEX Web Office Server
// Run: node server.js
// Then open: http://192.168.0.208:3000 (from any device on your network)
//
// AI calls proxy to OpenClaw gateway — uses ALL your installed models for FREE

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000
const OPENCLAW_URL = 'http://127.0.0.1:18789'
const OPENCLAW_TOKEN = 'fd6aa805e3747416b6e83eb3e66bfbc7969561eb903c22c3'
const SERVE_FILE = path.join(__dirname, 'WEB-OFFICE.html')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  // ── AI Proxy → OpenClaw Gateway ────────────────────────────────────────
  if (req.method === 'POST' && (req.url === '/api/chat' || req.url === '/v1/chat/completions')) {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      const parsed = JSON.parse(body || '{}')
      // Use openclaw/main which routes to your configured models (MiniMax M2.7, Gemma, etc.)
      const model = parsed.model || 'openclaw/main'
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: 18789,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENCLAW_TOKEN,
        }
      }, proxyRes => {
        let data = ''
        proxyRes.on('data', c => data += c)
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' })
          res.end(data)
        })
      })
      proxyReq.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: { message: 'Gateway error: ' + err.message } }))
      })
      proxyReq.write(body)
      proxyReq.end()
    })
    return
  }

  // ── Serve Web Office ─────────────────────────────────────────────────────
  fs.readFile(SERVE_FILE, (err, data) => {
    if (err) { res.writeHead(500); res.end('File not found: WEB-OFFICE.html'); return }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🔥 APEX WEB OFFICE — SERVER MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Local:   http://localhost:${PORT}
   LAN:     http://192.168.0.208:${PORT}

   Open this URL on any device on your network.
   AI proxies to OpenClaw gateway → uses your installed models.
   Press Ctrl+C to stop.
`)
})
