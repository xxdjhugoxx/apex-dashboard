import React, { useState, useEffect } from 'react'
import { AnimatedOffice } from './AnimatedOffice'
import { ChatPanel } from './ChatPanel'
import { StatsBar } from './StatsBar'
import { hugoPresence } from '../../lib/hugoPresence'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

const AGENTS = [
  { id: 'ceo',       name: 'Hugo',    emoji: '🦁', color: '#EF4444' },
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B' },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899' },
  { id: 'engineer',  name: 'Atlas',   emoji: '🤖', color: '#06B6D4' },
]

const MOCK_STATS = {
  revenue: { value: 12840, target: 15000 },
  leads:   { value: 24,    target: 30    },
  posts:   { value: 12,    target: 15    },
  tasks:   { value: 31,    target: 40    },
}

export function OfficeFloor() {
  const [agentStatuses, setAgentStatuses] = useState(
    AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: { status: 'idle', task: null } }), {})
  )
  const [activeChatAgent, setActiveChatAgent] = useState('ceo')
  const [presenceStatus, setPresenceStatus] = useState('away')

  useEffect(() => {
    hugoPresence.setInOffice()
    const unsub = hugoPresence.onStatusChange(setPresenceStatus)
    return () => { unsub(); hugoPresence.setAway() }
  }, [])

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await supabase
          .from('agent_status')
          .select('agent_id, status, current_task')
          .in('agent_id', AGENTS.map(a => a.id))
        if (data && data.length > 0) {
          const mapped = {}
          data.forEach(row => { mapped[row.agent_id] = { status: row.status || 'idle', task: row.current_task } })
          setAgentStatuses(mapped)
        }
      } catch (e) {}
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-[#0f0f14]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center">
              <span className="font-bold text-xs">AX</span>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-widest">APEX</h1>
              <p className="text-[10px] text-white/40">AI Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/60">5 Online</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              presenceStatus === 'in_office' ? 'bg-green-400/20 text-green-400' : 'bg-orange-400/20 text-orange-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${presenceStatus === 'in_office' ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
              {presenceStatus === 'in_office' ? 'In Office' : 'Away'}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <StatsBar stats={MOCK_STATS} />

      {/* Main: Office + Chat */}
      <div className="flex-1 flex shrink-0 min-h-0">

        {/* Office Canvas — fills available space */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 p-3">
          <AnimatedOffice
            agentStatuses={agentStatuses}
            onAgentClick={(id) => setActiveChatAgent(id)}
          />
        </div>

        {/* Chat Panel */}
        <div className="shrink-0 border-l border-white/5 w-80 xl:w-96 min-h-0">
          <ChatPanel
            activeAgent={activeChatAgent}
            onAgentSelect={setActiveChatAgent}
            hugoPresence={presenceStatus}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-white/5 py-2 text-center">
        <p className="text-[10px] text-white/15 tracking-widest font-bold">
          APEX AI COMPANY — POWERED BY NEXUS
        </p>
      </footer>
    </div>
  )
}
