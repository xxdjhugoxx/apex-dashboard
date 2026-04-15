import React, { useState, useEffect, useRef, useCallback } from 'react'

const WORKERS = [
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#374151', label: 'Felix'   },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#7C3AED', label: 'Phoenix' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#059669', label: 'Axel'    },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#D97706', label: 'Bruno'   },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#DB2777', label: 'Blaze'   },
  { id: 'engineer',  name: 'Atlas',   emoji: '🤖', color: '#0891B2', label: 'Atlas'   },
]

// ─── Simple iconic avatar (colored rectangle on stem) ───────────────────────
function Avatar({ color, emoji, label, size = 64, isHugo }) {
  return (
    <div className="flex flex-col items-center" style={{ width: size + 20 }}>
      {/* Avatar rectangle */}
      <div
        className="rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
        style={{
          width: isHugo ? 56 : 44,
          height: isHugo ? 72 : 52,
          backgroundColor: color,
          fontSize: isHugo ? 24 : 18,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <span>{emoji}</span>
      </div>
      {/* Stem/stand */}
      <div style={{ width: 4, height: 12, backgroundColor: '#d1d5db' }} />
      {/* Label */}
      <div
        className="mt-1 text-center font-bold text-gray-700 whitespace-nowrap"
        style={{ fontSize: 11 }}
      >
        {label}
      </div>
    </div>
  )
}

// ─── Boss Avatar (Hugo) ──────────────────────────────────────────────────────
function BossAvatar() {
  return (
    <div className="flex flex-col items-center">
      {/* Crown */}
      <div className="relative" style={{ width: 60, height: 20 }}>
        <div
          className="absolute inset-x-0 bottom-0 mx-auto rounded-t-lg"
          style={{
            width: 56,
            height: 16,
            backgroundColor: '#F59E0B',
            clipPath: 'polygon(0 100%, 15% 30%, 30% 100%, 45% 0%, 55% 0%, 70% 100%, 85% 30%, 100% 100%)',
          }}
        />
      </div>
      {/* Hugo body */}
      <div
        className="rounded-lg flex items-center justify-center shadow-lg"
        style={{
          width: 64,
          height: 80,
          backgroundColor: '#7C2D12',
          fontSize: 32,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <span>🦁</span>
      </div>
      {/* Name */}
      <div className="mt-2 text-center font-bold" style={{ fontSize: 13, color: '#DC2626' }}>
        HUGO
      </div>
    </div>
  )
}

// ─── Desk divider line ──────────────────────────────────────────────────────
function DeskLine({ color, width = '100%', isBoss }) {
  return (
    <div
      className="rounded-full shadow-sm"
      style={{
        width,
        height: isBoss ? 6 : 4,
        backgroundColor: isBoss ? '#EF4444' : color,
        margin: '0 auto',
      }}
    />
  )
}

// ─── Long bench desk ────────────────────────────────────────────────────────
function BenchDesk({ children }) {
  return (
    <div className="relative">
      {/* Desk surface */}
      <div
        className="rounded-2xl shadow-md"
        style={{
          backgroundColor: '#e5e7eb',
          height: 8,
          border: '2px solid #d1d5db',
          borderBottom: 'none',
        }}
      />
      {/* Desk front */}
      <div
        style={{
          height: 32,
          backgroundColor: '#f3f4f6',
          border: '2px solid #d1d5db',
          borderTop: 'none',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      />
      {/* Workers row */}
      <div className="flex items-end justify-center gap-4 mt-2">
        {children}
      </div>
    </div>
  )
}

// ─── Main Office Component ──────────────────────────────────────────────────
export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const [activeSpeech, setActiveSpeech] = useState(null)

  const handleClick = (id) => {
    onAgentClick && onAgentClick(id)
    const speeches = {
      ceo: ['Q3 is GO!', 'Execute.', 'Results.'],
      sales: ['Felix ON IT!', 'Pipeline strong.', 'Closing!'],
      marketing: ['Phoenix has the floor.', 'Going viral.'],
      ops: ['Axel handling it.', 'Systems GREEN.'],
      finance: ['Bruno on it.', 'Books balanced.'],
      instagram: ['Blaze posting!', 'Reel LIVE!'],
      engineer: ['Atlas deploying.', 'Code CLEAN.'],
    }
    const opts = speeches[id] || ['']
    const speech = opts[Math.floor(Math.random() * opts.length)]
    setActiveSpeech({ id, text: speech })
    setTimeout(() => setActiveSpeech(null), 3000)
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ backgroundColor: '#f9fafb' }}
    >
      {/* Checkerboard floor pattern via CSS */}
      <div
        className="flex-1 grid opacity-30"
        style={{
          gridTemplateColumns: 'repeat(20, 1fr)',
          gridTemplateRows: 'repeat(10, 1fr)',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200"
            style={{ backgroundColor: (Math.floor(i / 20) + (i % 20)) % 2 === 0 ? '#f3f4f6' : '#ffffff' }}
          />
        ))}
      </div>

      {/* Office content */}
      <div className="relative flex-1 flex flex-col justify-between p-6">

        {/* ── Top Wall / Header ────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6"
          style={{
            backgroundColor: '#1f2937',
            margin: '0 -24px',
            padding: '0 24px',
            borderBottom: '4px solid #374151',
          }}
        >
          <span className="text-gray-400 font-bold text-xs tracking-widest">APEX HQ</span>
          <div className="flex gap-4">
            {/* Windows */}
            <div className="rounded bg-blue-800 flex-1" style={{ width: 80, height: 32 }}>
              <div className="w-full h-full rounded" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }} />
            </div>
            <div className="rounded bg-blue-800 flex-1" style={{ width: 80, height: 32 }}>
              <div className="w-full h-full rounded" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }} />
            </div>
          </div>
        </div>

        {/* ── Boss Section (Hugo at top) ─────────────────── */}
        <div className="flex flex-col items-center mt-6 mb-8" onClick={() => handleClick('ceo')}>
          {/* Speech bubble */}
          {activeSpeech?.id === 'ceo' && (
            <div className="mb-2 px-4 py-2 rounded-2xl bg-red-500 text-white text-xs font-bold animate-fade-up shadow-lg">
              🦁 {activeSpeech.text}
            </div>
          )}
          <BossAvatar />
          {/* Boss desk */}
          <div className="mt-3">
            <DeskLine color="#EF4444" width={160} isBoss />
          </div>
        </div>

        {/* ── Vertical separator (boss looking down) ─────── */}
        <div className="flex-1 flex items-center justify-center">
          <div className="border-l-2 border-dashed border-gray-300" style={{ height: 40 }} />
        </div>

        {/* ── Workers Section ────────────────────────────── */}
        <div className="flex flex-col items-center" onClick={() => handleClick(WORKERS[Math.floor(Math.random() * WORKERS.length)].id)}>
          {/* Workers row */}
          <BenchDesk>
            {WORKERS.map(worker => (
              <div
                key={worker.id}
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => { e.stopPropagation(); handleClick(worker.id) }}
              >
                {/* Speech bubble */}
                {activeSpeech?.id === worker.id && (
                  <div
                    className="mb-1 px-3 py-1 rounded-xl text-white text-xs font-bold animate-fade-up shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: worker.color }}
                  >
                    {worker.emoji} {activeSpeech.text}
                  </div>
                )}
                <Avatar {...worker} />
                {/* Desk segment */}
                <div
                  className="mt-1 rounded-full"
                  style={{ width: 4, height: 20, backgroundColor: '#d1d5db' }}
                />
              </div>
            ))}
          </BenchDesk>

          {/* Desk surface line across all workers */}
          <div
            className="mt-1 mx-8 rounded-full"
            style={{ height: 4, backgroundColor: '#d1d5db', width: 'calc(100% - 4rem)' }}
          />
        </div>

      </div>

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
