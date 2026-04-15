import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

const TILE = 48
const FLOOR_COLS = 24
const FLOOR_ROWS = 16

const DEPTS = {
  ceo:      { name: 'Hugo',     emoji: '🦁', color: '#EF4444', dark: '#450a0a', accent: '#7f1d1d', cx: 12, cy: 3, deskW: 6 },
  sales:    { name: 'Felix',    emoji: '🦊', color: '#FF6B35', dark: '#431407', accent: '#7c2d12', cx: 3,  cy: 10, deskW: 4 },
  marketing:{ name: 'Phoenix',  emoji: '🦚', color: '#A855F7', dark: '#3b0764', accent: '#581c87', cx: 9,  cy: 10, deskW: 4 },
  ops:      { name: 'Axel',     emoji: '🦡', color: '#10B981', dark: '#022c22', accent: '#064e3b', cx: 15, cy: 10, deskW: 4 },
  finance:  { name: 'Bruno',    emoji: '🐻', color: '#F59E0B', dark: '#451a03', accent: '#78350f', cx: 21, cy: 10, deskW: 4 },
}

// ─── Draw a large detailed desk with monitor ─────────────────────────────
function drawDesk(ctx, cx, cy, deskW, dept) {
  const x = cx * TILE - (deskW * TILE) / 2
  const y = cy * TILE
  const w = deskW * TILE
  const h = TILE * 2

  // Desk shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(x + 4, y + 4, w, h)

  // Desk surface
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(x, y, w, h)
  // Desk edge (top highlight)
  ctx.fillStyle = dept.color
  ctx.fillRect(x, y, w, 4)
  ctx.fillRect(x, y, w, 2)

  // Monitor stand
  ctx.fillStyle = '#333'
  ctx.fillRect(cx * TILE - 6, y - 12, 12, 12)
  // Monitor
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(cx * TILE - 36, y - 60, 72, 44)
  ctx.fillStyle = dept.color + '50'
  ctx.fillRect(cx * TILE - 33, y - 57, 66, 38)
  // Monitor top highlight
  ctx.fillStyle = dept.color + '30'
  ctx.fillRect(cx * TILE - 36, y - 60, 72, 4)

  // Keyboard
  ctx.fillStyle = '#252535'
  ctx.fillRect(cx * TILE - 28, y + 4, 56, 14)
  ctx.fillStyle = dept.color + '40'
  ctx.fillRect(cx * TILE - 26, y + 6, 52, 10)

  // Coffee mug
  ctx.fillStyle = dept.color
  ctx.fillRect(x + w - 20, y + 6, 14, 14)
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(x + w - 18, y + 8, 10, 10)

  // Dept label
  ctx.fillStyle = dept.color
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(dept.emoji + ' ' + dept.name, cx * TILE, y + h + 18)
  ctx.textAlign = 'left'
}

