import React from 'react'

const PIXEL_ANIMALS = {
  ceo: (
    <svg viewBox="0 0 64 64" className="w-16 h-16 pixel-char">
      {/* Lion pixel art */}
      <rect x="20" y="8" width="24" height="20" fill="#F59E0B"/>
      <rect x="16" y="12" width="4" height="12" fill="#F59E0B"/>
      <rect x="44" y="12" width="4" height="12" fill="#F59E0B"/>
      <rect x="12" y="16" width="4" height="8" fill="#F59E0B"/>
      <rect x="48" y="16" width="4" height="8" fill="#F59E0B"/>
      <rect x="24" y="12" width="16" height="12" fill="#FDE68A"/>
      <rect x="28" y="16" width="4" height="4" fill="#1a1a2e"/>
      <rect x="36" y="16" width="4" height="4" fill="#1a1a2e"/>
      <rect x="28" y="24" width="8" height="4" fill="#92400E"/>
      <rect x="20" y="32" width="24" height="20" fill="#F59E0B"/>
      <rect x="16" y="36" width="4" height="12" fill="#F59E0B"/>
      <rect x="44" y="36" width="4" height="12" fill="#F59E0B"/>
      <rect x="24" y="52" width="6" height="8" fill="#F59E0B"/>
      <rect x="34" y="52" width="6" height="8" fill="#F59E0B"/>
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 64 64" className="w-16 h-16 pixel-char">
      {/* Fox pixel art */}
      <rect x="24" y="8" width="16" height="16" fill="#FF6B35"/>
      <rect x="20" y="12" width="4" height="12" fill="#FF6B35"/>
      <rect x="40" y="12" width="4" height="12" fill="#FF6B35"/>
      <rect x="16" y="16" width="4" height="8" fill="#FF6B35"/>
      <rect x="44" y="16" width="4" height="8" fill="#FF6B35"/>
      <rect x="28" y="12" width="8" height="8" fill="#1a1a2e"/>
      <rect x="28" y="24" width="8" height="4" fill="#1a1a2e"/>
      <rect x="24" y="28" width="16" height="20" fill="#FF6B35"/>
      <rect x="28" y="32" width="8" height="8" fill="#FDE68A"/>
      <rect x="20" y="48" width="8" height="4" fill="#FF6B35"/>
      <rect x="36" y="48" width="8" height="4" fill="#FF6B35"/>
      <rect x="26" y="48" width="4" height="8" fill="#FF6B35"/>
      <rect x="34" y="48" width="4" height="8" fill="#FF6B35"/>
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 64 64" className="w-16 h-16 pixel-char">
      {/* Peacock pixel art */}
      <ellipse cx="32" cy="36" rx="14" ry="18" fill="#A855F7"/>
      <rect x="18" y="20" width="28" height="20" fill="#A855F7"/>
      <rect x="24" y="8" width="4" height="16" fill="#A855F7"/>
      <rect x="20" y="12" width="4" height="12" fill="#A855F7"/>
      <rect x="28" y="4" width="4" height="20" fill="#A855F7"/>
      <rect x="32" y="6" width="4" height="18" fill="#A855F7"/>
      <rect x="36" y="10" width="4" height="14" fill="#A855F7"/>
      <rect x="40" y="14" width="4" height="10" fill="#A855F7"/>
      <rect x="28" y="24" width="4" height="4" fill="#1a1a2e"/>
      <rect x="34" y="24" width="4" height="4" fill="#1a1a2e"/>
      <rect x="26" y="30" width="12" height="4" fill="#FDE68A"/>
      <circle cx="20" cy="12" r="2" fill="#10B981"/>
      <circle cx="28" cy="6" r="2" fill="#10B981"/>
      <circle cx="32" cy="6" r="2" fill="#10B981"/>
      <circle cx="36" cy="8" r="2" fill="#10B981"/>
      <circle cx="40" cy="14" r="2" fill="#10B981"/>
    </svg>
  ),
  ops: (
    <svg viewBox="0 0 64 64" className="w-16 h-16 pixel-char">
      {/* Badger pixel art */}
      <rect x="22" y="10" width="20" height="18" fill="#10B981"/>
      <rect x="18" y="14" width="4" height="10" fill="#10B981"/>
      <rect x="42" y="14" width="4" height="10" fill="#10B981"/>
      <rect x="28" y="10" width="8" height="8" fill="#1a1a2e"/>
      <rect x="28" y="22" width="8" height="4" fill="#1a1a2e"/>
      <rect x="24" y="28" width="16" height="18" fill="#10B981"/>
      <rect x="22" y="32" width="20" height="8" fill="#FDE68A"/>
      <rect x="18" y="46" width="8" height="4" fill="#10B981"/>
      <rect x="38" y="46" width="8" height="4" fill="#10B981"/>
      <rect x="22" y="46" width="4" height="10" fill="#10B981"/>
      <rect x="38" y="46" width="4" height="10" fill="#10B981"/>
      <rect x="28" y="50" width="8" height="6" fill="#064E3B"/>
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 64 64" className="w-16 h-16 pixel-char">
      {/* Bear pixel art */}
      <rect x="20" y="8" width="24" height="24" fill="#F59E0B"/>
      <rect x="16" y="12" width="8" height="8" fill="#F59E0B"/>
      <rect x="40" y="12" width="8" height="8" fill="#F59E0B"/>
      <rect x="20" y="8" width="8" height="8" fill="#92400E"/>
      <rect x="36" y="8" width="8" height="8" fill="#92400E"/>
      <rect x="26" y="18" width="4" height="4" fill="#1a1a2e"/>
      <rect x="34" y="18" width="4" height="4" fill="#1a1a2e"/>
      <rect x="28" y="26" width="8" height="4" fill="#92400E"/>
      <rect x="18" y="32" width="28" height="20" fill="#F59E0B"/>
      <rect x="24" y="36" width="16" height="12" fill="#FDE68A"/>
      <rect x="26" y="40" width="4" height="4" fill="#1a1a2e"/>
      <rect x="34" y="40" width="4" height="4" fill="#1a1a2e"/>
      <rect x="22" y="52" width="8" height="4" fill="#F59E0B"/>
      <rect x="34" y="52" width="8" height="4" fill="#F59E0B"/>
    </svg>
  ),
}

