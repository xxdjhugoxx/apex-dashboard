import React, { useState } from 'react'

const WORKERS = [
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35', shirt: '#431407' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7', shirt: '#3b0764' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981', shirt: '#022c22' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B', shirt: '#451a03' },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899', shirt: '#500724' },
  { id: 'engineer',  name: 'Atlas',  emoji: '🤖', color: '#06B6D4', shirt: '#083344' },
]

// ─── Worker (front view — we see their face/body at desk) ─────────────────
function Worker({ worker }) {
  return (
    <div className="flex flex-col items-center" style={{ width: 110 }}>
      {/* Person — head + torso visible above desk */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Head */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#FDE68A',
            border: `3px solid ${worker.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            margin: '0 auto',
          }}
        >
          {worker.emoji}
        </div>
        {/* Torso */}
        <div
          style={{
            width: 56,
            height: 28,
            borderRadius: '16px 16px 0 0',
            backgroundColor: worker.color,
            margin: '-4px auto 0',
          }}
        />
      </div>

      {/* Desk surface — person sits BEHIND it */}
      <div
        style={{
          width: 90,
          height: 14,
          backgroundColor: '#d1d5db',
          borderRadius: 8,
          border: '3px solid #9ca3af',
          position: 'relative',
          zIndex: 3,
          marginTop: -4,
        }}
      >
        {/* Monitor on desk */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -52,
            transform: 'translateX(-50%)',
            width: 62,
            height: 44,
            backgroundColor: '#111827',
            borderRadius: 6,
            border: `3px solid ${worker.color}`,
          }}
        >
          {/* Screen */}
          <div
            style={{
              margin: 4,
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)',
              backgroundColor: worker.color + '30',
              borderRadius: 3,
            }}
          />
        </div>
        {/* Stand */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -12,
            transform: 'translateX(-50%)',
            width: 10,
            height: 10,
            backgroundColor: '#6b7280',
          }}
        />
      </div>

      {/* Name */}
      <div className="mt-2 text-center">
        <div
          className="text-gray-700 font-extrabold"
          style={{ fontSize: 11, letterSpacing: 0.5 }}
        >
          {worker.name.toUpperCase()}
        </div>
        <div className="text-gray-400" style={{ fontSize: 9 }}>{worker.emoji}</div>
      </div>
    </div>
  )
}

// ─── Hugo (boss — larger) ──────────────────────────────────────────────────
function Boss() {
  return (
    <div className="flex flex-col items-center">
      {/* Crown */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '28px solid transparent',
        borderRight: '28px solid transparent',
        borderBottom: '20px solid #F59E0B',
        marginBottom: -8,
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
        position: 'relative',
        zIndex: 4,
      }} />

      {/* Hugo head + torso */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#FDE68A',
            border: '4px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          🦁
        </div>
        <div
          style={{
            width: 80,
            height: 40,
            borderRadius: '20px 20px 0 0',
            backgroundColor: '#7f1d1d',
            border: '3px solid #EF4444',
            borderBottom: 'none',
            margin: '-5px auto 0',
          }}
        />
      </div>

      {/* Boss desk */}
      <div
        style={{
          width: 140,
          height: 18,
          backgroundColor: '#d1d5db',
          borderRadius: 10,
          border: '4px solid #EF4444',
          position: 'relative',
          zIndex: 3,
          marginTop: -4,
        }}
      >
        {/* Big monitor */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -70,
            transform: 'translateX(-50%)',
            width: 90,
            height: 62,
            backgroundColor: '#111827',
            borderRadius: 8,
            border: '4px solid #EF4444',
          }}
        >
          <div
            style={{
              margin: 5,
              width: 'calc(100% - 10px)',
              height: 'calc(100% - 10px)',
              backgroundColor: '#EF444430',
              borderRadius: 4,
            }}
          />
        </div>
        {/* Stand */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -14,
            transform: 'translateX(-50%)',
            width: 14,
            height: 14,
            backgroundColor: '#EF4444',
          }}
        />
      </div>

      <div className="mt-2 text-center">
        <div className="text-red-600 font-extrabold tracking-widest" style={{ fontSize: 13 }}>HUGO</div>
        <div className="text-red-300" style={{ fontSize: 9 }}>CEO</div>
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
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: '5px solid #374151',
      }}>
        <span style={{
          color: '#f3f4f6',
          fontSize: 13,
          fontWeight: '800',
          letterSpacing: 3,
          fontFamily: 'monospace',
        }}>🏢 APEX HQ</span>
        <div style={{ flex: 1 }} />
        {/* Windows */}
        {[1,2,3].map(i => (
          <div key={i} style={{
            width: 48, height: 28,
            backgroundColor: '#1e3a8a',
            borderRadius: 5,
            boxShadow: '0 0 12px #3b82f680, inset 0 0 8px #60a5fa40',
          }} />
        ))}
      </div>

      {/* ── Office room ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Floor tiles (subtle) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
            linear-gradient(#e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }} />

        {/* ── BOSS ── */}
        <div
          className="cursor-pointer relative z-10"
          onClick={() => handleClick('ceo')}
          style={{ marginTop: 8 }}
        >
          {speech?.id === 'ceo' && (
            <div
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold animate-fade-up shadow-lg"
              style={{
                position: 'absolute',
                top: -50,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 30,
              }}
            >
              🦁 {speech.text}
            </div>
          )}
          <Boss />
        </div>

        {/* ── Separator ── */}
        <div style={{
          width: '85%',
          borderTop: '3px dashed #cbd5e1',
          margin: '8px 0',
          position: 'relative',
          zIndex: 1,
        }} />

        {/* ── WORKERS ── */}
        <div
          className="flex items-end justify-center gap-2 relative z-10"
          style={{ width: '100%' }}
        >
          {/* Long bench desk — rendered BEHIND workers */}
          <div style={{
            position: 'absolute',
            bottom: 44,
            left: 0,
            right: 0,
            height: 14,
            backgroundColor: '#d1d5db',
            borderRadius: 10,
            border: '3px solid #9ca3af',
            zIndex: 1,
          }} />

          {WORKERS.map(worker => (
            <div
              key={worker.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleClick(worker.id)}
              style={{ position: 'relative', zIndex: 2 }}
            >
              {/* Speech bubble */}
              {speech?.id === worker.id && (
                <div
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-bold animate-fade-up shadow-lg"
                  style={{
                    position: 'absolute',
                    top: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    backgroundColor: worker.color,
                    zIndex: 30,
                  }}
                >
                  {worker.emoji} {speech.text}
                </div>
              )}

              {/* Worker (head + torso above desk) */}
              <Worker worker={worker} />
            </div>
          ))}
        </div>

        {/* Floor baseboard */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: '#9ca3af',
        }} />
      </div>

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(8px) translateX(-50%); }
          15% { opacity: 1; transform: translateY(0) translateX(-50%); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
