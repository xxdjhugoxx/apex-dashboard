import React, { useState } from 'react'

const WORKERS = [
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#374151' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#7C3AED' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#059669' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#D97706' },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#DB2777' },
  { id: 'engineer',  name: 'Atlas',   emoji: '🤖', color: '#0891B2' },
]

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ color, emoji, name, isHugo }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-xl flex items-center justify-center shadow-sm"
        style={{
          width: isHugo ? 48 : 36,
          height: isHugo ? 56 : 44,
          backgroundColor: color,
          fontSize: isHugo ? 22 : 16,
        }}
      >
        <span>{emoji}</span>
      </div>
      <div style={{ width: 3, height: 6, backgroundColor: '#d1d5db' }} />
      <span className="text-gray-600 font-bold whitespace-nowrap" style={{ fontSize: isHugo ? 11 : 9 }}>
        {name}
      </span>
    </div>
  )
}

// ─── Office Floor ─────────────────────────────────────────────────────────────
export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  const [speech, setSpeech] = useState(null) // { id, text }

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
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>

      {/* ── Wall ── */}
      <div style={{ backgroundColor: '#1f2937', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#9ca3af', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 }}>APEX HQ</span>
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 18, backgroundColor: '#1e40af', borderRadius: 3 }} />
        <div style={{ width: 32, height: 18, backgroundColor: '#1e3a8a', borderRadius: 3 }} />
        <div style={{ width: 32, height: 18, backgroundColor: '#1e40af', borderRadius: 3 }} />
      </div>

      {/* ── Boss row ── */}
      <div className="flex items-center justify-center py-3" style={{ backgroundColor: '#f9fafb' }}>
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleClick('ceo')}
        >
          {/* Crown */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderBottom: '12px solid #F59E0B',
            marginBottom: -2,
          }} />
          <Avatar color="#7C2D12" emoji="🦁" name="HUGO" isHugo />
          {/* Desk line */}
          <div style={{ width: 80, height: 4, backgroundColor: '#EF4444', borderRadius: 2, marginTop: 2 }} />
        </div>
        {speech?.id === 'ceo' && (
          <div className="ml-4 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold animate-fade-up shadow-lg">
            🦁 {speech.text}
          </div>
        )}
      </div>

      {/* ── Separator ── */}
      <div className="flex-1 flex flex-col items-center">
        <div style={{ flex: 1, borderLeft: '2px dashed #d1d5db', height: '100%' }} />
      </div>

      {/* ── Workers row ── */}
      <div
        className="flex items-end justify-center gap-3 pb-4 px-4"
        style={{ backgroundColor: '#f9fafb' }}
      >
        {/* Long bench desk surface */}
        <div style={{
          position: 'absolute',
          bottom: 56,
          left: 0, right: 0,
          height: 6,
          backgroundColor: '#e5e7eb',
          borderTop: '2px solid #d1d5db',
        }} />

        {WORKERS.map(worker => (
          <div
            key={worker.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleClick(worker.id)}
            style={{ zIndex: 1 }}
          >
            {speech?.id === worker.id && (
              <div
                className="mb-1 px-2 py-1 rounded-xl text-white text-xs font-bold animate-fade-up shadow-lg whitespace-nowrap"
                style={{ backgroundColor: worker.color }}
              >
                {worker.emoji} {speech.text}
              </div>
            )}
            <Avatar {...worker} name={worker.name} />
            {/* Stem */}
            <div style={{ width: 3, height: 6, backgroundColor: '#d1d5db' }} />
          </div>
        ))}
      </div>

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
