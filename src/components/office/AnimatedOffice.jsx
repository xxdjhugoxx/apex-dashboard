import React, { useState, useEffect, useRef, useCallback } from 'react'

const TILE = 44
const FLOOR_COLS = 22
const FLOOR_ROWS = 14

// Layout: Hugo at TOP center, 6 workers in ONE row below
const DEPTS = [
  // Hugo — top center, bigger desk, crown
  { id: 'ceo',   name: 'Hugo',    emoji: '🦁', color: '#EF4444', dark: '#450a0a', cx: 11, cy: 3, isCEO: true },
  // Workers row — all in one long bench desk
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35', dark: '#431407', cx: 3,  cy: 9 },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7', dark: '#3b0764', cx: 7,  cy: 9 },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981', dark: '#022c22', cx: 11, cy: 9 },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B', dark: '#451a03', cx: 15, cy: 9 },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899', dark: '#500724', cx: 18, cy: 9 },
  { id: 'engineer',  name: 'Atlas',   emoji: '🤖', color: '#06B6D4', dark: '#083344', cx: 21, cy: 9 },
]

// ─── Draw long bench desk with monitors ───────────────────────────────────
function drawBenchDesk(ctx) {
  const x = 1 * TILE
  const y = 10 * TILE
  const w = 20 * TILE
  const h = 12  // thin desk top

  // Bench surface
  ctx.fillStyle = '#d1d5db'
  ctx.fillRect(x, y, w, h)
  // Front edge
  ctx.fillStyle = '#9ca3af'
  ctx.fillRect(x, y + h, w, 4)

  // 6 monitors evenly spaced
  const monitors = [3, 7, 11, 15, 18, 21]
  const deptMap = { 3: 'sales', 7: 'marketing', 11: 'ops', 15: 'finance', 18: 'instagram', 21: 'engineer' }
  monitors.forEach(cx => {
    const dept = DEPTS.find(d => d.id === deptMap[cx])
    if (!dept) return
    const mx = cx * TILE - 16
    const my = y - 48
    // Monitor stand
    ctx.fillStyle = '#6b7280'
    ctx.fillRect(mx + 12, y - 20, 8, 20)
    // Monitor
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(mx, my, 32, 26)
    ctx.fillStyle = dept.color + '35'
    ctx.fillRect(mx + 2, my + 2, 28, 22)
    // Name under monitor
    ctx.fillStyle = dept.color
    ctx.font = 'bold 9px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`${dept.emoji} ${dept.name}`, cx * TILE, y + h + 14)
    ctx.textAlign = 'left'
  })
}

// ─── Draw Hugo's big boss desk ────────────────────────────────────────────
function drawBossDesk(ctx) {
  const cx = 11 * TILE
  const y = 4 * TILE
  const w = 280
  const h = 16

  // Desk shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(cx - w/2 + 6, y + 6, w, h)

  // Desk surface
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(cx - w/2, y, w, h)
  // Edge
  ctx.fillStyle = '#EF4444'
  ctx.fillRect(cx - w/2, y, w, 4)

  // Monitor
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(cx - 52, y - 80, 104, 74)
  ctx.fillStyle = '#EF4444' + '30'
  ctx.fillRect(cx - 48, y - 76, 96, 66)

  // Stand
  ctx.fillStyle = '#6b7280'
  ctx.fillRect(cx - 8, y - 22, 16, 22)

  // Keyboard
  ctx.fillStyle = '#d1d5db'
  ctx.fillRect(cx - 48, y + 4, 96, 10)

  // Name
  ctx.fillStyle = '#EF4444'
  ctx.font = 'bold 13px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('🦁 HUGO', cx, y + h + 18)
  ctx.textAlign = 'left'
}

