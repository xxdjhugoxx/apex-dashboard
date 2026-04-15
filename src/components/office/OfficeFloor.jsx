import React, { useState, useEffect } from 'react'
import { AgentRoom } from './AgentRoom'
import { ScrollingTicker } from './ScrollingTicker'
import { ActivityPanel } from './ActivityPanel'
import { StatsBar } from './StatsBar'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

const DEPARTMENTS = [
  {
    id: 'ceo',
    name: 'Leadership',
    color: '#EF4444',
    colorDark: '#450a0a',
    emoji: '🦁',
    leaderName: 'Leo',
    tagline: 'Strategy & Approvals',
    position: { row: 0, col: 0 }, // top-left (center spanning)
    span: 'center',
    subagents: ['Vision', 'Strategy', 'Decisions'],
  },
  {
    id: 'sales',
    name: 'Sales',
    color: '#FF6B35',
    colorDark: '#431407',
    emoji: '🦊',
    leaderName: 'Felix',
    tagline: 'Leads & Deals',
    position: { row: 1, col: 0 },
    span: 'half',
    subagents: ['Lead Gen', 'Outreach', 'Closing'],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#A855F7',
    colorDark: '#3b0764',
    emoji: '🦚',
    leaderName: 'Phoenix',
    tagline: 'Content & Brand',
    position: { row: 1, col: 1 },
    span: 'half',
    subagents: ['Content', 'Social', 'Ads'],
  },
  {
    id: 'ops',
    name: 'Operations',
    color: '#10B981',
    colorDark: '#022c22',
    emoji: '🦡',
    leaderName: 'Axel',
    tagline: 'Systems & Tasks',
    position: { row: 2, col: 0 },
    span: 'half',
    subagents: ['Scheduling', 'Automation', 'Tasks'],
  },
  {
    id: 'finance',
    name: 'Finance',
    color: '#F59E0B',
    colorDark: '#451a03',
    emoji: '🐻',
    leaderName: 'Bruno',
    tagline: 'Invoices & Budgets',
    position: { row: 2, col: 1 },
    span: 'half',
    subagents: ['Invoicing', 'Budgets', 'Tracking'],
  },
]

const MOCK_ACTIVITY = [
  { agent: 'sales', action: 'New lead qualified', detail: 'Sarah from TechCorp — $12K deal', time: '2m ago', emoji: '🦊' },
  { agent: 'marketing', action: 'Post published', detail: 'Instagram reel — 2.1K views', time: '5m ago', emoji: '🦚' },
  { agent: 'ops', action: 'Task completed', detail: 'Content calendar synced for the week', time: '8m ago', emoji: '🦡' },
  { agent: 'finance', action: 'Invoice paid', detail: 'Invoice #14 — $2,850 received', time: '12m ago', emoji: '🐻' },
  { agent: 'ceo', action: 'Strategy approved', detail: 'Q3 marketing campaign greenlit', time: '18m ago', emoji: '🦁' },
]

const TICKER_ITEMS = [
  '🦁 LEO: "The market is shifting — we stay focused"',
  '🦊 FELIX: 3 new leads in pipeline — $24K potential',
  '🦚 PHOENIX: Instagram reach up 340% this week',
  '🦡 AXEL: All systems operational — 0 issues',
  '🐻 BRUNO: Monthly revenue at 112% of target',
  '🦁 LEO: Morale report — TEAM SCORE 97/100',
  '🦊 FELIX: Closed deal with NovaTech — $4,200',
  '🦚 PHOENIX: A/B test results: variant B wins (+18% CTR)',
  '🦡 AXEL: 14 tasks completed today — new record',
  '🐻 BRUNO: Outstanding invoices: 3 — total $8,400',
]

const MOCK_STATS = {
  revenue: { value: 12840, target: 15000, label: 'Revenue' },
  leads: { value: 24, target: 30, label: 'Leads' },
  posts: { value: 12, target: 15, label: 'Posts' },
  tasks: { value: 31, target: 40, label: 'Tasks Done' },
}

export function OfficeFloor() {
  const [agentStatuses, setAgentStatuses] = useState(
    DEPARTMENTS.reduce((acc, d) => ({ ...acc, [d.id]: { status: 'idle', task: null } }), {})
  )
  const [activity] = useState(MOCK_ACTIVITY)
  const [stats] = useState(MOCK_STATS)
  const [loaded, setLoaded] = useState(false)

  // Poll Supabase for real agent status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await supabase
          .from('agent_status')
          .select('agent_id, status, current_task')
          .in('agent_id', DEPARTMENTS.map(d => d.id))
        
        if (data && data.length > 0) {
          const mapped = {}
          data.forEach(row => { mapped[row.agent_id] = { status: row.status, task: row.current_task } })
          setAgentStatuses(prev => ({ ...prev, ...mapped }))
        }
      } catch (e) {}
      setLoaded(true)
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-white/10 bg-[#0f0f14]/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center shadow-lg shadow-[#FF6B35]/30">
              <span className="font-pixel text-white text-xs">AX</span>
            </div>
            <div>
              <h1 className="font-pixel text-sm tracking-wider">APEX</h1>
              <p className="text-xs text-white/40">AI Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/60">5 Agents Online</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs text-white/40">@theapexagents_bot</span>
          </div>
        </div>
      </header>

      {/* Scrolling Ticker */}
      <ScrollingTicker items={TICKER_ITEMS} />

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Office Grid */}
      <main className="relative z-10 p-4">
        <div className="grid grid-cols-2 gap-4 max-w-6xl mx-auto">

          {/* CEO — Full Width Center */}
          <AgentRoom
            department={DEPARTMENTS[0]}
            status={agentStatuses['ceo'] || { status: 'idle', task: null }}
            fullWidth
            loaded={loaded}
          />

          {/* Row 2: Sales + Marketing */}
          <AgentRoom
            department={DEPARTMENTS[1]}
            status={agentStatuses['sales'] || { status: 'idle', task: null }}
            loaded={loaded}
          />
          <AgentRoom
            department={DEPARTMENTS[2]}
            status={agentStatuses['marketing'] || { status: 'idle', task: null }}
            loaded={loaded}
          />

          {/* Row 3: Ops + Finance */}
          <AgentRoom
            department={DEPARTMENTS[3]}
            status={agentStatuses['ops'] || { status: 'idle', task: null }}
            loaded={loaded}
          />
          <AgentRoom
            department={DEPARTMENTS[4]}
            status={agentStatuses['finance'] || { status: 'idle', task: null }}
            loaded={loaded}
          />
        </div>
      </main>

      {/* Activity Feed — Floating Right Panel */}
      <ActivityPanel activities={activity} />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-3 text-center">
        <p className="font-pixel text-[10px] text-white/20 tracking-widest">
          APEX AI COMPANY — POWERED BY NEXUS
        </p>
      </footer>
    </div>
  )
}
