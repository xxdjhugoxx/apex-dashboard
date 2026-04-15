import React, { useState } from 'react'

const WORKERS = [
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35', bg: '#431407' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7', bg: '#3b0764' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981', bg: '#022c22' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B', bg: '#451a03' },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899', bg: '#500724' },
  { id: 'engineer', name: 'Atlas',   emoji: '🤖', color: '#06B6D4', bg: '#083344' },
]

// ─── Worker sitting at desk (front view — we see back of head + shoulders) ───
function Worker({ worker }) {
  return (
    <div className="flex flex-col items-center" style={{ width: 100 }}>
      {/* Person sitting — back of head + shoulders */}
      <div style={{ position: 'relative', marginBottom: -8 }}>
        {/* Head */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#FDE68A',
            border: `3px solid ${worker.color}`,
            position: 'relative',
            zIndex: 2,
          }}
        />
        {/* Shoulders/body */}
        <div
          style={{
            width: 52,
            height: 20,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            backgroundColor: worker.color,
            marginTop: -8,
            marginLeft: -10,
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Desk surface */}
      <div
        style={{
          width: 80,
          height: 10,
          backgroundColor: '#e5e7eb',
          borderRadius: 6,
          border: '2px solid #d1d5db',
          position: 'relative',
        }}
      >
        {/* Monitor */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -40,
            transform: 'translateX(-50%)',
            width: 56,
            height: 40,
            backgroundColor: '#1f2937',
            borderRadius: 4,
            border: `2px solid ${worker.color}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              margin: 3,
              width: 'calc(100% - 6px)',
              height: 'calc(100% - 6px)',
              backgroundColor: worker.color + '40',
              borderRadius: 2,
            }}
          />
        </div>
        {/* Keyboard */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -10,
            transform: 'translateX(-50%)',
            width: 36,
            height: 8,
            backgroundColor: '#d1d5db',
            borderRadius: 2,
          }}
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

// ─── Hugo (boss) ─────────────────────────────────────────────────────────────
function Boss() {
  return (
    <div className="flex flex-col items-center">
      {/* Crown */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '24px solid transparent',
        borderRight: '24px solid transparent',
        borderBottom: '18px solid #F59E0B',
        marginBottom: -6,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        zIndex: 3,
        position: 'relative',
      }} />

      {/* Boss — larger seated figure */}
      <div style={{ position: 'relative', marginBottom: -10 }}>
        {/* Head */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#FDE68A',
            border: '4px solid #EF4444',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* 👑 emoji in head */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>🦁</div>
        </div>
        {/* Shoulders */}
        <div
          style={{
            width: 72,
            height: 28,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            backgroundColor: '#7f1d1d',
            border: '3px solid #EF4444',
            marginTop: -10,
            marginLeft: -14,
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Big desk */}
      <div
        style={{
          width: 120,
          height: 14,
          backgroundColor: '#e5e7eb',
          borderRadius: 8,
          border: '3px solid #EF4444',
          position: 'relative',
        }}
      >
        {/* Large monitor */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -56,
            transform: 'translateX(-50%)',
            width: 80,
            height: 56,
            backgroundColor: '#1f2937',
            borderRadius: 6,
            border: '3px solid #EF4444',
          }}
        >
          <div
            style={{
              margin: 4,
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)',
              backgroundColor: '#EF444440',
              borderRadius: 3,
            }}
          />
        </div>
        {/* Keyboard */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -14,
            transform: 'translateX(-50%)',
            width: 50,
            height: 10,
            backgroundColor: '#d1d5db',
            borderRadius: 3,
          }}
        />
      </div>

      <div className="mt-2 text-center">
        <div className="text-red-600 font-bold text-sm tracking-wide">HUGO</div>
        <div className="text-red-300 text-[9px]">BOSS</div>
      </div>
    </div>
  )
}

// ─── Long bench desk ───────────────────────────────────────────────────────
function BenchDesk() {
  return (
    <div style={{
      width: '100%',
      padding: '0 8px',
      boxSizing: 'border-box',
    }}>
      {/* Desk surface */}
      <div style={{
        width: '100%',
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        border: '3px solid #d1d5db',
        borderBottom: '4px solid #9ca3af',
        position: 'relative',
      }}>
        {/* 6 monitors evenly spaced */}
        {WORKERS.map((w, i) => (
          <div
            key={w.id}
            style={{
              position: 'absolute',
              left: `${(i * 16.66) + 6}%`,
              top: -48,
              width: 56,
              height: 40,
              backgroundColor: '#1f2937',
              borderRadius: 4,
              border: `2px solid ${w.color}`,
              transform: 'translateX(-50%)',
            }}
          >
            <div style={{
              margin: 3,
              width: 'calc(100% - 6px)',
              height: 'calc(100% - 6px)',
              backgroundColor: w.color + '35',
              borderRadius: 2,
            }} />
          </div>
        ))}
        {/* Keyboards */}
        {WORKERS.map((w, i) => (
          <div
            key={`kb-${w.id}`}
            style={{
              position: 'absolute',
              left: `${(i * 16.66) + 6}%`,
              top: -12,
              width: 36,
              height: 8,
              backgroundColor: '#d1d5db',
              borderRadius: 2,
              transform: 'translateX(-50%)',
            }}
          />
        ))}
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
        {[1,2,3].map(i => (
          <div key={i} style={{
            width: 40, height: 24,
            backgroundColor: '#1e40af',
            borderRadius: 4,
            boxShadow: '0 0 10px #3b82f680',
          }} />
        ))}
      </div>

      {/* ── Office floor ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 16px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Boss section */}
        <div
          className="cursor-pointer relative z-10 mb-2"
          onClick={() => handleClick('ceo')}
        >
          {speech?.id === 'ceo' && (
            <div className="mb-2 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold animate-fade-up shadow-lg whitespace-nowrap"
              style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
              🦁 {speech.text}
            </div>
          )}
          <Boss />
        </div>

        {/* Dashed separator */}
        <div style={{ width: '70%', borderTop: '2px dashed #d1d5db', margin: '4px 0' }} />

        {/* Workers row */}
        <div className="flex items-end justify-center gap-1 w-full relative z-10 mt-1">
          {/* Bench desk */}
          <div style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 8,
            border: '3px solid #d1d5db',
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
                  style={{
                    position: 'absolute',
                    top: -60,
                    backgroundColor: worker.color,
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                  }}
                >
                  {worker.emoji} {speech.text}
                </div>
              )}
              {/* Worker sitting */}
              <div style={{ position: 'relative', zIndex: 2, marginBottom: -8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#FDE68A',
                  border: `2px solid ${worker.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}>
                  {worker.emoji}
                </div>
                <div style={{
                  width: 44,
                  height: 16,
                  borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                  backgroundColor: worker.color,
                  marginTop: -6,
                  marginLeft: -8,
                }} />
              </div>

              {/* Name below desk */}
              <div className="mt-8 text-center">
                <div className="text-gray-700 font-bold text-[10px]">{worker.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom floor line */}
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
