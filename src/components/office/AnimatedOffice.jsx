import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ChatPanel } from './ChatPanel'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

// ─── Pixel art office floor (canvas-based) ────────────────────────────────
const TILE = 32       // pixels per tile
const FLOOR_COLS = 20  // grid width
const FLOOR_ROWS = 14  // grid height

const DEPTS = {
  ceo:      { name: 'Leadership',  color: '#EF4444', dark: '#450a0a', emoji: '🦁', desk: { col: 8, row: 1 }, accent: '#7f1d1d' },
  sales:    { name: 'Sales',       color: '#FF6B35', dark: '#431407', emoji: '🦊', desk: { col: 2, row: 6 }, accent: '#7c2d12' },
  marketing:{ name: 'Marketing',   color: '#A855F7', dark: '#3b0764', emoji: '🦚', desk: { col: 17, row: 6 }, accent: '#581c87' },
  ops:      { name: 'Operations',  color: '#10B981', dark: '#022c22', emoji: '🦡', desk: { col: 2, row: 10 }, accent: '#064e3b' },
  finance:  { name: 'Finance',     color: '#F59E0B', dark: '#451a03', emoji: '🐻', desk: { col: 17, row: 10 }, accent: '#78350f' },
}

// ─── Pixel sprites for each agent (8-frame walk cycle) ────────────────────
const SPRITE_COLORS = {
  ceo:      { body: '#F59E0B', mane: '#D97706', tie: '#EF4444', skin: '#FDE68A' },
  sales:    { body: '#FF6B35', suit: '#FF6B35', skin: '#FDE68A' },
  marketing:{ body: '#A855F7', wings: '#C084FC', skin: '#FDE68A' },
  ops:      { body: '#10B981', hat: '#059669', skin: '#FDE68A' },
  finance:  { body: '#F59E0B', bear: '#D97706', skin: '#92400E' },
}

// ─── Walk cycle frames (16×16 pixel art, each frame = 4×16 strip) ───────────
function drawAgent(ctx, agentId, frame, direction, working, x, y) {
  const c = SPRITE_COLORS[agentId]
  const f = frame % 4
  const flip = direction === 'left'
  ctx.save()
  ctx.translate(x + 12, y + 16)
  if (flip) ctx.scale(-1, 1)
  ctx.translate(-12, -16)

  if (!working) {
    // ── Idle at desk ────────────────────────────────────────────────────────
    // Body / torso
    ctx.fillStyle = c.body; ctx.fillRect(4, 8, 8, 8)
    // Head
    ctx.fillStyle = c.skin || '#FDE68A'; ctx.fillRect(5, 1, 6, 6)
    // Eyes
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(7, 3, 1, 1); ctx.fillRect(9, 3, 1, 1)
    // Legs
    ctx.fillStyle = c.body; ctx.fillRect(5, 16, 3, 4); ctx.fillRect(8, 16, 3, 4)
  } else {
    // ── Walking ────────────────────────────────────────────────────────────
    const bobY = [0, -1, 0, -1][f]
    const leftLeg = [0, 2, 0, -2][f]
    const rightLeg = [0, -2, 0, 2][f]
    const swingArm = [1, 0, -1, 0][f]

    // Body
    ctx.fillStyle = c.body; ctx.fillRect(4, 6 + bobY, 8, 8)
    // Head
    ctx.fillStyle = c.skin || '#FDE68A'; ctx.fillRect(5, 0 + bobY, 6, 6)
    // Eyes (looking forward)
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(7, 2 + bobY, 1, 1); ctx.fillRect(9, 2 + bobY, 1, 1)
    // Arm swing
    ctx.fillStyle = c.body
    ctx.fillRect(1, 7 + bobY + swingArm, 3, 2)
    ctx.fillRect(12, 7 + bobY - swingArm, 3, 2)
    // Legs with walk motion
    ctx.fillRect(5, 14 + leftLeg, 3, 5)
    ctx.fillRect(8, 14 + rightLeg, 3, 5)
  }

  ctx.restore()
}

