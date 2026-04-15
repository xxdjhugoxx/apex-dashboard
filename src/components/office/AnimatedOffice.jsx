import React, { useState, useEffect, useRef } from 'react'

const DEPARTMENTS = [
  { id: 'sales',     name: 'SALES',     color: '#0D9488', worker: { name: 'Felix',   emoji: '🦊' } },
  { id: 'marketing', name: 'MARKETING', color: '#7C3AED', worker: { name: 'Phoenix', emoji: '🦚' } },
  { id: 'ops',       name: 'OPERATIONS',color: '#2563EB', worker: { name: 'Axel',   emoji: '🦡' } },
  { id: 'finance',   name: 'FINANCE',   color: '#65A30D', worker: { name: 'Bruno',   emoji: '🐻' } },
  { id: 'instagram', name: 'INSTAGRAM', color: '#DB2777', worker: { name: 'Blaze',   emoji: '📸' } },
  { id: 'engineer',  name: 'ENGINEERING',color: '#0891B2', worker: { name: 'Atlas',  emoji: '🤖' } },
]

const STATUS_COLORS = {
  working:   { bg: '#FDE047', text: '#713F12', label: 'WORKING' },
  delivering:{ bg: '#86EFAC', text: '#14532D', label: 'DELIVERING' },
  finished:  { bg: '#93C5FD', text: '#1E3A8A', label: 'FINISHED' },
}

const STATUSES = ['working', 'delivering', 'finished']

// ─── Mini status tag ──────────────────────────────────────────────────────
function StatusTag({ status }) {
  const s = STATUS_COLORS[status]
  return (
    <div
      className="rounded px-1.5 py-0.5 font-bold"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        fontSize: 8,
        letterSpacing: 0.5,
      }}
    >
      {s.label}
    </div>
  )
}

// ─── Desk (top-down: brown rectangle + dark monitor) ──────────────────────
function Desk({ color, isHugo, isEmpty }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Monitor */}
      <div
        className="rounded"
        style={{
          width: isHugo ? 36 : 28,
          height: isHugo ? 26 : 20,
          backgroundColor: '#1f2937',
          border: `2px solid ${color}`,
          position: 'relative',
        }}
      >
        <div
          className="rounded-sm"
          style={{
            margin: 2,
            width: 'calc(100% - 4px)',
            height: 'calc(100% - 4px)',
            backgroundColor: color + '50',
          }}
        />
        {/* Status dot on monitor */}
        <div
          className="absolute rounded-full"
          style={{
            width: 5,
            height: 5,
            backgroundColor: '#86EFAC',
            top: 2,
            right: 2,
          }}
        />
      </div>
      {/* Desk surface */}
      <div
        className="rounded"
        style={{
          width: isHugo ? 42 : 34,
          height: isHugo ? 8 : 6,
          backgroundColor: '#92400E',
          border: `1px solid #78350F`,
        }}
      />
      {/* Person (if not empty) */}
      {!isEmpty && (
        <div
          className="rounded-full flex items-center justify-center text-white font-bold border-2"
          style={{
            width: isHugo ? 28 : 22,
            height: isHugo ? 28 : 22,
            backgroundColor: isHugo ? '#7f1d1d' : color,
            borderColor: isHugo ? '#EF4444' : color,
            fontSize: isHugo ? 12 : 9,
            marginTop: 1,
          }}
        >
          {isHugo ? '🦁' : null}
        </div>
      )}
    </div>
  )
}

