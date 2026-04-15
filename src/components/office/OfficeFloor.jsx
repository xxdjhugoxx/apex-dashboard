import React, { useState, useEffect } from 'react'
import { AnimatedOffice } from './AnimatedOffice'
import { ChatPanel } from './ChatPanel'
import { StatsBar } from './StatsBar'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

const AGENTS = [
  { id: 'ceo',      name: 'Leo',     emoji: '🦁', color: '#EF4444' },
  { id: 'sales',    name: 'Felix',  emoji: '🦊', color: '#FF6B35' },
  { id: 'marketing',name: 'Phoenix',emoji: '🦚', color: '#A855F7' },
  { id: 'ops',      name: 'Axel',   emoji: '🦡', color: '#10B981' },
  { id: 'finance',  name: 'Bruno',  emoji: '🐻', color: '#F59E0B' },
]

const MOCK_STATS = {
  revenue: { value: 12840, target: 15000, label: 'Revenue' },
  leads:   { value: 24,    target: 30,    label: 'Leads'    },
  posts:   { value: 12,    target: 15,    label: 'Posts'    },
  tasks:   { value: 31,    target: 40,    label: 'Tasks'    },
}

export function OfficeFloor() {
  const [agentStatuses, setAgentStatuses] = useState(
    AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: { status: 'idle', task: null } }), {})
  )
  const [activeChatAgent, setActiveChatAgent] = useState('ceo')
  const [activeTab, setActiveTab] = useState('office') // 'office' | 'chat'
  const [stats] = useState(MOCK_STATS)

  // Poll Supabase for real agent status
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
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden flex flex-col">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="z-10 border-b border-white/10 bg-[#0f0f14]/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center shadow-lg shadow-[#FF6B35]/30">
              <span className="font-bold text-xs">AX</span>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider">APEX</h1>
              <p className="text-[10px] text-white/40">AI Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/60">5 Online</span>
            </div>
            <span className="text-xs text-white/30 hidden sm:block">@theapexagents_bot</span>
          </div>
        </div>
      </header>

      {/* ── Tab Toggle ────────────────────────────────────────────────────── */}
      <div className="z-10 bg-[#0f0f14]/80 border-b border-white/5 shrink-0">
        <div className="flex px-4 gap-1">
          {[
            { id: 'office', label: '🏢 Office', short: 'Office' },
            { id: 'chat',   label: '💬 Team Chat', short: 'Chat' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all
                ${activeTab === tab.id
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-white/40 hover:text-white/70'
                }
              `}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <StatsBar stats={stats} />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Office Canvas */}
        <div className={`flex-1 overflow-hidden transition-all ${activeTab === 'chat' ? 'hidden lg:flex' : 'flex flex-col'}`}>
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatedOffice
              agentStatuses={agentStatuses}
              onAgentClick={(id) => {
                setActiveChatAgent(id)
                setActiveTab('chat')
              }}
            />
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className={`
          w-full lg:w-96 shrink-0 border-l border-white/5
          ${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
            <ChatPanel
              activeAgent={activeChatAgent}
              onAgentSelect={setActiveChatAgent}
            />
          </div>
        </div>

      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-white/5 py-2 text-center">
        <p className="text-[10px] text-white/15 tracking-widest font-bold">
          APEX AI COMPANY — POWERED BY NEXUS
        </p>
      </footer>
    </div>
  )
}
