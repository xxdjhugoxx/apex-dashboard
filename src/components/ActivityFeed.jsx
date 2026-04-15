import React from 'react'

const AGENT_EMOJI = {
  ceo: '🦁',
  sales: '🦊',
  marketing: '🦚',
  ops: '🦡',
  finance: '🐻',
}

const AGENT_COLORS = {
  ceo: '#EF4444',
  sales: '#FF6B35',
  marketing: '#A855F7',
  ops: '#10B981',
  finance: '#F59E0B',
}

export function ActivityFeed({ activities }) {
  return (
    <div className="bg-apex-card rounded-2xl border border-apex-border p-4">
      <h3 className="font-pixel text-xs text-gray-400 mb-4">⚡ LIVE ACTIVITY</h3>
      
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2 rounded-lg bg-apex-bg/50"
          >
            <span className="text-lg">{AGENT_EMOJI[activity.agent]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: AGENT_COLORS[activity.agent] }}>
                  {activity.agent.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-white font-medium">{activity.action}</p>
              <p className="text-xs text-gray-400 truncate">{activity.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-xs text-gray-500 border border-apex-border rounded-lg hover:border-gray-600 transition-colors">
        View Full History →
      </button>
    </div>
  )
}
