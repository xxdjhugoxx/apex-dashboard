import React from 'react'

const STAT_CONFIG = [
  { key: 'revenue', icon: '💰', color: '#10B981', label: 'Revenue', prefix: '$' },
  { key: 'leads', icon: '🦊', color: '#FF6B35', label: 'Leads', prefix: '' },
  { key: 'posts', icon: '🦚', color: '#A855F7', label: 'Posts', prefix: '' },
  { key: 'tasks', icon: '🦡', color: '#10B981', label: 'Tasks', prefix: '' },
]

export function StatsBar({ stats }) {
  return (
    <div className="relative z-10 bg-[#0f0f14]/80 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          {STAT_CONFIG.map((stat) => {
            const data = stats[stat.key]
            const pct = Math.round((data.value / data.target) * 100)
            const isOnTrack = pct >= 80

            return (
              <div key={stat.key} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-bold text-white">
                      {stat.prefix}{data.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/30">
                      / {stat.prefix}{data.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: isOnTrack ? stat.color : '#EF4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
