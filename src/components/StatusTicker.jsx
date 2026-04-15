import React from 'react'

export function StatusTicker({ items }) {
  return (
    <div className="bg-apex-card border-b border-apex-border overflow-hidden">
      <div className="flex items-center">
        <div className="bg-apex-accent px-4 py-2 shrink-0">
          <span className="font-pixel text-xs text-white">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1 py-2">
          <div className="ticker-scroll flex gap-12 whitespace-nowrap">
            {[...items, ...items].map((item, i) => (
              <span key={i} className="text-sm text-gray-300">
                <span className="mx-2">{item.split(':')[0]}</span>
                {item.split(':').slice(1).join(':')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