function DeskIcon({ color }) {
  return (
    <svg viewBox="0 0 64 40" className="w-full h-12">
      <rect x="4" y="4" width="56" height="24" rx="4" fill="#1e1e2e" stroke={color} strokeWidth="2"/>
      <rect x="8" y="28" width="12" height="12" fill="#1e1e2e" stroke={color} strokeWidth="1.5"/>
      <rect x="44" y="28" width="12" height="12" fill="#1e1e2e" stroke={color} strokeWidth="1.5"/>
      <rect x="20" y="10" width="24" height="12" rx="2" fill={color} opacity="0.3"/>
      <rect x="22" y="12" width="20" height="8" rx="1" fill={color} opacity="0.5"/>
    </svg>
  )
}

export function AgentCard({ agent, status }) {
  const isWorking = status.status === 'working'
  const isWaiting = status.status === 'waiting_approval'
  
  return (
    <div className="bg-apex-card rounded-2xl border border-apex-border overflow-hidden transition-all hover:border-opacity-60">
      {/* Department Header */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: agent.color + '20' }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: agent.color }}>
          {agent.department}
        </span>
      </div>

      {/* Agent */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar with animation */}
          <div className={`relative ${isWorking ? 'animate-work' : ''}`}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: agent.color + '20' }}>
              {PIXEL_ANIMALS[agent.id]}
            </div>
            {/* Status dot */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-apex-card flex items-center justify-center
              ${isWorking ? 'bg-yellow-400 animate-work' : isWaiting ? 'bg-orange-400' : 'bg-green-400'}`}>
              {isWorking && <div className="w-2 h-2 bg-white rounded-full animate-blink" />}
              {!isWorking && !isWaiting && <div className="w-2 h-2 bg-white rounded-full" />}
              {isWaiting && <span className="text-white text-xs">!</span>}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <h3 className="font-bold text-white text-lg leading-none">{agent.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{agent.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4">
          {isWorking && status.task ? (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-yellow-400 uppercase">Working</span>
              </div>
              <p className="text-xs text-gray-300 truncate">{status.task}</p>
              <div className="mt-2 w-full bg-apex-border rounded-full h-1.5">
                <div className="h-full rounded-full bg-yellow-400 animate-work" style={{ width: '70%' }} />
              </div>
            </div>
          ) : isWaiting ? (
            <div className="bg-orange-400/10 border border-orange-400/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-orange-400 uppercase">Waiting Approval</span>
              </div>
              <p className="text-xs text-gray-300 truncate">{status.task || 'Pending your review'}</p>
            </div>
          ) : (
            <div className="bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs font-semibold text-green-400 uppercase">Online — Idle</span>
              </div>
            </div>
          )}
        </div>

        {/* Sub-agents */}
        <div className="mt-4 flex flex-wrap gap-1">
          {agent.subagents.map((sub, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: agent.color + '15', color: agent.color }}
            >
              {sub}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