// ─── Draw pixel agent character (large, 24×24) ──────────────────────────
function drawAgent(ctx, id, cx, cy, frame, working, color) {
  const x = cx * TILE - 12
  const y = cy * TILE - 52
  const f = frame % 4
  const bobY = working ? [0, -2, 0, -2][f] : 0

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(cx * TILE - 10, cy * TILE - 4, 20, 6)

  if (id === 'ceo') {
    // Crown
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(x+4, y+bobY-8, 16, 8)
    ctx.fillStyle = '#D97706'; ctx.fillRect(x+4, y+bobY-8, 4, 8); ctx.fillRect(x+16, y+bobY-8, 4, 8)
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(x+6, y+bobY-10, 12, 4)
    // Head
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x+4, y+bobY, 16, 14)
    // Eyes
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+7, y+bobY+4, 3, 3); ctx.fillRect(x+14, y+bobY+4, 3, 3)
    // Mouth
    ctx.fillStyle = '#92400E'; ctx.fillRect(x+9, y+bobY+9, 6, 2)
    // Body
    ctx.fillStyle = color; ctx.fillRect(x+2, y+bobY+14, 20, 16)
    // Tie
    ctx.fillStyle = '#EF4444'; ctx.fillRect(x+10, y+bobY+14, 4, 10)
    // Legs
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(x+4, y+bobY+30, 6, 8); ctx.fillRect(x+14, y+bobY+30, 6, 8)
  } else if (id === 'sales') {
    // Head
    ctx.fillStyle = '#FF6B35'; ctx.fillRect(x+2, y+bobY-4, 20, 16)
    // Ears
    ctx.fillStyle = '#FF6B35'; ctx.fillRect(x-2, y+bobY, 4, 10); ctx.fillRect(x+22, y+bobY, 4, 10)
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x-2, y+bobY+2, 4, 6); ctx.fillRect(x+22, y+bobY+2, 4, 6)
    // Eyes
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+6, y+bobY+2, 3, 3); ctx.fillRect(x+15, y+bobY+2, 3, 3)
    // Body
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(x+2, y+bobY+12, 20, 18)
    ctx.fillStyle = '#FF6B35'; ctx.fillRect(x+9, y+bobY+12, 6, 18)
    // Legs
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(x+4, y+bobY+30, 6, 8); ctx.fillRect(x+14, y+bobY+30, 6, 8)
  } else if (id === 'marketing') {
    // Peacock feathers (top)
    ctx.fillStyle = '#A855F7'; ctx.fillRect(x+4, y+bobY-16, 4, 14); ctx.fillRect(x+10, y+bobY-20, 4, 18); ctx.fillRect(x+16, y+bobY-16, 4, 14)
    ctx.fillStyle = '#10B981'; ctx.fillRect(x+5, y+bobY-18, 2, 4); ctx.fillRect(x+11, y+bobY-22, 2, 4); ctx.fillRect(x+17, y+bobY-18, 2, 4)
    // Head
    ctx.fillStyle = '#A855F7'; ctx.fillRect(x+4, y+bobY, 16, 14)
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x+7, y+bobY+4, 3, 3); ctx.fillRect(x+14, y+bobY+4, 3, 3)
    // Body (wings spread)
    ctx.fillStyle = '#10B981'; ctx.fillRect(x-4, y+bobY+14, 8, 14); ctx.fillRect(x+20, y+bobY+14, 8, 14)
    ctx.fillStyle = '#A855F7'; ctx.fillRect(x+4, y+bobY+14, 16, 16)
    // Legs
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(x+6, y+bobY+30, 5, 8); ctx.fillRect(x+13, y+bobY+30, 5, 8)
  } else if (id === 'ops') {
    // Hard hat
    ctx.fillStyle = '#10B981'; ctx.fillRect(x+2, y+bobY-6, 20, 8)
    ctx.fillStyle = '#059669'; ctx.fillRect(x, y+bobY-4, 24, 4)
    // Head
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x+4, y+bobY+2, 16, 14)
    // Eyes
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+7, y+bobY+6, 3, 3); ctx.fillRect(x+14, y+bobY+6, 3, 3)
    // Body (wider, strong)
    ctx.fillStyle = '#10B981'; ctx.fillRect(x, y+bobY+16, 24, 18)
    ctx.fillStyle = '#059669'; ctx.fillRect(x+4, y+bobY+18, 16, 14)
    // Legs
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(x+3, y+bobY+34, 7, 6); ctx.fillRect(x+14, y+bobY+34, 7, 6)
  } else if (id === 'finance') {
    // Ears
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(x-2, y+bobY, 6, 10); ctx.fillRect(x+20, y+bobY, 6, 10)
    ctx.fillStyle = '#92400E'; ctx.fillRect(x-2, y+bobY+2, 6, 6); ctx.fillRect(x+20, y+bobY+2, 6, 6)
    // Head
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(x+2, y+bobY+2, 20, 16)
    // Eyes
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+6, y+bobY+6, 3, 3); ctx.fillRect(x+15, y+bobY+6, 3, 3)
    // Body
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(x+2, y+bobY+18, 20, 18)
    ctx.fillStyle = '#92400E'; ctx.fillRect(x+6, y+bobY+20, 12, 12)
    // Legs
    ctx.fillStyle = '#1e1e2e'; ctx.fillRect(x+4, y+bobY+36, 6, 6); ctx.fillRect(x+14, y+bobY+36, 6, 6)
  }
}

// ─── Draw office background ────────────────────────────────────────────────
function drawOffice(ctx, W, H) {
  // Floor
  ctx.fillStyle = '#0d0d1a'
  ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < FLOOR_COLS; x++) {
    for (let y = 0; y < FLOOR_ROWS; y++) {
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE)
    }
  }

  // Wall border
  ctx.strokeStyle = 'rgba(255,107,53,0.3)'
  ctx.lineWidth = 3
  ctx.strokeRect(4, 4, W - 8, H - 8)

  // Ceiling lights (horizontal lines)
  ctx.fillStyle = 'rgba(255,107,53,0.08)'
  ctx.fillRect(2 * TILE, 0, 8 * TILE, 4)
  ctx.fillRect(14 * TILE, 0, 8 * TILE, 4)

  // Draw all desks
  Object.entries(DEPTS).forEach(([id, dept]) => {
    drawDesk(ctx, dept.cx, dept.cy, dept.deskW, dept)
  })

  // Floor label "APEX HQ"
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('APEX HQ', W / 2, H - 16)
  ctx.textAlign = 'left'
}

