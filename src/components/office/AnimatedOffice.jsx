import React, { useState, useEffect, useRef, useCallback } from 'react'

const TILE = 40
const FLOOR_COLS = 20
const FLOOR_ROWS = 14

// 5 agents in ONE row — Hugo (CEO) center, 4 agents flanking
const DEPTS = [
  { id: 'sales',    name: 'Felix',   emoji: '🦊', color: '#FF6B35', dark: '#431407', cx: 3,  cy: 8 },
  { id: 'marketing',name: 'Phoenix', emoji: '🦚', color: '#A855F7', dark: '#3b0764', cx: 7,  cy: 8 },
  { id: 'ceo',      name: 'Hugo',    emoji: '🦁', color: '#EF4444', dark: '#450a0a', cx: 10, cy: 8, isCEO: true },
  { id: 'ops',      name: 'Axel',    emoji: '🦡', color: '#10B981', dark: '#022c22', cx: 13, cy: 8 },
  { id: 'finance',  name: 'Bruno',   emoji: '🐻', color: '#F59E0B', dark: '#451a03', cx: 17, cy: 8 },
]

// ─── Draw a realistic desk with legs ────────────────────────────────────────
function drawDesk(ctx, dept, isCEO) {
  const cx = dept.cx * TILE
  const cy = dept.cy * TILE
  const w = isCEO ? 240 : 180
  const h = isCEO ? 130 : 100
  const deskY = cy
  const deskH = isCEO ? 14 : 10

  // Desk legs
  ctx.fillStyle = '#374151'
  ctx.fillRect(cx - w/2 + 8, deskY + deskH, 8, cy + 40 - deskY - deskH)  // left leg
  ctx.fillRect(cx + w/2 - 16, deskY + deskH, 8, cy + 40 - deskY - deskH) // right leg

  // Desk surface
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(cx - w/2, deskY, w, deskH)
  // Surface top edge
  ctx.fillStyle = dept.color
  ctx.fillRect(cx - w/2, deskY, w, 4)
  ctx.fillRect(cx - w/2, deskY, w, 2)

  // Monitor stand
  ctx.fillStyle = '#374151'
  ctx.fillRect(cx - 6, deskY - 16, 12, 16)
  // Monitor
  ctx.fillStyle = '#111827'
  ctx.fillRect(cx - (isCEO ? 52 : 40), deskY - (isCEO ? 80 : 64), isCEO ? 104 : 80, isCEO ? 64 : 52)
  ctx.fillStyle = dept.color + '35'
  ctx.fillRect(cx - (isCEO ? 48 : 37), deskY - (isCEO ? 76 : 61), isCEO ? 96 : 74, isCEO ? 58 : 47)
  // Monitor top shine
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(cx - (isCEO ? 52 : 40), deskY - (isCEO ? 80 : 64), isCEO ? 104 : 80, 4)

  // Keyboard
  ctx.fillStyle = '#374151'
  ctx.fillRect(cx - (isCEO ? 40 : 30), deskY + 4, isCEO ? 80 : 60, 10)
  ctx.fillStyle = '#4b5563'
  ctx.fillRect(cx - (isCEO ? 38 : 28), deskY + 6, isCEO ? 76 : 56, 6)

  // Coffee mug
  ctx.fillStyle = dept.color
  ctx.fillRect(cx + w/2 - 24, deskY + 2, 16, 14)
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(cx + w/2 - 22, deskY + 4, 12, 10)
  // Handle
  ctx.fillStyle = dept.color
  ctx.fillRect(cx + w/2 - 8, deskY + 5, 4, 8)

  // Name tag
  ctx.fillStyle = dept.color
  ctx.font = `bold ${isCEO ? 14 : 12}px system-ui`
  ctx.textAlign = 'center'
  ctx.fillText(`${dept.emoji} ${dept.name}`, cx, deskY + deskH + 18)
  ctx.textAlign = 'left'
}

