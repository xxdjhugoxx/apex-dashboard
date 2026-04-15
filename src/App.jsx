import React, { useState, useEffect } from 'react'
import { OfficeFloor } from './components/office/OfficeFloor'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay to let everything initialize, then show the app
    const t = setTimeout(() => setReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!ready) {
    return (
      <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
        <div className="text-4xl mb-4">🏢</div>
        <div className="font-bold text-sm text-white/60 tracking-widest mb-1">APEX</div>
        <div className="text-xs text-white/30">Loading office...</div>
        <div className="mt-6 flex gap-1">
          <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return <OfficeFloor />
}
