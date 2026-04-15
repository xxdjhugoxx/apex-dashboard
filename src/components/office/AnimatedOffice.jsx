import React, { useState, useEffect, useRef, useCallback } from 'react'

const TILE = 40
const FLOOR_COLS = 22
const FLOOR_ROWS = 14

// 7 agents: Hugo at top center, 6 in 2 rows of 3 below
const DEPTS = [
  // Row 1: Hugo center
  { id: 'ceo',       name: 'Hugo',    emoji: '🦁', color: '#EF4444', dark: '#450a0a', cx: 11, cy: 3, isCEO: true },
  // Row 2: 3 agents
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35', dark: '#431407', cx: 4,  cy: 7 },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7', dark: '#3b0764', cx: 11, cy: 7 },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981', dark: '#022c22', cx: 18, cy: 7 },
  // Row 3: 3 agents
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B', dark: '#451a03', cx: 4,  cy: 11 },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899', dark: '#500724', cx: 11, cy: 11 },
  { id: 'engineer',  name: 'Atlas',   emoji: '🤖', color: '#06B6D4', dark: '#083344', cx: 18, cy: 11 },
]

// ─── Draw desk with legs ───────────────────────────────────────────────────
function drawDesk(ctx, dept) {
  const cx = dept.cx * TILE
  const cy = dept.cy * TILE
  const isCEO = dept.isCEO
  const w = isCEO ? 220 : 160
  const h = isCEO ? 130 : 100
  const deskY = cy
  const deskH = isCEO ? 14 : 10

  // Legs
  ctx.fillStyle = '#9ca3af'
  ctx.fillRect(cx - w/2 + 8, deskY + deskH, 8, cy + 50 - deskY - deskH)
  ctx.fillRect(cx + w/2 - 16, deskY + deskH, 8, cy + 50 - deskY - deskH)

  // Surface
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(cx - w/2, deskY, w, deskH)
  ctx.fillStyle = dept.color
  ctx.fillRect(cx - w/2, deskY, w, 4)

  // Monitor
  const mw = isCEO ? 96 : 72
  const mh = isCEO ? 72 : 56
  const my = isCEO ? 72 : 56
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(cx - mw/2, deskY - my, mw, mh)
  ctx.fillStyle = dept.color + '30'
  ctx.fillRect(cx - mw/2 + 3, deskY - my + 3, mw - 6, mh - 6)

  // Keyboard
  ctx.fillStyle = '#d1d5db'
  ctx.fillRect(cx - (isCEO ? 36 : 28), deskY + 4, isCEO ? 72 : 56, 8)

  // Coffee mug
  ctx.fillStyle = dept.color
  ctx.fillRect(cx + w/2 - 22, deskY + 2, 14, 12)
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(cx + w/2 - 20, deskY + 4, 10, 8)

  // Name label
  ctx.fillStyle = dept.color
  ctx.font = `bold ${isCEO ? 13 : 11}px system-ui`
  ctx.textAlign = 'center'
  ctx.fillText(`${dept.emoji} ${dept.name}`, cx, deskY + deskH + 18)
  ctx.textAlign = 'left'
}