// ─── Draw pixel agent sitting at desk ──────────────────────────────────────
function drawAgent(ctx, dept, frame, working) {
  const cx = dept.cx * TILE
  const cy = dept.cy * TILE
  const f = frame % 4
  const bobY = working ? [0, -1, 0, -1][f] : 0
  const id = dept.id
  const isCEO = dept.isCEO

  // Worker sits at bench desk (desk top is at cy*TILE, thin)
  const deskY = cy * TILE
  const deskH = 12

  if (isCEO) {
    // Boss stands behind big desk
    const headY = deskY - 90 + bobY
    const bodyY = deskY - 60 + bobY

    // Crown
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(cx - 14, headY - 14, 28, 12)
    ctx.fillStyle = '#D97706'
    ctx.fillRect(cx - 14, headY - 14, 7, 12); ctx.fillRect(cx + 7, headY - 14, 7, 12)
    ctx.fillStyle = '#FBBF24'
    ctx.fillRect(cx - 10, headY - 16, 20, 4)

    // Head
    ctx.fillStyle = '#FDE68A'
    ctx.fillRect(cx - 12, headY, 24, 22)
    // Eyes
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(cx - 8, headY + 6, 4, 4); ctx.fillRect(cx + 4, headY + 6, 4, 4)
    // Body (suit)
    ctx.fillStyle = '#EF4444'
    ctx.fillRect(cx - 14, bodyY, 28, 28)
    ctx.fillStyle = '#7f1d1d'
    ctx.fillRect(cx - 10, bodyY + 4, 20, 18)
    // Tie
    ctx.fillStyle = '#EF4444'
    ctx.fillRect(cx - 3, bodyY, 6, 14)
  } else {
    // Worker sits on bench
    const headY = deskY - 68 + bobY
    const bodyY = deskY - 42 + bobY

    // Head
    ctx.fillStyle = '#FDE68A'
    ctx.fillRect(cx - 9, headY, 18, 16)
    // Eyes
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(cx - 6, headY + 5, 3, 3); ctx.fillRect(cx + 3, headY + 5, 3, 3)

    // Body
    ctx.fillStyle = dept.color
    ctx.fillRect(cx - 10, bodyY, 20, 20)
    ctx.fillStyle = dept.dark
    ctx.fillRect(cx - 7, bodyY + 3, 14, 14)

    // Fox ears
    if (id === 'sales') {
      ctx.fillStyle = '#FF6B35'
      ctx.fillRect(cx - 13, headY - 2, 5, 10); ctx.fillRect(cx + 8, headY - 2, 5, 10)
      ctx.fillStyle = '#FDE68A'
      ctx.fillRect(cx - 13, headY + 1, 5, 7); ctx.fillRect(cx + 8, headY + 1, 5, 7)
    }
    // Peacock feathers
    if (id === 'marketing') {
      ctx.fillStyle = '#A855F7'
      ctx.fillRect(cx - 9, headY - 16, 4, 14); ctx.fillRect(cx - 2, headY - 20, 4, 18); ctx.fillRect(cx + 5, headY - 16, 4, 14)
    }
    // Badger stripes
    if (id === 'ops') {
      ctx.fillStyle = '#065f46'
      ctx.fillRect(cx - 7, headY + 3, 14, 3); ctx.fillRect(cx - 7, headY + 8, 14, 3)
    }
    // Bear ears
    if (id === 'finance') {
      ctx.fillStyle = '#F59E0B'
      ctx.fillRect(cx - 13, headY, 5, 10); ctx.fillRect(cx + 8, headY, 5, 10)
    }
    // Camera (Blaze)
    if (id === 'instagram') {
      ctx.fillStyle = '#EC4899'
      ctx.fillRect(cx - 8, headY - 8, 16, 12)
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(cx - 5, headY - 6, 10, 8)
    }
    // Robot (Atlas)
    if (id === 'engineer') {
      ctx.fillStyle = '#06B6D4'
      ctx.fillRect(cx - 2, headY - 16, 4, 10)
      ctx.fillStyle = '#0891b2'
      ctx.fillRect(cx - 6, headY - 18, 12, 6)
    }
  }
}