// ─── Department pod ────────────────────────────────────────────────────────
function Pod({ dept, status, onClick }) {
  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        border: `3px solid ${dept.color}`,
        backgroundColor: '#ffffff',
        minWidth: 140,
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: dept.color }}
      >
        <span
          className="text-white font-black tracking-widest"
          style={{ fontSize: 10 }}
        >
          {dept.name}
        </span>
        <StatusTag status={status} />
      </div>

      {/* Content area */}
      <div className="p-2 flex flex-col items-center gap-2">
        {/* Worker avatar + info */}
        <div className="flex flex-col items-center">
          <div
            className="rounded-full flex items-center justify-center text-white font-bold border-2 shadow-sm"
            style={{
              width: 38,
              height: 38,
              backgroundColor: dept.color,
              borderColor: dept.color,
              fontSize: 18,
            }}
          >
            {dept.worker.emoji}
          </div>
          <div
            className="font-bold text-gray-700 mt-1"
            style={{ fontSize: 10 }}
          >
            {dept.worker.name}
          </div>
        </div>

        {/* Desk row */}
        <div className="flex gap-2 items-end">
          {/* 3 mini desks */}
          {[0,1,2].map(i => (
            <Desk key={i} color={dept.color} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Boss pod ──────────────────────────────────────────────────────────────
function BossPod({ speech }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: '3px solid #EF4444',
        backgroundColor: '#ffffff',
        minWidth: 200,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: '#EF4444' }}
      >
        <span
          className="text-white font-black tracking-widest"
          style={{ fontSize: 11 }}
        >
          CHIEF EXECUTIVE
        </span>
        <StatusTag status="delivering" />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col items-center gap-2">
        {/* Hugo avatar */}
        <div className="flex flex-col items-center relative">
          {/* Crown */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '16px solid transparent',
            borderRight: '16px solid transparent',
            borderBottom: '10px solid #F59E0B',
            marginBottom: -2,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }} />
          <div
            className="rounded-full flex items-center justify-center text-white font-bold border-2 shadow-lg"
            style={{
              width: 52,
              height: 52,
              backgroundColor: '#7f1d1d',
              borderColor: '#EF4444',
              fontSize: 26,
            }}
          >
            🦁
          </div>
          <div className="font-black text-red-600 mt-1 tracking-widest" style={{ fontSize: 12 }}>HUGO</div>

          {/* Speech bubble */}
          {speech && (
            <div
              className="animate-fade-up px-3 py-1.5 rounded-xl shadow-lg text-white text-xs font-bold"
              style={{
                position: 'absolute',
                top: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: speech.color || '#EF4444',
                whiteSpace: 'nowrap',
                zIndex: 50,
              }}
            >
              {speech.emoji} {speech.text}
            </div>
          )}
        </div>

        {/* Desk row */}
        <div className="flex gap-3 items-end mt-1">
          {[0,1,2].map(i => (
            <Desk key={i} color="#EF4444" isHugo />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Server racks (top corners decoration) ────────────────────────────────
function ServerRack({ side }) {
  return (
    <div
      className="flex flex-col gap-0.5 px-1.5 py-2 rounded"
      style={{
        backgroundColor: '#374151',
        width: side === 'left' ? 60 : 80,
        height: 60,
      }}
    >
      {[0,1,2,3].map(i => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            flex: 1,
            backgroundColor: '#1f2937',
            border: '1px solid #4b5563',
            display: 'flex',
            gap: 2,
            padding: 2,
          }}
        >
          {[0,1,2,3].map(j => (
            <div
              key={j}
              className="flex-1 rounded-sm"
              style={{
                backgroundColor: i % 2 === 0 ? '#22c55e' : '#ef4444',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Main Office ───────────────────────────────────────────────────────────
export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const [deptStatuses, setDeptStatuses] = useState(
    Object.fromEntries(DEPARTMENTS.map(d => [d.id, 'working']))
  )
  const [activeSpeech, setActiveSpeech] = useState(null) // { deptId, text, emoji }

  // Simulate status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomDept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]
      const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)]
      setDeptStatuses(prev => ({ ...prev, [randomDept.id]: randomStatus }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Simulate speech from random department
  useEffect(() => {
    const speeches = {
      sales:     ['Lead incoming! 💰', 'Deal closing! 🎉', 'Pipeline strong!'],
      marketing: ['Post live! 🚀', 'Going viral! 📈', 'Campaign launched!'],
      ops:       ['Task done ✅', 'Systems GREEN', 'Scheduler updated'],
      finance:   ['Burn: 94% 📊', 'Invoice sent', 'Budget on track'],
      instagram: ['Reel uploaded! 🎬', '+23% engagement', 'Story posted!'],
      engineer:  ['Build done ⚙️', 'Deployed! 🚀', 'Code merged'],
    }
    const interval = setInterval(() => {
      const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]
      const opts = speeches[dept.id]
      const text = opts[Math.floor(Math.random() * opts.length)]
      setActiveSpeech({ deptId: dept.id, text, emoji: dept.worker.emoji, color: dept.color })
      setTimeout(() => setActiveSpeech(null), 3000)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handlePodClick = (dept) => {
    onAgentClick && onAgentClick(dept.id)
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ backgroundColor: '#f3f4f6' }}
    >
      {/* ── Header bar ── */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '4px solid #374151',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#f3f4f6',
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 3,
          fontFamily: 'monospace',
        }}>🏢 APEX HQ</span>
        <div style={{ flex: 1 }} />
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <div className="rounded-full" style={{
            width: 7,
            height: 7,
            backgroundColor: '#22c55e',
            boxShadow: '0 0 6px #22c55e',
          }} />
          <span style={{ color: '#86efac', fontSize: 10, fontWeight: 'bold' }}>LIVE</span>
        </div>
      </div>

      {/* ── Grid floor ── */}
      <div
        className="flex-1 grid gap-4 p-4 overflow-auto"
        style={{
          backgroundColor: '#e5e7eb',
          backgroundImage: `
            linear-gradient(rgba(209,213,219,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(209,213,219,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          alignContent: 'start',
        }}
      >
        {/* Server racks top corners */}
        <div className="absolute top-14 left-2">
          <ServerRack side="left" />
        </div>
        <div className="absolute top-14 right-2">
          <ServerRack side="right" />
        </div>

        {/* ── Boss row ── */}
        <div className="col-span-full flex justify-center mt-2">
          <div className="relative">
            <BossPod speech={activeSpeech?.deptId === 'ceo' ? activeSpeech : null} />
          </div>
        </div>

        {/* ── Department pods grid (2×3) ── */}
        <div
          className="col-span-full grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          {DEPARTMENTS.map(dept => (
            <div key={dept.id} className="flex justify-center">
              <Pod
                dept={dept}
                status={deptStatuses[dept.id]}
                onClick={() => handlePodClick(dept)}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateX(-50%) translateY(6px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
