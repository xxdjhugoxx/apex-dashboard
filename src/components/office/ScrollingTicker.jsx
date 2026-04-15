import React from 'react'

export function ScrollingTicker({ items }) {
  return (
    <div className="relative z-10 bg-[#0f0f14] border-b border-white/5 overflow-hidden">
      <div className="flex items-center">
        {/* Live badge */}
        <div className="px-3 py-2 bg-[#FF6B35] flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-pixel text-[10px] tracking-wider">LIVE</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center ticker-track">
            <div className="ticker-content flex items-center gap-16 whitespace-nowrap animate-[ticker-scroll_30s_linear_infinite]">
              {[...items, ...items, ...items].map((item, i) => (
                <span key={i} className="text-xs text-white/50 hover:text-white/80 transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-track { mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent); }
      `}</style>
    </div>
  )
}
