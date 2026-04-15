import React, { useState, useEffect } from 'react'

// Pixel animal SVG components
const PixelAnimals = {
  ceo: ({ working, color }) => (
    <svg viewBox="0 0 64 64" className="w-14 h-14 pixel-char">
      {/* Lion */}
      <rect x="20" y="8" width="24" height="16" fill="#F59E0B"/>
      <rect x="16" y="12" width="4" height="8" fill="#F59E0B"/>
      <rect x="44" y="12" width="4" height="8" fill="#F59E0B"/>
      <rect x="12" y="16" width="4" height="6" fill="#F59E0B"/>
      <rect x="48" y="16" width="4" height="6" fill="#F59E0B"/>
      <rect x="24" y="12" width="16" height="8" fill="#FDE68A"/>
      <rect x="28" y="16" width="4" height="4" fill="#1a1a2e"/>
      <rect x="36" y="16" width="4" height="4" fill="#1a1a2e"/>
      <rect x="28" y="22" width="8" height="4" fill="#92400E"/>
      <rect x="24" y="28" width="16" height="16" fill="#F59E0B"/>
      <rect x="20" y="32" width="4" height="10" fill="#F59E0B"/>
      <rect x="40" y="32" width="4" height="10" fill="#F59E0B"/>
      <rect x="26" y="44" width="5" height="8" fill="#F59E0B"/>
      <rect x="33" y="44" width="5" height="8" fill="#F59E0B"/>
      {/* Tie */}
      <rect x="30" y="28" width="4" height="8" fill={color}/>
    </svg>
  ),
  sales: ({ working, color }) => (
    <svg viewBox="0 0 64 64" className="w-14 h-14 pixel-char">
      {/* Fox */}
      <rect x="24" y="8" width="16" height="12" fill="#FF6B35"/>
      <rect x="20" y="12" width="4" height="8" fill="#FF6B35"/>
      <rect x="40" y="12" width="4" height="8" fill="#FF6B35"/>
      <rect x="16" y="16" width="4" height="6" fill="#FF6B35"/>
      <rect x="44" y="16" width="4" height="6" fill="#FF6B35"/>
      <rect x="28" y="10" width="8" height="6" fill="#1a1a2e"/>
      <rect x="28" y="22" width="8" height="4" fill="#1a1a2e"/>
      <rect x="24" y="26" width="16" height="18" fill="#FF6B35"/>
      <rect x="28" y="30" width="8" height="8" fill="#FDE68A"/>
      <rect x="22" y="44" width="8" height="4" fill="#FF6B35"/>
      <rect x="34" y="44" width="8" height="4" fill="#FF6B35"/>
      {/* Suit */}
      <rect x="28" y="26" width="8" height="10" fill={color}/>
    </svg>
  ),
  marketing: ({ working, color }) => (
    <svg viewBox="0 0 64 64" className="w-14 h-14 pixel-char">
      {/* Peacock */}
      <ellipse cx="32" cy="38" rx="12" ry="16" fill="#A855F7"/>
      <rect x="20" y="20" width="24" height="16" fill="#A855F7"/>
      <rect x="24" y="6" width="4" height="18" fill="#A855F7"/>
      <rect x="20" y="10" width="4" height="14" fill="#A855F7"/>
      <rect x="28" y="2" width="4" height="22" fill="#A855F7"/>
      <rect x="32" y="4" width="4" height="20" fill="#A855F7"/>
      <rect x="36" y="8" width="4" height="16" fill="#A855F7"/>
      <rect x="40" y="12" width="4" height="12" fill="#A855F7"/>
      <rect x="28" y="22" width="4" height="4" fill="#1a1a2e"/>
      <rect x="34" y="22" width="4" height="4" fill="#1a1a2e"/>
      <rect x="26" y="28" width="12" height="4" fill="#FDE68A"/>
      <circle cx="22" cy="12" r="2" fill="#10B981"/>
      <circle cx="28" cy="6" r="2" fill="#10B981"/>
      <circle cx="32" cy="5" r="2" fill="#10B981"/>
      <circle cx="37" cy="7" r="2" fill="#10B981"/>
      <circle cx="42" cy="14" r="2" fill="#10B981"/>
    </svg>
  ),
  ops: ({ working, color }) => (
    <svg viewBox="0 0 64 64" className="w-14 h-14 pixel-char">
      {/* Badger */}
      <rect x="22" y="10" width="20" height="14" fill="#10B981"/>
      <rect x="18" y="14" width="4" height="8" fill="#10B981"/>
      <rect x="42" y="14" width="4" height="8" fill="#10B981"/>
      <rect x="28" y="10" width="8" height="6" fill="#1a1a2e"/>
      <rect x="28" y="20" width="8" height="4" fill="#1a1a2e"/>
      <rect x="24" y="24" width="16" height="18" fill="#10B981"/>
      <rect x="22" y="30" width="20" height="6" fill="#FDE68A"/>
      <rect x="18" y="42" width="8" height="4" fill="#10B981"/>
      <rect x="38" y="42" width="8" height="4" fill="#10B981"/>
      <rect x="22" y="42" width="4" height="10" fill="#10B981"/>
      <rect x="38" y="42" width="4" height="10" fill="#10B981"/>
      <rect x="28" y="46" width="8" height="6" fill="#064E3B"/>
      {/* Hard hat / tool */}
      <rect x="26" y="6" width="12" height="4" fill={color}/>
    </svg>
  ),
  finance: ({ working, color }) => (
    <svg viewBox="0 0 64 64" className="w-14 h-14 pixel-char">
      {/* Bear */}
      <rect x="20" y="8" width="24" height="20" fill="#F59E0B"/>
      <rect x="16" y="12" width="8" height="8" fill="#F59E0B"/>
      <rect x="40" y="12" width="8" height="8" fill="#F59E0B"/>
      <rect x="20" y="8" width="8" height="8" fill="#92400E"/>
      <rect x="36" y="8" width="8" height="8" fill="#92400E"/>
      <rect x="26" y="16" width="4" height="4" fill="#1a1a2e"/>
      <rect x="34" y="16" width="4" height="4" fill="#1a1a2e"/>
      <rect x="28" y="24" width="8" height="4" fill="#92400E"/>
      <rect x="18" y="28" width="28" height="18" fill="#F59E0B"/>
      <rect x="24" y="32" width="16" height="10" fill="#FDE68A"/>
      <rect x="26" y="36" width="4" height="4" fill="#1a1a2e"/>
      <rect x="34" y="36" width="4" height="4" fill="#1a1a2e"/>
      <rect x="22" y="46" width="8" height="4" fill="#F59E0B"/>
      <rect x="34" y="46" width="8" height="4" fill="#F59E0B"/>
      {/* Money */}
      <rect x="28" y="32" width="8" height="6" fill={color}/>
    </svg>
  ),
}

