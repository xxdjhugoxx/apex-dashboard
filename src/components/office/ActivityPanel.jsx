import React from 'react'

const AGENT_META = {
  ceo: { color: '#EF4444', emoji: '🦁' },
  sales: { color: '#FF6B35', emoji: '🦊' },
  marketing: { color: '#A855F7', emoji: '🦚' },
  ops: { color: '#10B981', emoji: '🦡' },
  finance: { color: '#F59E0B', emoji: '🐻' },
}

export function ActivityPanel({ activities }) {
  return (
    <div className="fixed right-4 top-32 bottom-20 w-72 z-30 hidden xl:block">
      <div className="h-full bg-[#0f0f14]/95 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-pixel text-[10px] tracking-widest text-white/60">LIVE ACTIVITY</span>
        </div>

        {/* Activity feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{activity.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: AGENT_META[activity.agent]?.color }}
                    >
                      {activity.agent}
                    </span>
                    <span className="text-[10px] text-white/30">{activity.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-tight">{activity.action}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 leading-tight">{activity.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <button className="w-full py-2 text-xs text-white/30 hover:text-white/60 transition-colors text-center">
            View full history →
          </button>
        </div>
      </div>
    </div>
  )
}