// ─── Draw pixel agent sitting at desk ──────────────────────────────────────
function drawAgent(ctx, dept, frame, working) {
  const cx = dept.cx * TILE
  const cy = dept.cy * TILE
  const deskY = cy
  const f = frame % 4
  const bobY = working ? [0, -1, 0, -1][f] : 0
  const id = dept.id
  const isCEO = dept.isCEO

  const bodyY = deskY - (isCEO ? 44 : 36) + bobY
  const headY = deskY - (isCEO ? 72 : 58) + bobY

  // Body
  ctx.fillStyle = dept.color
  ctx.fillRect(cx - (isCEO ? 14 : 10), bodyY, isCEO ? 28 : 20, isCEO ? 28 : 22)
  ctx.fillStyle = dept.dark
  ctx.fillRect(cx - (isCEO ? 10 : 7), bodyY + 4, isCEO ? 20 : 14, isCEO ? 18 : 14)

  // Head
  ctx.fillStyle = '#FDE68A'
  ctx.fillRect(cx - (isCEO ? 12 : 8), headY, isCEO ? 24 : 16, isCEO ? 22 : 16)

  // Eyes
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(cx - (isCEO ? 8 : 5), headY + (isCEO ? 7 : 5), isCEO ? 4 : 3, isCEO ? 4 : 3)
  ctx.fillRect(cx + (isCEO ? 4 : 2), headY + (isCEO ? 7 : 5), isCEO ? 4 : 3, isCEO ? 4 : 3)

  // Crown (Hugo)
  if (isCEO) {
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(cx - 12, headY - 12, 24, 10)
    ctx.fillStyle = '#D97706'
    ctx.fillRect(cx - 12, headY - 12, 6, 10); ctx.fillRect(cx + 6, headY - 12, 6, 10)
    ctx.fillStyle = '#FBBF24'
    ctx.fillRect(cx - 8, headY - 14, 16, 4)
  }

  // Fox ears (Felix)
  if (id === 'sales') {
    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(cx - 14, headY - 4, 6, 12); ctx.fillRect(cx + 8, headY - 4, 6, 12)
    ctx.fillStyle = '#FDE68A'
    ctx.fillRect(cx - 14, headY, 6, 8); ctx.fillRect(cx + 8, headY, 6, 8)
  }

  // Peacock feathers (Phoenix)
  if (id === 'marketing') {
    ctx.fillStyle = '#A855F7'
    ctx.fillRect(cx - 10, headY - 18, 5, 16); ctx.fillRect(cx - 2, headY - 22, 5, 20); ctx.fillRect(cx + 6, headY - 18, 5, 16)
    ctx.fillStyle = '#10B981'
    ctx.fillRect(cx - 9, headY - 20, 3, 4); ctx.fillRect(cx - 1, headY - 24, 3, 4); ctx.fillRect(cx + 7, headY - 20, 3, 4)
  }

  // Badger stripes (Axel)
  if (id === 'ops') {
    ctx.fillStyle = '#065f46'
    ctx.fillRect(cx - 8, headY + 2, 16, 3); ctx.fillRect(cx - 8, headY + 7, 16, 3)
  }

  // Bear ears (Bruno)
  if (id === 'finance') {
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(cx - 14, headY, 6, 10); ctx.fillRect(cx + 8, headY, 6, 10)
    ctx.fillStyle = '#92400E'
    ctx.fillRect(cx - 14, headY + 2, 6, 6); ctx.fillRect(cx + 8, headY + 2, 6, 6)
  }

  // Camera (Blaze - Instagram)
  if (id === 'instagram') {
    // Camera body
    ctx.fillStyle = '#EC4899'
    ctx.fillRect(cx - 10, headY - 8, 20, 14)
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(cx - 7, headY - 6, 14, 10)
    ctx.fillStyle = '#06B6D4'
    ctx.fillRect(cx - 4, headY - 4, 8, 6)
  }

  // Robot antenna (Atlas)
  if (id === 'engineer') {
    ctx.fillStyle = '#06B6D4'
    ctx.fillRect(cx - 2, headY - 18, 4, 10)
    ctx.fillStyle = '#0891b2'
    ctx.fillRect(cx - 6, headY - 20, 12, 6)
    ctx.fillStyle = '#06B6D4'
    ctx.fillRect(cx - 4, headY - 22, 8, 4)
  }
}

// ─── Draw white office ─────────────────────────────────────────────────────
function drawOffice(ctx, W, H) {
  // Floor
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, W, H)

  // Floor tiles (checkerboard)
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
  ctx.fillRect(0, 0, W, TILE + 4)

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

  // Floor border
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 2
  ctx.strokeRect(4, TILE + 4, W - 8, H - TILE - 8)

  // Draw all desks
  DEPTS.forEach(dept => drawDesk(ctx, dept))
}

export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const agentsRef = useRef({})
  const rafRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 880, h: 560 })
  const [bubbles, setBubbles] = useState({})
  const [selectedAgent, setSelectedAgent] = useState(null)

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
          const r = 1 + Math.random() * 1.5
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
          agent.x += (dx / dist) * 50 * (dt / 1000)
          agent.y += (dy / dist) * 50 * (dt / 1000)
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

      const sorted = DEPTS.map(d => agentsRef.current[d.id]).filter(Boolean).sort((a, b) => a.y - b.y)
      sorted.forEach(agent => {
        const dept = DEPTS.find(d => d.id === agent.id)
        if (!dept) return
        const working = agent.state === 'walking' || agent.status === 'working'
        drawAgent(ctx, dept, agent.frame, working)
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
      if (d < TILE * 1.8) clicked = dept.id
    })

    if (clicked) {
      setSelectedAgent(clicked)
      onAgentClick && onAgentClick(clicked)
      const speeches = {
        ceo: ['Q3 strategy is GO!', 'Team, let\'s make it happen.', 'Results. Now.', 'No excuses.'],
        sales: ['Felix is ON IT!', 'Pipeline looking strong.', '3 new leads hot off the press.', 'Closing time!'],
        marketing: ['Phoenix has the floor.', 'Content dropping NOW.', 'Socials about to go viral.', 'Brand game: UNSTOPPABLE.'],
        ops: ['Axel has this handled.', 'All systems: NOMINAL.', 'Efficiency at MAX.', 'Zero issues.'],
        finance: ['Bruno on the books.', 'Revenue: HEALTHY.', 'All invoices CLEARED.', 'Budget: LOCKED.'],
        instagram: ['Blaze posting NOW!', 'New reel going LIVE.', 'DMs are FLOODING in.', 'Engagement: OFF THE CHARTS.'],
        engineer: ['Atlas deploying NOW.', 'Code is CLEAN.', 'Build: SUCCESS.', 'Zero bugs. Let\'s ship.'],
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
              top: ((dept.cy - 2) * TILE * scale) - 30,
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
