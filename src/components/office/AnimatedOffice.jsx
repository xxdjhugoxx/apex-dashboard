import React, { useState, useEffect, useRef } from 'react'

const WORKERS = [
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B' },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899' },
  { id: 'engineer',  name: 'Atlas',  emoji: '🤖', color: '#06B6D4' },
]

// ─── Desk (top-down view) ─────────────────────────────────────────────────
function Desk({ color, worker, isHugo, atDesk }) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        width: 80,
        height: 90,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Desk surface */}
      <div
        className="rounded-xl shadow-lg"
        style={{
          width: 72,
          height: 56,
          backgroundColor: '#fafafa',
          border: `3px solid ${color || '#d1d5db'}`,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Monitor on desk (top-down: rectangle) */}
        <div
          className="absolute rounded"
          style={{
            width: 32,
            height: 22,
            backgroundColor: '#1f2937',
            border: `2px solid ${color}`,
            left: '50%',
            top: 6,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="rounded-sm m-0.5"
            style={{
              width: 'calc(100% - 4px)',
              height: 'calc(100% - 4px)',
              backgroundColor: color + '40',
            }}
          />
        </div>

        {/* Keyboard */}
        <div
          className="absolute rounded"
          style={{
            width: 24,
            height: 10,
            backgroundColor: '#d1d5db',
            left: '50%',
            bottom: 8,
            transform: 'translateX(-50%)',
          }}
        />

        {/* Person sitting at desk (top-down: we see top of head + shoulders) */}
        {atDesk && (
          <div
            className="absolute flex flex-col items-center"
            style={{
              // Person is BEHIND the desk (lower z-index), head peeking up
              bottom: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
          >
            {/* Head (top-down circle) */}
            <div
              className="rounded-full shadow border-2 flex items-center justify-center text-white font-bold"
              style={{
                width: isHugo ? 38 : 30,
                height: isHugo ? 38 : 30,
                backgroundColor: isHugo ? '#7f1d1d' : color,
                borderColor: isHugo ? '#EF4444' : color,
                fontSize: isHugo ? 16 : 12,
              }}
            >
              {isHugo ? '🦁' : worker?.emoji}
            </div>
            {/* Shoulders hint */}
            <div
              className="rounded-t-full"
              style={{
                width: isHugo ? 44 : 36,
                height: 12,
                backgroundColor: isHugo ? '#7f1d1d' : color,
                marginTop: -4,
                border: `2px solid ${isHugo ? '#EF4444' : color}`,
                borderBottom: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Name */}
      <div
        className="mt-1 text-center font-extrabold tracking-wide"
        style={{
          fontSize: 10,
          color: isHugo ? '#EF4444' : '#374151',
        }}
      >
        {isHugo ? 'HUGO' : worker?.name?.toUpperCase()}
      </div>
    </div>
  )
}

// ─── Walking person (animated) ─────────────────────────────────────────────
function WalkingPerson({ worker, fromX, fromY, toX, toY, progress, isHugo }) {
  // Interpolate position
  const x = fromX + (toX - fromX) * progress
  const y = fromY + (toY - fromY) * progress

  // Bounce/walk effect
  const bounce = Math.sin(progress * Math.PI * 6) * 4

  return (
    <div
      className="absolute transition-all pointer-events-none"
      style={{
        left: x,
        top: y + bounce,
        zIndex: 50,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* Walking person — slightly bigger, very visible */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div
          className="rounded-full shadow-lg border-2 flex items-center justify-center text-white font-bold"
          style={{
            width: isHugo ? 44 : 36,
            height: isHugo ? 44 : 36,
            backgroundColor: isHugo ? '#7f1d1d' : worker.color,
            borderColor: isHugo ? '#EF4444' : worker.color,
            fontSize: isHugo ? 18 : 14,
          }}
        >
          {isHugo ? '🦁' : worker.emoji}
        </div>
        {/* Body */}
        <div
          className="rounded-t-full"
          style={{
            width: isHugo ? 52 : 42,
            height: 16,
            backgroundColor: isHugo ? '#7f1d1d' : worker.color,
            border: `2px solid ${isHugo ? '#EF4444' : worker.color}`,
            borderBottom: 'none',
            marginTop: -4,
          }}
        />
      </div>
    </div>
  )
}

// ─── Main Office ───────────────────────────────────────────────────────────
export function AnimatedOffice({ agentStatuses, onAgentClick }) {
  // Walking state: which worker is walking to Hugo
  const [walking, setWalking] = useState(null) // { worker, progress, direction }
  // speech bubble
  const [speech, setSpeech] = useState(null)

  const officeRef = useRef(null)

  // Get pixel positions for each desk area
  const getDeskPositions = () => {
    if (!officeRef.current) return {}
    const rect = officeRef.current.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2

    // Hugo's desk: top center
    const hugoY = cy - 140
    // Workers' desks: bottom area, evenly spaced
    const workerSpacing = 90
    const startX = cx - ((WORKERS.length - 1) * workerSpacing) / 2

    const positions = {}
    WORKERS.forEach((w, i) => {
      positions[w.id] = {
        x: startX + i * workerSpacing,
        y: cy + 80,
      }
    })
    positions.ceo = { x: cx, y: hugoY }

    return positions
  }

  const [positions, setPositions] = useState({})

  useEffect(() => {
    const update = () => setPositions(getDeskPositions())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Simulate random worker walking to Hugo every ~8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (walking) return
      const worker = WORKERS[Math.floor(Math.random() * WORKERS.length)]
      triggerWalk(worker)
    }, 8000)
    return () => clearInterval(interval)
  }, [walking])

  const triggerWalk = (worker) => {
    if (walking) return

    // Walk to Hugo
    setWalking({ worker, progress: 0, direction: 'toHugo', speech: getSpeech(worker.id) })
    let start = null
    const duration = 1200 // ms

    const animate = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setWalking(prev => prev ? { ...prev, progress: p } : null)

      if (p < 1) {
        requestAnimationFrame(animate)
      } else {
        // Arrived — show speech, then walk back
        setSpeech({ id: worker.id, text: getSpeech(worker.id), worker })
        setTimeout(() => {
          setSpeech(null)
          setWalking({ worker, progress: 0, direction: 'toDesk', speech: null })
          const animateBack = (ts2) => {
            if (!start) start = ts2
            const p2 = Math.min((ts2 - start) / duration, 1)
            setWalking(prev => prev ? { ...prev, progress: p2 } : null)
            if (p2 < 1) {
              requestAnimationFrame(animateBack)
            } else {
              setWalking(null)
            }
          }
          requestAnimationFrame(animateBack)
        }, 2500)
      }
    }
    requestAnimationFrame(animate)
  }

  const getSpeech = (id) => {
    const lines = {
      sales: ['New lead! 💰', 'Deal closed! 🎉', 'Pipeline strong!'],
      marketing: ['Post live! 🚀', 'Viral hit! 📈', 'New campaign live!'],
      ops: ['Task done ✅', 'Systems GREEN', 'Scheduler updated'],
      finance: ['Burn rate: 94% 📊', 'Invoice #47 sent', 'Budget: on track'],
      instagram: ['Reel uploaded! 🎬', 'Engagement +23%', 'Story posted!'],
      engineer: ['Build complete ⚙️', 'Deployed! 🚀', 'Code merged ✅'],
    }
    const opts = lines[id] || ['']
    return opts[Math.floor(Math.random() * opts.length)]
  }

  const pos = walking ? positions[walking.worker.id] : null
  const hugoPos = positions.ceo

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
        flexShrink: 0,
      }}>
        <span style={{
          color: '#f3f4f6',
          fontSize: 13,
          fontWeight: '800',
          letterSpacing: 3,
          fontFamily: 'monospace',
        }}>🏢 APEX HQ</span>
        <div style={{ flex: 1 }} />
        {[1,2,3].map(i => (
          <div key={i} style={{
            width: 48, height: 28,
            backgroundColor: '#1e3a8a',
            borderRadius: 5,
            boxShadow: '0 0 12px #3b82f680, inset 0 0 8px #60a5fa40',
          }} />
        ))}
      </div>

      {/* ── Office floor (ref) ── */}
      <div
        ref={officeRef}
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundColor: '#e5e7eb',
          backgroundImage: `
            linear-gradient(rgba(209,213,219,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(209,213,219,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        {/* HUGO'S DESK — top center */}
        {positions.ceo && (
          <div
            className="absolute"
            style={{
              left: positions.ceo.x,
              top: positions.ceo.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <div className="flex flex-col items-center">
              {/* Crown above Hugo */}
              <div style={{
                width: 0, height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderBottom: '14px solid #F59E0B',
                marginBottom: -2,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }} />
              {/* Desk */}
              <div
                className="rounded-xl shadow-xl"
                style={{
                  width: 88,
                  height: 68,
                  backgroundColor: '#fafafa',
                  border: '4px solid #EF4444',
                  position: 'relative',
                }}
              >
                {/* Monitor */}
                <div className="absolute rounded" style={{
                  width: 38,
                  height: 28,
                  backgroundColor: '#1f2937',
                  border: '2px solid #EF4444',
                  left: '50%',
                  top: 6,
                  transform: 'translateX(-50%)',
                }}>
                  <div className="m-1 rounded-sm" style={{
                    width: 'calc(100% - 4px)',
                    height: 'calc(100% - 4px)',
                    backgroundColor: '#EF444440',
                  }} />
                </div>
                {/* Keyboard */}
                <div className="absolute rounded" style={{
                  width: 30,
                  height: 12,
                  backgroundColor: '#d1d5db',
                  left: '50%',
                  bottom: 8,
                  transform: 'translateX(-50%)',
                }} />
                {/* Hugo sitting behind desk */}
                <div className="absolute" style={{
                  bottom: -22,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 5,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#FDE68A',
                    border: '3px solid #EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}>🦁</div>
                  <div style={{
                    width: 50,
                    height: 14,
                    borderRadius: '10px 10px 0 0',
                    backgroundColor: '#7f1d1d',
                    border: '2px solid #EF4444',
                    borderBottom: 'none',
                    marginTop: -4,
                    marginLeft: -5,
                  }} />
                </div>
              </div>
              <div className="mt-1 text-red-600 font-extrabold tracking-widest" style={{ fontSize: 11 }}>HUGO</div>
            </div>
          </div>
        )}

        {/* WORKERS' DESKS — bottom row */}
        {WORKERS.map((worker, i) => {
          const wPos = positions[worker.id]
          if (!wPos) return null
          return (
            <div
              key={worker.id}
              className="absolute"
              style={{
                left: wPos.x,
                top: wPos.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
              }}
            >
              <div className="flex flex-col items-center">
                {/* Desk */}
                <div
                  className="rounded-xl shadow-lg"
                  style={{
                    width: 80,
                    height: 60,
                    backgroundColor: '#fafafa',
                    border: `3px solid ${worker.color}`,
                    position: 'relative',
                  }}
                >
                  {/* Monitor */}
                  <div className="absolute rounded" style={{
                    width: 32,
                    height: 22,
                    backgroundColor: '#1f2937',
                    border: `2px solid ${worker.color}`,
                    left: '50%',
                    top: 6,
                    transform: 'translateX(-50%)',
                  }}>
                    <div className="m-0.5 rounded-sm" style={{
                      width: 'calc(100% - 2px)',
                      height: 'calc(100% - 2px)',
                      backgroundColor: worker.color + '40',
                    }} />
                  </div>
                  {/* Keyboard */}
                  <div className="absolute rounded" style={{
                    width: 24,
                    height: 10,
                    backgroundColor: '#d1d5db',
                    left: '50%',
                    bottom: 8,
                    transform: 'translateX(-50%)',
                  }} />
                  {/* Worker sitting behind desk */}
                  <div className="absolute" style={{
                    bottom: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#FDE68A',
                      border: `2px solid ${worker.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                    }}>{worker.emoji}</div>
                    <div style={{
                      width: 42,
                      height: 12,
                      borderRadius: '10px 10px 0 0',
                      backgroundColor: worker.color,
                      border: `2px solid ${worker.color}`,
                      borderBottom: 'none',
                      marginTop: -3,
                      marginLeft: -5,
                    }} />
                  </div>
                </div>
                <div className="mt-1 text-gray-700 font-extrabold tracking-wide" style={{ fontSize: 9 }}>{worker.name.toUpperCase()}</div>
              </div>
            </div>
          )
        })}

        {/* WALKING PERSON — animated */}
        {walking && walking.progress > 0 && walking.progress < 1 && hugoPos && pos && (
          <WalkingPerson
            worker={walking.worker}
            fromX={walking.direction === 'toHugo' ? pos.x : hugoPos.x}
            fromY={walking.direction === 'toHugo' ? pos.y : hugoPos.y}
            toX={walking.direction === 'toHugo' ? hugoPos.x : pos.x}
            toY={walking.direction === 'toHugo' ? hugoPos.y : pos.y}
            progress={walking.progress}
            isHugo={false}
          />
        )}

        {/* SPEECH BUBBLE at Hugo's desk */}
        {speech && (
          <div
            className="absolute animate-fade-up px-4 py-2 rounded-2xl shadow-xl text-white text-xs font-bold"
            style={{
              left: hugoPos ? hugoPos.x : '50%',
              top: hugoPos ? hugoPos.y - 90 : 100,
              transform: 'translateX(-50%)',
              backgroundColor: speech.worker?.color || '#EF4444',
              zIndex: 100,
              whiteSpace: 'nowrap',
            }}
          >
            {speech.worker?.emoji} {speech.text}
          </div>
        )}

        {/* Office label */}
        <div
          className="absolute bottom-2 right-3 text-gray-400 font-bold"
          style={{ fontSize: 9, letterSpacing: 1 }}
        >
          {walking ? `📢 ${walking.worker.name.toUpperCase()} WALKING TO HUGO` : '🏢 ALL AT DESKS'}
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-up { animation: fade-up 3s ease-out forwards; }
      `}</style>
    </div>
  )
}