// Desk component
function Desk({ color, working }) {
  return (
    <svg viewBox="0 0 120 50" className="w-full h-16">
      {/* Desk surface */}
      <rect x="5" y="10" width="110" height="30" rx="4" fill="#1e1e2e" stroke={color} strokeWidth="1.5"/>
      {/* Monitor */}
      <rect x="40" y="14" width="40" height="22" rx="2" fill="#0a0a0f" stroke={color} strokeWidth="1"/>
      <rect x="43" y="17" width="34" height="16" rx="1" fill={color} opacity={working ? "0.4" : "0.15"}/>
      {/* Monitor stand */}
      <rect x="56" y="36" width="8" height="6" fill="#1e1e2e" stroke={color} strokeWidth="1"/>
      {/* Keyboard */}
      <rect x="45" y="38" width="30" height="6" rx="1" fill="#1e1e2e" stroke={color} strokeWidth="0.5"/>
      {/* Coffee mug */}
      <rect x="90" y="28" width="10" height="10" rx="2" fill={color} opacity="0.6"/>
      <rect x="92" y="26" width="6" height="4" rx="1" fill={color} opacity="0.4"/>
    </svg>
  )
}

export function AgentRoom({ department, status, fullWidth = false, loaded = false }) {
  const [animKey, setAnimKey] = useState(0)
  const isWorking = status.status === 'working'
  const isWaiting = status.status === 'waiting_approval'

  // Re-trigger animation when status changes
  useEffect(() => {
    setAnimKey(k => k + 1)
  }, [status.status, status.task])

  const AnimalComponent = PixelAnimals[department.id]

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        border border-white/10
        transition-all duration-300
        ${fullWidth ? 'col-span-2' : ''}
        ${loaded ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
      style={{ backgroundColor: '#0f0f14' }}
    >
      {/* Department color header bar */}
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{ backgroundColor: department.colorDark + 'cc' }}
      >
        <div
          className="w-3 h-3 rounded-full border border-white/30"
          style={{ backgroundColor: department.color }}
        />
        <span
          className="font-pixel text-[10px] tracking-widest uppercase"
          style={{ color: department.color }}
        >
          {department.name}
        </span>
        <span className="ml-auto text-xs text-white/40">{department.tagline}</span>
      </div>

      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar + desk area */}
          <div className="flex flex-col items-center">
            {/* Status badge */}
            <div
              className={`
                absolute z-20 ml-8 -mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                flex items-center gap-1
                ${isWorking ? 'bg-yellow-400/90 text-black' :
                  isWaiting ? 'bg-orange-400/90 text-black' :
                  'bg-green-400/90 text-black'}
              `}
            >
              {isWorking && (
                <div className="flex gap-[2px]">
                  <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                  <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                  <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                </div>
              )}
              {!isWorking && !isWaiting && <span>ONLINE</span>}
              {isWaiting && <span>WAITING</span>}
            </div>

            {/* Character + Desk */}
            <div
              key={animKey}
              className={`
                relative flex flex-col items-center
                ${isWorking ? 'animate-pulse' : ''}
                ${isWaiting ? 'animate-bounce' : ''}
              `}
              style={{
                animation: isWorking ? 'work-pulse 1.5s ease-in-out infinite' :
                           isWaiting ? 'waiting-bounce 2s ease-in-out infinite' : 'float 3s ease-in-out infinite',
              }}
            >
              {/* Character */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-1"
                style={{ backgroundColor: department.colorDark + '40' }}
              >
                <AnimalComponent working={isWorking} color={department.color} />
              </div>

              {/* Desk below character */}
              <Desk color={department.color} working={isWorking} />
            </div>

            {/* Agent emoji + name */}
            <div className="mt-1 text-center">
              <span className="text-2xl">{department.emoji}</span>
              <p className="text-xs font-bold text-white mt-0.5">{department.leaderName}</p>
            </div>
          </div>

          {/* Right side: sub-agents + task */}
          <div className="flex-1 min-w-0">
            {/* Sub-agent pills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {department.subagents.map((sub, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: department.color + '20',
                    color: department.color,
                    border: `1px solid ${department.color}30`,
                  }}
                >
                  {sub}
                </span>
              ))}
            </div>

            {/* Current task */}
            {isWorking && status.task ? (
              <div
                className="p-2 rounded-lg text-xs"
                style={{ backgroundColor: department.color + '15', border: `1px solid ${department.color}30` }}
              >
                <p className="text-white/60 mb-1 uppercase tracking-wide" style={{ fontSize: '9px' }}>Working on:</p>
                <p className="text-white font-medium leading-tight">{status.task}</p>
                {/* Progress bar */}
                <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: department.color,
                      width: '65%',
                      animation: 'progress-fill 2s ease-out forwards',
                    }}
                  />
                </div>
              </div>
            ) : isWaiting ? (
              <div className="p-2 rounded-lg text-xs bg-orange-400/10 border border-orange-400/30">
                <p className="text-orange-400 font-medium">Awaiting your approval</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg text-xs bg-green-400/5 border border-green-400/20">
                <p className="text-green-400/80 font-medium">Ready · Idle</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes work-pulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-2px); }
        }
        @keyframes waiting-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 65%; }
        }
        .pixel-char {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  )
}