// ─── Draw white office ─────────────────────────────────────────────────────
function drawOffice(ctx, W, H) {
  // Floor
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, W, H)
  // Checkerboard
  for (let x = 0; x < FLOOR_COLS; x++) {
    for (let y = 0; y < FLOOR_ROWS; y++) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE)
      }
    }
  }

  // Top wall
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(0, 0, W, TILE + 2)

  // Wall text
  ctx.fillStyle = '#9ca3af'
  ctx.font = 'bold 11px system-ui'
  ctx.fillText('APEX HQ', 12, 22)

  // Windows
  ctx.fillStyle = '#1e3a5f'
  ctx.fillRect(4 * TILE, 0, 4 * TILE, TILE)
  ctx.fillRect(14 * TILE, 0, 4 * TILE, TILE)
  ctx.fillStyle = '#60A5FA'
  ctx.fillRect(4 * TILE + 4, 4, 4 * TILE - 8, TILE - 8)
  ctx.fillRect(14 * TILE + 4, 4, 4 * TILE - 8, TILE - 8)

  // Floor boundary
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 2
  ctx.strokeRect(4, TILE + 2, W - 8, H - TILE - 8)

  // Draw Hugo's desk
  drawBossDesk(ctx)

  // Draw bench desk with all 6 workers
  drawBenchDesk(ctx)
}

