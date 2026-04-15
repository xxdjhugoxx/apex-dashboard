import React, { useState, useEffect } from 'react'
import { AgentCard } from './components/AgentCard'
import { StatusTicker } from './components/StatusTicker'
import { ActivityFeed } from './components/ActivityFeed'
import { createClient } from '@supabase/supabase-js'

// APEX Supabase connection (same project as specOPS - separate tables)
const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

const AGENTS = [
  {
    id: 'ceo',
    name: 'Leo',
    emoji: '🦁',
    department: 'Leadership',
    color: '#EF4444',
    colorDim: '#7F1D1D',
    tagline: 'Strategic. Decisive. Leads.',
    subagents: ['Vision', 'Strategy', 'Approvals'],
  },
  {
    id: 'sales',
    name: 'Felix',
    emoji: '🦊',
    department: 'Sales',
    color: '#FF6B35',
    colorDim: '#7C2D12',
    tagline: 'Closes deals. Brings revenue.',
    subagents: ['Lead Gen', 'Outreach', 'Proposals'],
  },
  {
    id: 'marketing',
    name: 'Phoenix',
    emoji: '🦚',
    department: 'Marketing',
    color: '#A855F7',
    colorDim: '#581C87',
    tagline: 'Creates buzz. Builds brand.',
    subagents: ['Content', 'Social', 'Ads'],
  },
  {
    id: 'ops',
    name: 'Axel',
    emoji: '🦡',
    department: 'Operations',
    color: '#10B981',
    colorDim: '#064E3B',
    tagline: 'Builds systems. Runs tight.',
    subagents: ['Scheduling', 'Tasks', 'Automation'],
  },
  {
    id: 'finance',
    name: 'Bruno',
    emoji: '🐻',
    department: 'Finance',
    color: '#F59E0B',
    colorDim: '#78350F',
    tagline: 'Guards the treasury.',
    subagents: ['Invoicing', 'Budgets', 'Tracking'],
  },
]

const MOCK_ACTIVITY = [
  { agent: 'sales', action: 'Closed deal', detail: '$2,400 — Client signed', time: '2m ago' },
  { agent: 'marketing', action: 'Posted', detail: 'Instagram reel — 1.2K views', time: '5m ago' },
  { agent: 'ops', action: 'Scheduled', detail: 'Content calendar updated', time: '8m ago' },
  { agent: 'finance', action: 'Invoice sent', detail: 'Invoice #12 — $850', time: '12m ago' },
  { agent: 'ceo', action: 'Approved', detail: 'Marketing campaign Q2', time: '15m ago' },
  { agent: 'sales', action: 'New lead', detail: 'Hot lead from Instagram', time: '18m ago' },
]

const TICKER_ITEMS = [
  '🦁 LEO: Reviewing Q2 strategy — 2 items pending approval',
  '🦊 FELIX: 3 deals in pipeline, 1 closing today',
  '🦚 PHOENIX: Posted to Instagram — 500+ reach in 10min',
  '🦡 AXEL: Content calendar updated for the week',
  '🐻 BRUNO: Invoice #14 sent — awaiting payment',
  '🦁 LEO: Morale report — TEAM SCORE 94/100',
  '🦊 FELIX: New lead qualified — $5K potential deal',
  '🦚 PHOENIX: A/B test live for landing page',
  '🦡 AXEL: System health check — all green ✓',
  '🐻 BRUNO: Monthly revenue up 18% vs last month',
]

export default function App() {
  const [statuses, setStatuses] = useState(
    AGENTS.reduce((acc, a) => ({ ...acc, [a.id]: { status: 'idle', task: null } }), {})
  )
  const [activity, setActivity] = useState(MOCK_ACTIVITY)
  const [tickerOffset, setTickerOffset] = useState(0)

  // Poll Supabase for agent status every 3 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_status')
          .select('agent_id, status, current_task')
        
        if (!error && data) {
          const mapped = {}
          data.forEach(row => {
            if (row.agent_id in mapped) {
              mapped[row.agent_id] = { status: row.status, task: row.current_task }
            }
          })
          if (Object.keys(mapped).length > 0) {
            setStatuses(prev => ({ ...prev, ...mapped }))
          }
        }
      } catch (e) {
        // Supabase not connected yet — use mock data
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-apex-bg">
      {/* Header */}
      <header className="border-b border-apex-border bg-apex-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-apex-accent rounded-lg flex items-center justify-center font-pixel text-xs">
              AX
            </div>
            <div>
              <h1 className="font-pixel text-sm text-white">APEX</h1>
              <p className="text-xs text-gray-400">AI Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-400">5 Agents Online</span>
            </div>
            <div className="flex items-center gap-2 bg-apex-border rounded-full px-3 py-1.5">
              <span className="text-gray-400 text-xs">@theapexagents_bot</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div className="bg-apex-card border-b border-apex-border overflow-hidden">
        <div className="flex items-center">
          <div className="bg-apex-accent px-4 py-2 shrink-0">
            <span className="font-pixel text-xs text-white">LIVE</span>
          </div>
          <div className="overflow-hidden flex-1 py-2">
            <div className="ticker-scroll flex gap-12 whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="text-sm text-gray-300">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Agent Cards — 2 columns */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGENTS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                status={statuses[agent.id] || { status: 'idle', task: null }}
              />
            ))}
          </div>

          {/* Activity Feed — 1 column */}
          <div className="space-y-4">
            <ActivityFeed activities={activity} />
            
            {/* Quick Stats */}
            <div className="bg-apex-card rounded-2xl border border-apex-border p-4">
              <h3 className="font-pixel text-xs text-gray-400 mb-4">📊 TODAY</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Revenue</span>
                  <span className="font-bold text-green-400">$3,250</span>
                </div>
                <div className="w-full bg-apex-border rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Leads</span>
                  <span className="font-bold text-apex-sales">12 new</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Posts</span>
                  <span className="font-bold text-apex-marketing">8 published</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Tasks</span>
                  <span className="font-bold text-apex-ops">14 done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-pixel text-xs text-gray-600">
            APEX AI COMPANY — POWERED BY NEXUS
          </p>
          <p className="text-xs text-gray-700 mt-1">
            5 agents working · 24/7 autonomous operations
          </p>
        </div>
      </main>
    </div>
  )
}