// ─── Draw office background ────────────────────────────────────────────────
function drawOffice(ctx, W, H) {
  // Floor
  ctx.fillStyle = '#0f0f1a'
  ctx.fillRect(0, 0, W, H)

  // Subtle tile grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < FLOOR_COLS; x++) {
    for (let y = 0; y < FLOOR_ROWS; y++) {
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE)
    }
  }

  // Draw desks
  Object.entries(DEPTS).forEach(([id, dept]) => {
    const dx = dept.desk.col * TILE
    const dy = dept.desk.row * TILE

    // Department area tint
    ctx.fillStyle = dept.dark + '30'
    ctx.fillRect(dx - 8, dy - 8, TILE * 3 + 16, TILE * 2 + 16)

    // Desk
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(dx + 8, dy + 20, TILE * 2, TILE - 4)
    // Desk edge
    ctx.fillStyle = dept.color
    ctx.fillRect(dx + 8, dy + 20, TILE * 2, 3)
    // Monitor
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(dx + TILE - 4, dy + 8, TILE + 8, 14)
    ctx.fillStyle = dept.color + '60'
    ctx.fillRect(dx + TILE - 2, dy + 10, TILE + 4, 10)
    // Chair
    ctx.fillStyle = dept.dark
    ctx.fillRect(dx + TILE, dy + 22, TILE, 8)

    // Department label
    ctx.fillStyle = dept.color
    ctx.font = 'bold 10px monospace'
    ctx.fillText(dept.emoji, dx + 16, dy + 6)
  })

  // Office walls / border
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, W - 8, H - 8)

  // Decorative elements — plants, water cooler, coffee station
  const decor = [
    { type: 'plant', col: 0, row: 0 }, { type: 'plant', col: 19, row: 0 },
    { type: 'coffee', col: 9, row: 0 }, { type: 'water', col: 10, row: 0 },
    { type: 'plant', col: 0, row: 13 }, { type: 'plant', col: 19, row: 13 },
  ]
  decor.forEach(d => {
    const px = d.col * TILE + 8
    const py = d.row * TILE + 8
    if (d.type === 'plant') {
      ctx.fillStyle = '#065f46'; ctx.fillRect(px, py, 16, 16)
      ctx.fillStyle = '#10B981'; ctx.fillRect(px + 2, py - 4, 12, 10)
    } else if (d.type === 'coffee') {
      ctx.fillStyle = '#78350f'; ctx.fillRect(px, py, 16, 16)
      ctx.fillStyle = '#92400e'; ctx.fillRect(px + 2, py + 2, 12, 8)
    } else {
      ctx.fillStyle = '#1e40af'; ctx.fillRect(px, py, 16, 16)
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(px + 2, py + 2, 12, 12)
    }
  })
}

// ─── Speech bubble ─────────────────────────────────────────────────────────
function SpeechBubble({ text, agentId, visible }) {
  if (!visible || !text) return null
  const dept = DEPTS[agentId]
  return (
    <div
      className="absolute pointer-events-none transition-all duration-300"
      style={{
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 4,
      }}
    >
      <div
        className="px-3 py-1.5 rounded-2xl text-xs text-white font-medium whitespace-nowrap animate-fade-up"
        style={{ backgroundColor: dept.color, boxShadow: `0 0 12px ${dept.color}60` }}
      >
        <span className="mr-1">{dept.emoji}</span>
        {text}
      </div>
    </div>
  )
}

