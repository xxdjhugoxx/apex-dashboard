// APEX Dashboard Server — serves dashboard + proxies AI to OpenClaw gateway
// Run: node server.js
// Then open: http://192.168.0.208:3000

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000
const OPENCLAW_URL = 'http://127.0.0.1:18789'
const OPENCLAW_TOKEN = 'fd6aa805e3747416b6e83eb3e66bfbc7969561eb903c22c3'
const PUBLIC_DIR = path.join(__dirname, 'public')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

const server = http.createServer((req, res) => {
  // ── CORS headers ──────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  // ── AI Proxy ──────────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      const options = {
        hostname: '127.0.0.1',
        port: 18789,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENCLAW_TOKEN,
        }
      }
      const proxyReq = http.request(options, proxyRes => {
        let data = ''
        proxyRes.on('data', chunk => data += chunk)
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' })
          res.end(data)
        })
      })
      proxyReq.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: { message: 'OpenClaw gateway error: ' + err.message } }))
      })
      proxyReq.write(body)
      proxyReq.end()
    })
    return
  }

  // ── Serve Dashboard ──────────────────────────────────────────────────────
  let urlPath = req.url === '/' ? '/index.html' : req.url
  let filePath = path.join(PUBLIC_DIR, urlPath)

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html for SPA routing
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Not found: ' + urlPath); return }
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(data2)
      })
      return
    }
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' }); res.end(data)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔥 APEX Dashboard running at:`)
  console.log(`   Local:   http://localhost:${PORT}`)
  console.log(`   LAN:     http://192.168.0.208:${PORT}`)
  console.log(`\n   AI proxies to OpenClaw gateway automatically`)
  console.log(`   Press Ctrl+C to stop\n`)
})