export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const agentsRef = useRef({})
  const rafRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 1152, h: 768 })
  const [bubbles, setBubbles] = useState({})

  // Agent state machine
  const [agents, setAgents] = useState(() => {
    const initial = {}
    Object.keys(DEPTS).forEach(id => {
      const dept = DEPTS[id]
      initial[id] = {
        id, x: dept.cx * TILE, y: dept.cy * TILE,
        targetX: dept.cx * TILE, targetY: dept.cy * TILE,
        state: 'idle', frame: 0, frameTimer: 0, facing: 'right',
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
        if (s.status === 'working' && agentsRef.current[id].state === 'idle' && Math.random() < 0.01) {
          const dept = DEPTS[id]
          const angle = Math.random() * Math.PI * 2
          const r = 2 + Math.random() * 3
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

      // Update agents
      Object.values(agentsRef.current).forEach(agent => {
        const dx = agent.targetX - agent.x
        const dy = agent.targetY - agent.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 3) {
          agent.x += (dx / dist) * 80 * (dt / 1000)
          agent.y += (dy / dist) * 80 * (dt / 1000)
          agent.facing = dx > 0 ? 'right' : 'left'
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

      // Draw
      const scale = canvasSize.w / (FLOOR_COLS * TILE)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(scale, scale)
      drawOffice(ctx, FLOOR_COLS * TILE, FLOOR_ROWS * TILE)

      const sorted = Object.values(agentsRef.current).sort((a, b) => a.y - b.y)
      sorted.forEach(agent => {
        const working = agent.state === 'walking' || agent.status === 'working'
        drawAgent(ctx, agent.id, agent.x / TILE, agent.y / TILE, agent.frame, working, DEPTS[agent.id]?.color || '#fff')
      })

      ctx.restore()

      const newBubbles = {}
      Object.values(agentsRef.current).forEach(a => { if (a.speech) newBubbles[a.id] = { text: a.speech, visible: true } })
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
    Object.values(agentsRef.current).forEach(agent => {
      const d = Math.sqrt((clickX - agent.x) ** 2 + (clickY - agent.y) ** 2)
      if (d < 30) clicked = agent
    })

    if (clicked) {
      onAgentClick && onAgentClick(clicked.id)
      const speeches = {
        ceo: ['Q3 strategy is GO — execute.', 'Team, I\'m watching. Make it happen.', 'No excuses. Just results.', 'The vision is clear. Follow it.'],
        sales: ['Felix is CLOSING today!', 'Pipeline update — let\'s go!', '3 new leads just hit my desk.', 'Felix ready to crush it!'],
        marketing: ['Phoenix has the FLOOR.', 'Content is KING today.', 'Socials are about to blow up.', 'Brand game: STRONG.'],
        ops: ['Axel has everything under control.', 'All systems: GREEN.', 'Efficiency up 15% this week.', 'Zero issues. Maximum output.'],
        finance: ['Bruno watching every penny.', 'Revenue tracking: healthy.', 'Invoices cleared, budgets locked.', 'Books are BALANCED.'],
      }
      const opts = speeches[clicked.id] || ['']
      const speech = opts[Math.floor(Math.random() * opts.length)]
      agentsRef.current[clicked.id].speech = speech
      agentsRef.current[clicked.id].speechTimer = 3500
    }
  }, [onAgentClick])

  return (
    <div ref={containerRef} className="relative flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className="cursor-pointer w-full h-full rounded-2xl"
        style={{ display: 'block', border: '2px solid rgba(255,107,53,0.4)', background: '#0d0d1a' }}
        onClick={handleCanvasClick}
      />

      {/* Speech bubbles */}
      {Object.entries(bubbles).map(([id, { text }]) => {
        const agent = agents[id]
        if (!agent) return null
        const scale = canvasSize.w / (FLOOR_COLS * TILE)
        return (
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{
              left: (agent.x / TILE * scale) - 40,
              top: (agent.y / TILE * scale) - 60,
              width: 100,
              textAlign: 'center',
            }}
          >
            <div className="px-3 py-1.5 rounded-2xl text-xs font-bold text-white whitespace-nowrap animate-fade-up"
              style={{ backgroundColor: DEPTS[id]?.color, boxShadow: `0 0 12px ${DEPTS[id]?.color}60` }}>
              {DEPTS[id]?.emoji} {text}
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-up { animation: fade-up 3.5s ease-out forwards; }
      `}</style>
    </div>
  )
}
