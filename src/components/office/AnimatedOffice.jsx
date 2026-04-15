import React, { useState } from 'react'

const WORKERS = [
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35', bg: '#431407' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7', bg: '#3b0764' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981', bg: '#022c22' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B', bg: '#451a03' },
  { id: 'instagram',  name: 'Blaze',  emoji: '📸', color: '#EC4899', bg: '#500724' },
  { id: 'engineer',  name: 'Atlas',  emoji: '🤖', color: '#06B6D4', bg: '#083344' },
]

// ─── Worker desk with monitor ───────────────────────────────────────────────
function WorkerDesk({ worker }) {
  return (
    <div className="flex flex-col items-center" style={{ width: 90 }}>
      {/* Avatar block sitting at desk */}
      <div
        className="rounded-xl flex items-center justify-center text-white font-bold shadow-lg relative z-10"
        style={{
          width: 44,
          height: 52,
          backgroundColor: worker.color,
          fontSize: 20,
          marginBottom: -6,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <span>{worker.emoji}</span>
      </div>

      {/* Desk surface */}
      <div
        className="w-full rounded-lg"
        style={{
          height: 10,
          backgroundColor: '#e5e7eb',
          border: '2px solid #d1d5db',
          borderTop: 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Monitor on desk */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-20 rounded"
          style={{
            width: 52,
            height: 36,
            backgroundColor: '#1f2937',
            border: '2px solid #374151',
          }}
        >
          {/* Screen glow */}
          <div
            className="m-1 rounded-sm"
            style={{
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)',
              backgroundColor: worker.color + '50',
            }}
          />
        </div>
        {/* Stand */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-5"
          style={{ width: 8, height: 8, backgroundColor: '#6b7280' }}
        />
      </div>

      {/* Name */}
      <div className="mt-2 text-center">
        <div className="text-gray-700 font-bold text-xs">{worker.name}</div>
        <div className="text-gray-400 text-[9px]">{worker.emoji}</div>
      </div>
    </div>
  )
}

// ─── Boss desk ───────────────────────────────────────────────────────────────
function BossDesk() {
  return (
    <div className="flex flex-col items-center">
      {/* Crown */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '20px solid transparent',
        borderRight: '20px solid transparent',
        borderBottom: '14px solid #F59E0B',
        marginBottom: -4,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      }} />

      {/* Hugo block */}
      <div
        className="rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
        style={{
          width: 64,
          height: 72,
          backgroundColor: '#7f1d1d',
          fontSize: 32,
          border: '3px solid #EF4444',
        }}
      >
        🦁
      </div>

      {/* Big desk */}
      <div
        className="w-full rounded-lg mt-0.5"
        style={{
          height: 14,
          backgroundColor: '#e5e7eb',
          border: '3px solid #EF4444',
          borderTop: 'none',
          position: 'relative',
        }}
      >
        {/* Large monitor */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-24 rounded"
          style={{
            width: 72,
            height: 50,
            backgroundColor: '#1f2937',
            border: '3px solid #EF4444',
          }}
        >
          <div
            className="m-1.5 rounded-sm"
            style={{
              width: 'calc(100% - 10px)',
              height: 'calc(100% - 10px)',
              backgroundColor: '#EF444440',
            }}
          />
        </div>
        {/* Stand */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-7"
          style={{ width: 10, height: 10, backgroundColor: '#EF4444' }}
        />
      </div>

      <div className="mt-2 text-center">
        <div className="text-red-600 font-bold text-sm tracking-wide">HUGO</div>
        <div className="text-red-300 text-[9px]">BOSS</div>
      </div>
    </div>
  )
}

// ─── Main Office ─────────────────────────────────────────────────────────────
export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const [speech, setSpeech] = useState(null)

  const handleClick = (id) => {
    onAgentClick && onAgentClick(id)
    const lines = {
      ceo: ['Q3 is GO!', 'Execute.', 'Results.'],
      sales: ['Felix ON IT!', 'Pipeline strong.', 'Closing!'],
      marketing: ['Phoenix has the floor.', 'Going viral.'],
      ops: ['Axel handling it.', 'Systems GREEN.'],
      finance: ['Bruno on it.', 'Books balanced.'],
      instagram: ['Blaze posting!', 'Reel LIVE!'],
      engineer: ['Atlas deploying.', 'Code CLEAN.'],
    }
    const opts = lines[id] || ['']
    setSpeech({ id, text: opts[Math.floor(Math.random() * opts.length)] })
    setTimeout(() => setSpeech(null), 3000)
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ backgroundColor: '#f3f4f6' }}
    >
      {/* ── Wall ── */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '4px solid #374151',
      }}>
        <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 }}>APEX HQ</span>
        <div style={{ flex: 1 }} />
        {/* Windows */}
        {[1,2,3].map(i => (
          <div key={i} style={{
            width: 36, height: 22,
            backgroundColor: '#1e40af',
            borderRadius: 3,
            boxShadow: '0 0 8px #3b82f680',
          }} />
        ))}
      </div>

      {/* ── Office floor (checkerboard) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Checkerboard floor */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          opacity: 0.5,
        }} />

        {/* ── Boss section ── */}
        <div className="flex flex-col items-center cursor-pointer relative z-10" onClick={() => handleClick('ceo')}>
          {speech?.id === 'ceo' && (
            <div className="mb-2 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold animate-fade-up shadow-lg whitespace-nowrap">
              🦁 {speech.text}
            </div>
          )}
          <BossDesk />
        </div>

        {/* ── Dashed separator ── */}
        <div style={{
          width: '80%',
          borderTop: '2px dashed #d1d5db',
          margin: '8px 0',
        }} />

        {/* ── Workers bench ── */}
        <div className="flex items-end justify-center gap-2 relative z-10">
          {/* Long desk surface */}
          <div style={{
            position: 'absolute',
            bottom: 48,
            left: -20,
            right: -20,
            height: 10,
            backgroundColor: '#e5e7eb',
            borderRadius: 6,
            border: '2px solid #d1d5db',
            borderBottom: '3px solid #9ca3af',
          }} />

          {WORKERS.map(worker => (
            <div
              key={worker.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleClick(worker.id)}
            >
              {speech?.id === worker.id && (
                <div
                  className="mb-1 px-3 py-1 rounded-xl text-white text-xs font-bold animate-fade-up shadow-lg whitespace-nowrap"
                  style={{ backgroundColor: worker.color }}
                >
                  {worker.emoji} {speech.text}
                </div>
              )}
              <WorkerDesk worker={worker} />
            </div>
          ))}
        </div>

        {/* Floor line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: '#d1d5db',
        }} />
      </div>

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          15% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