// ─── Main Animated Office Canvas ──────────────────────────────────────────
export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const canvasRef = useRef(null)
  const agentsRef = useRef({})
  const rafRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ w: 640, h: 448 })
  const [bubbles, setBubbles] = useState({}) // agentId -> { text, visible }

  // Agent state machine
  const [agents, setAgents] = useState(() => {
    const initial = {}
    Object.keys(DEPTS).forEach(id => {
      const dept = DEPTS[id]
      initial[id] = {
        id,
        x: dept.desk.col * TILE,
        y: dept.desk.row * TILE,
        targetX: dept.desk.col * TILE,
        targetY: dept.desk.row * TILE,
        state: 'idle',   // idle | walking | talking | back
        dest: null,       // { col, row }
        frame: 0,
        frameTimer: 0,
        facing: 'right',
        status: 'idle',
        speech: '',
        speechTimer: 0,
      }
    })
    return initial
  })

  // Sync agent status from Supabase
  useEffect(() => {
    Object.entries(agentStatuses).forEach(([id, s]) => {
      if (agentsRef.current[id]) {
        agentsRef.current[id].status = s.status
        if (s.status === 'working' && agentsRef.current[id].state === 'idle') {
          // Start random walk
          const depts = DEPTS[id]
          const targets = [
            { col: depts.desk.col + 4, row: depts.desk.row },
            { col: depts.desk.col - 3, row: depts.desk.row },
            { col: depts.desk.col, row: depts.desk.row - 2 },
            { col: depts.desk.col, row: depts.desk.row + 2 },
          ]
          const t = targets[Math.floor(Math.random() * targets.length)]
          agentsRef.current[id].targetX = t.col * TILE
          agentsRef.current[id].targetY = t.row * TILE
          agentsRef.current[id].state = 'walking'
        }
      }
    })
  }, [agentStatuses])

  // Canvas resize
  useEffect(() => {
    const update = () => {
      const containerW = canvasRef.current?.parentElement?.clientWidth || window.innerWidth
      const maxW = Math.min(containerW - 16, FLOOR_COLS * TILE)
      const scale = maxW / (FLOOR_COLS * TILE)
      setCanvasSize({ w: Math.max(320, FLOOR_COLS * TILE * scale), h: Math.max(224, FLOOR_ROWS * TILE * scale) })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Main render loop
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
        const speed = 60  // pixels per second
        const dx = agent.targetX - agent.x
        const dy = agent.targetY - agent.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 2) {
          agent.x += (dx / dist) * speed * (dt / 1000)
          agent.y += (dy / dist) * speed * (dt / 1000)
          agent.facing = dx > 0 ? 'right' : 'left'
          agent.frameTimer += dt
          if (agent.frameTimer > 120) { agent.frame++; agent.frameTimer = 0 }
        } else {
          if (agent.state === 'walking') {
            agent.state = 'idle'
            agent.frame = 0
          }
          // Random walk when working
          if (agent.status === 'working' && agent.state === 'idle' && Math.random() < 0.002) {
            const id = agent.id
            const depts = DEPTS[id]
            const targets = [
              { col: depts.desk.col + 4, row: depts.desk.row },
              { col: depts.desk.col - 3, row: depts.desk.row },
              { col: depts.desk.col, row: depts.desk.row - 2 },
              { col: depts.desk.col, row: depts.desk.row + 2 },
              { col: Math.floor(Math.random() * FLOOR_COLS), row: Math.floor(Math.random() * FLOOR_ROWS) },
            ]
            const t = targets[Math.floor(Math.random() * targets.length)]
            agent.targetX = t.col * TILE
            agent.targetY = t.row * TILE
            agent.state = 'walking'
          }
        }

        // Speech timer
        if (agent.speechTimer > 0) {
          agent.speechTimer -= dt
          if (agent.speechTimer <= 0) {
            agent.speech = ''
          }
        }
      })

      // Draw
      const scale = canvasSize.w / (FLOOR_COLS * TILE)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(scale, scale)

      drawOffice(ctx, FLOOR_COLS * TILE, FLOOR_ROWS * TILE)

      // Draw agents sorted by Y (painter's algorithm)
      const sortedAgents = Object.values(agentsRef.current).sort((a, b) => a.y - b.y)
      sortedAgents.forEach(agent => {
        const working = agent.state === 'walking' || agent.status === 'working'
        drawAgent(ctx, agent.id, agent.frame, agent.facing, working, agent.x, agent.y)
      })

      ctx.restore()

      // Update bubbles state for React
      const newBubbles = {}
      Object.values(agentsRef.current).forEach(a => {
        if (a.speech) newBubbles[a.id] = { text: a.speech, visible: true }
      })
      setBubbles(prev => {
        const changed = JSON.stringify(prev) !== JSON.stringify(newBubbles)
        return changed ? newBubbles : prev
      })

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [canvasSize])

  // Sync agents state to ref for animation loop
  useEffect(() => {
    agentsRef.current = agents
  }, [agents])

  // Agent click handler — start talking
  const handleCanvasClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = (FLOOR_COLS * TILE) / rect.width
    const scaleY = (FLOOR_ROWS * TILE) / rect.height
    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    // Find clicked agent
    const CLICK_RADIUS = 24
    let clicked = null
    Object.values(agentsRef.current).forEach(agent => {
      const ax = agent.x + 12
      const ay = agent.y + 12
      const d = Math.sqrt((clickX - ax) ** 2 + (clickY - ay) ** 2)
      if (d < CLICK_RADIUS) clicked = agent
    })

    if (clicked) {
      onAgentClick && onAgentClick(clicked.id)
      // Random speech bubble
      const speeches = {
        ceo: ['Approving Q3 strategy now', 'Team morale: excellent', 'Budget approved', 'Let\'s scale faster'],
        sales: ['Closing deal with TechCorp', '3 new leads today', 'Pipeline looks strong', 'Felix out here grinding'],
        marketing: ['New reel hitting 50K views', 'Brand awareness up 200%', 'Content calendar synced', 'Phoenix on fire'],
        ops: ['All systems operational', 'Task queue cleared', 'Automation running smooth', 'Zero issues today'],
        finance: ['Invoice #15 just paid', 'Revenue up 18% this month', 'Budgets all balanced', 'Bruno keeping us steady'],
      }
      const opts = speeches[clicked.id] || ['']
      const speech = opts[Math.floor(Math.random() * opts.length)]
      agentsRef.current[clicked.id].speech = speech
      agentsRef.current[clicked.id].speechTimer = 3000
    }
  }, [onAgentClick])

  return (
    <div className="relative rounded-2xl border border-white/10 overflow-hidden" style={{ minHeight: '420px', backgroundColor: '#0f0f1a' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className="cursor-pointer w-full"
        style={{ imageRendering: 'pixelated', display: 'block' }}
        onClick={handleCanvasClick}
      />

      {/* Speech bubbles overlay */}
      {Object.entries(bubbles).map(([id, { text }]) => {
        const agent = agents[id]
        if (!agent) return null
        const scale = canvasSize.w / (FLOOR_COLS * TILE)
        return (
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{
              left: agent.x * scale,
              top: agent.y * scale - 8,
              width: 80,
              textAlign: 'center',
            }}
          >
            <SpeechBubble text={text} agentId={id} visible />
          </div>
        )
      })}

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-4px); }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