export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const agentsRef = useRef({})
  const rafRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 968, h: 616 })
  const [bubbles, setBubbles] = useState({})

  const [agents, setAgents] = useState(() => {
    const initial = {}
    DEPTS.forEach(dept => {
      initial[dept.id] = {
        id: dept.id, x: dept.cx * TILE, y: dept.cy * TILE,
        targetX: dept.cx * TILE, targetY: dept.cy * TILE,
        state: 'idle', frame: 0, frameTimer: 0,
        status: 'idle', speech: '', speechTimer: 0,
      }
    })
    return initial
  })

  useEffect(() => {
    Object.entries(agentStatuses).forEach(([id, s]) => {
      if (agentsRef.current[id]) {
        agentsRef.current[id].status = s.status
        if (s.status === 'working' && agentsRef.current[id].state === 'idle' && Math.random() < 0.005) {
          const dept = DEPTS.find(d => d.id === id)
          if (!dept) return
          const angle = Math.random() * Math.PI * 2
          const r = 0.5 + Math.random()
          agentsRef.current[id].targetX = (dept.cx + Math.cos(angle) * r) * TILE
          agentsRef.current[id].targetY = (dept.cy + Math.sin(angle) * r) * TILE
          agentsRef.current[id].state = 'walking'
        }
      }
    })
  }, [agentStatuses])

  useEffect(() => {
    const update = () => {
      const container = containerRef.current
      if (!container) return
      const cw = container.clientWidth
      if (cw < 100) return
      const scale = cw / (FLOOR_COLS * TILE)
      setCanvasSize({ w: Math.floor(FLOOR_COLS * TILE * scale), h: Math.floor(FLOOR_ROWS * TILE * scale) })
    }
    update()
    const t = setTimeout(update, 200)
    window.addEventListener('resize', update)
    return () => { clearTimeout(t); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let lastTime = 0

    const render = (time) => {
      const dt = time - lastTime
      lastTime = time

      Object.values(agentsRef.current).forEach(agent => {
        const dx = agent.targetX - agent.x
        const dy = agent.targetY - agent.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 2) {
          agent.x += (dx / dist) * 40 * (dt / 1000)
          agent.y += (dy / dist) * 40 * (dt / 1000)
          agent.frameTimer += dt
          if (agent.frameTimer > 150) { agent.frame++; agent.frameTimer = 0 }
        } else if (agent.state === 'walking') {
          agent.state = 'idle'
          agent.frame = 0
        }
        if (agent.speechTimer > 0) {
          agent.speechTimer -= dt
          if (agent.speechTimer <= 0) agent.speech = ''
        }
      })

      const scale = canvasSize.w / (FLOOR_COLS * TILE)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(scale, scale)
      drawOffice(ctx, FLOOR_COLS * TILE, FLOOR_ROWS * TILE)

      // Draw Hugo first (behind), then workers
      const boss = agentsRef.current['ceo']
      const workers = DEPTS.filter(d => !d.isCEO).map(d => agentsRef.current[d.id]).filter(Boolean)
      if (boss) {
        const dept = DEPTS.find(d => d.id === 'ceo')
        if (dept) drawAgent(ctx, dept, boss.frame, boss.state === 'walking' || boss.status === 'working')
      }
      workers.forEach(agent => {
        const dept = DEPTS.find(d => d.id === agent.id)
        if (!dept) return
        drawAgent(ctx, dept, agent.frame, agent.state === 'walking' || agent.status === 'working')
      })

      ctx.restore()

      const newBubbles = {}
      Object.values(agentsRef.current).forEach(a => { if (a.speech) newBubbles[a.id] = { text: a.speech } })
      setBubbles(prev => JSON.stringify(prev) !== JSON.stringify(newBubbles) ? newBubbles : prev)

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [canvasSize])

  useEffect(() => { agentsRef.current = agents }, [agents])

  const handleCanvasClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = (FLOOR_COLS * TILE) / rect.width
    const scaleY = (FLOOR_ROWS * TILE) / rect.height
    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    let clicked = null
    DEPTS.forEach(dept => {
      const cx = dept.cx * TILE
      const cy = dept.cy * TILE
      const d = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2)
      if (d < TILE * 2) clicked = dept.id
    })

    if (clicked) {
      onAgentClick && onAgentClick(clicked)
      const speeches = {
        ceo: ['Q3 is GO!', 'Execute.', 'No excuses.', 'Results now.'],
        sales: ['Felix ON IT!', 'Pipeline strong.', '3 new leads.', 'Closing!'],
        marketing: ['Phoenix has the floor.', 'Content dropping.', 'Going viral.', 'Brand: UNSTOPPABLE.'],
        ops: ['Axel handling it.', 'Systems: GREEN.', 'Efficiency MAX.', 'Zero issues.'],
        finance: ['Bruno on it.', 'Revenue healthy.', 'Invoices cleared.', 'Budget LOCKED.'],
        instagram: ['Blaze posting!', 'Reel LIVE.', 'DMs flooding!', 'Engagement: MAX.'],
        engineer: ['Atlas deploying.', 'Code CLEAN.', 'Build: SUCCESS.', 'Zero bugs.'],
      }
      const opts = speeches[clicked] || ['']
      agentsRef.current[clicked].speech = opts[Math.floor(Math.random() * opts.length)]
      agentsRef.current[clicked].speechTimer = 3000
    }
  }, [onAgentClick])

  return (
    <div ref={containerRef} className="relative flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className="cursor-pointer w-full h-full rounded-2xl"
        style={{ display: 'block' }}
        onClick={handleCanvasClick}
      />

      {Object.entries(bubbles).map(([id, { text }]) => {
        const dept = DEPTS.find(d => d.id === id)
        if (!dept) return null
        const scale = canvasSize.w / (FLOOR_COLS * TILE)
        return (
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{
              left: (dept.cx * TILE * scale) - 50,
              top: ((dept.cy - 1) * TILE * scale) - 30,
              width: 120,
              textAlign: 'center',
            }}
          >
            <div className="px-3 py-1.5 rounded-2xl text-xs font-bold text-white whitespace-nowrap animate-fade-up"
              style={{ backgroundColor: dept.color, boxShadow: `0 0 12px ${dept.color}80` }}>
              {dept.emoji} {text}
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(6px); }
          15% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