// ─── Draw pixel agent sitting at desk ──────────────────────────────────────
function drawAgent(ctx, dept, frame, working, clickable) {
  const cx = dept.cx * TILE
  const cy = dept.cy * TILE
  const deskY = cy
  const f = frame % 4
  const bobY = working ? [0, -1, 0, -1][f] : 0
  const id = dept.id

  // Agent sits ON the desk, not floating above it
  const headY = deskY - (dept.isCEO ? 68 : 54) + bobY
  const bodyY = deskY - (dept.isCEO ? 40 : 32) + bobY

  // Body
  ctx.fillStyle = dept.color
  ctx.fillRect(cx - (dept.isCEO ? 14 : 10), bodyY, dept.isCEO ? 28 : 20, dept.isCEO ? 28 : 22)
  // Body detail
  ctx.fillStyle = dept.dark
  ctx.fillRect(cx - (dept.isCEO ? 10 : 7), bodyY + 4, dept.isCEO ? 20 : 14, dept.isCEO ? 18 : 14)

  // Head
  ctx.fillStyle = '#FDE68A'
  ctx.fillRect(cx - (dept.isCEO ? 12 : 8), headY, dept.isCEO ? 24 : 16, dept.isCEO ? 22 : 16)
  // Eyes
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(cx - (dept.isCEO ? 8 : 5), headY + (dept.isCEO ? 6 : 4), dept.isCEO ? 4 : 3, dept.isCEO ? 4 : 3)
  ctx.fillRect(cx + (dept.isCEO ? 4 : 2), headY + (dept.isCEO ? 6 : 4), dept.isCEO ? 4 : 3, dept.isCEO ? 4 : 3)

  // Crown for Hugo/CEO
  if (dept.isCEO) {
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(cx - 12, headY - 12, 24, 10)
    ctx.fillStyle = '#D97706'
    ctx.fillRect(cx - 12, headY - 12, 6, 10); ctx.fillRect(cx + 6, headY - 12, 6, 10)
    ctx.fillStyle = '#FBBF24'
    ctx.fillRect(cx - 8, headY - 14, 16, 4)
  }

  // Fox ears for Felix
  if (id === 'sales') {
    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(cx - 14, headY - 4, 6, 12); ctx.fillRect(cx + 8, headY - 4, 6, 12)
    ctx.fillStyle = '#FDE68A'
    ctx.fillRect(cx - 14, headY, 6, 8); ctx.fillRect(cx + 8, headY, 6, 8)
  }

  // Peacock feathers for Phoenix
  if (id === 'marketing') {
    ctx.fillStyle = '#A855F7'
    ctx.fillRect(cx - 10, headY - 18, 5, 16); ctx.fillRect(cx - 2, headY - 22, 5, 20); ctx.fillRect(cx + 6, headY - 18, 5, 16)
    ctx.fillStyle = '#10B981'
    ctx.fillRect(cx - 9, headY - 20, 3, 4); ctx.fillRect(cx - 1, headY - 24, 3, 4); ctx.fillRect(cx + 7, headY - 20, 3, 4)
  }

  // Badger stripes for Axel
  if (id === 'ops') {
    ctx.fillStyle = '#065f46'
    ctx.fillRect(cx - 8, headY + 2, 16, 3); ctx.fillRect(cx - 8, headY + 7, 16, 3)
  }

  // Bear ears for Bruno
  if (id === 'finance') {
    ctx.fillStyle = '#F59E0B'
    ctx.fillRect(cx - 14, headY, 6, 10); ctx.fillRect(cx + 8, headY, 6, 10)
    ctx.fillStyle = '#92400E'
    ctx.fillRect(cx - 14, headY + 2, 6, 6); ctx.fillRect(cx + 8, headY + 2, 6, 6)
  }

  // Clickable highlight
  if (clickable) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(cx - (dept.isCEO ? 20 : 14), bodyY - 4, dept.isCEO ? 40 : 28, (dept.isCEO ? 50 : 40))
  }
}

// ─── Draw white/light office background ───────────────────────────────────
function drawOffice(ctx, W, H) {
  // Light gray floor
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, W, H)

  // White floor tiles
  ctx.fillStyle = '#f9fafb'
  for (let x = 0; x < FLOOR_COLS; x++) {
    for (let y = 0; y < FLOOR_ROWS; y++) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE)
      }
    }
  }

  // Ceiling / top bar (dark to contrast white office)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, W, TILE)

  // Wall text
  ctx.fillStyle = '#6b7280'
  ctx.font = 'bold 12px system-ui'
  ctx.fillText('APEX HQ', 12, 26)

  // Window panels on wall
  ctx.fillStyle = '#1e3a5f'
  ctx.fillRect(4 * TILE, 0, 4 * TILE, TILE)
  ctx.fillRect(12 * TILE, 0, 4 * TILE, TILE)
  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(4 * TILE + 4, 4, 4 * TILE - 8, TILE - 8)
  ctx.fillRect(12 * TILE + 4, 4, 4 * TILE - 8, TILE - 8)

  // Floor boundary line
  ctx.strokeStyle = '#9ca3af'
  ctx.lineWidth = 2
  ctx.strokeRect(4, TILE + 4, W - 8, H - TILE - 8)

  // Draw all 5 desks
  DEPTS.forEach(dept => drawDesk(ctx, dept, dept.isCEO))
}

export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const agentsRef = useRef({})
  const rafRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 560 })
  const [bubbles, setBubbles] = useState({})
  const [selectedAgent, setSelectedAgent] = useState(null)

  // Agent state
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

  // Sync Supabase status
  useEffect(() => {
    Object.entries(agentStatuses).forEach(([id, s]) => {
      if (agentsRef.current[id]) {
        agentsRef.current[id].status = s.status
        if (s.status === 'working' && agentsRef.current[id].state === 'idle' && Math.random() < 0.005) {
          const dept = DEPTS.find(d => d.id === id)
          if (!dept) return
          const angle = Math.random() * Math.PI * 2
          const r = 1 + Math.random() * 2
          agentsRef.current[id].targetX = (dept.cx + Math.cos(angle) * r) * TILE
          agentsRef.current[id].targetY = (dept.cy + Math.sin(angle) * r) * TILE
          agentsRef.current[id].state = 'walking'
        }
      }
    })
  }, [agentStatuses])

  // Canvas resize
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

  // Render loop
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
          agent.x += (dx / dist) * 60 * (dt / 1000)
          agent.y += (dy / dist) * 60 * (dt / 1000)
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

      // Draw agents sorted by Y
      const sorted = DEPTS.map(d => agentsRef.current[d.id]).filter(Boolean).sort((a, b) => a.y - b.y)
      sorted.forEach(agent => {
        const dept = DEPTS.find(d => d.id === agent.id)
        if (!dept) return
        const working = agent.state === 'walking' || agent.status === 'working'
        const clickable = selectedAgent === agent.id
        drawAgent(ctx, dept, agent.frame, working, clickable)
      })

      ctx.restore()

      const newBubbles = {}
      Object.values(agentsRef.current).forEach(a => { if (a.speech) newBubbles[a.id] = { text: a.speech } })
      setBubbles(prev => JSON.stringify(prev) !== JSON.stringify(newBubbles) ? newBubbles : prev)

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [canvasSize, selectedAgent])

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
      if (d < TILE * 1.5) clicked = dept.id
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

      {/* Speech bubbles */}
      {Object.entries(bubbles).map(([id, { text }]) => {
        const dept = DEPTS.find(d => d.id === id)
        if (!dept) return null
        const scale = canvasSize.w / (FLOOR_COLS * TILE)
        const agent = agents[id]
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
