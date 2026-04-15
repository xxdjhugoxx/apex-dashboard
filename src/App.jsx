import React, { useState, useEffect } from 'react'
import { AnimatedOffice } from './components/office/AnimatedOffice'
import { ChatPanel } from './components/office/ChatPanel'
import { StatsBar } from './components/office/StatsBar'
import { hugoPresence } from './lib/hugoPresence'
import { supabase } from './lib/supabase'

const DEFAULT_STATS = {
  revenue: { value: 12840, target: 15000 },
  leads:   { value: 24,    target: 30    },
  posts:   { value: 12,    target: 15    },
  tasks:   { value: 31,    target: 40    },
}

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('APEX Error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0a0a0f', color: '#FF6B35', padding: '40px', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2 style={{ color: '#EF4444' }}>⚠️ App Error</h2>
          <pre style={{ color: '#FDE68A', fontSize: '12px', overflow: 'auto' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', marginTop: '16px', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function OfficeFloor({ agentStatuses, onAgentClick, hugoPresence, stats, activeChatAgent, setActiveChatAgent }) {
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
              <span className="text-xs text-white/60">Live</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: hugoPresence === 'in_office' ? 'rgba(34,197,94,0.2)' : 'rgba(251,146,60,0.2)',
                color: hugoPresence === 'in_office' ? '#4ade80' : '#fb923c',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: hugoPresence === 'in_office' ? '#4ade80' : '#fb923c',
                }}
              />
              {hugoPresence === 'in_office' ? 'In Office' : 'Away'}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Main: Office + Chat */}
      <div className="flex-1 flex shrink-0 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 min-h-0 p-3">
          <AnimatedOffice
            agentStatuses={agentStatuses}
            onAgentClick={onAgentClick}
          />
        </div>
        <div className="shrink-0 border-l border-white/5 w-80 xl:w-96 min-h-0">
          <ChatPanel
            activeAgent={activeChatAgent}
            onAgentSelect={setActiveChatAgent}
            hugoPresence={hugoPresence}
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

export default function App() {
  const [presenceStatus, setPresenceStatus] = useState('away')
  const [agentStatuses, setAgentStatuses] = useState({})
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [activeChatAgent, setActiveChatAgent] = useState('ceo')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hugoPresence.setInOffice()
    const unsub = hugoPresence.onStatusChange(setPresenceStatus)

    const pollStatuses = async () => {
      try {
        const { data } = await supabase
          .from('agent_status')
          .select('agent_id, status, current_task')
        if (data && data.length > 0) {
          const mapped = {}
          data.forEach(row => { mapped[row.agent_id] = { status: row.status || 'idle', task: row.current_task } })
          setAgentStatuses(mapped)
        }
      } catch (_) {}
    }

    const pollStats = async () => {
      try {
        const { data: invoices } = await supabase.from('invoices').select('amount, status').eq('status', 'paid')
        const revenue = invoices?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0

        const { count: leads } = await supabase.from('sales_leads').select('*', { count: 'exact', head: true })
        const { count: posts } = await supabase.from('content_calendar').select('*', { count: 'exact', head: true }).eq('status', 'posted')
        const { count: tasks } = await supabase.from('agent_tasks').select('*', { count: 'exact', head: true }).eq('status', 'done')

        setStats({
          revenue: { value: revenue || 12840, target: 15000 },
          leads:   { value: leads || 24,      target: 30    },
          posts:   { value: posts || 12,      target: 15    },
          tasks:   { value: tasks || 31,      target: 40    },
        })
      } catch (_) {}
    }

    pollStatuses()
    pollStats()
    const sInterval = setInterval(pollStatuses, 5000)
    const statsInterval = setInterval(pollStats, 10000)

    setReady(true)
    return () => {
      unsub()
      hugoPresence.setAway()
      clearInterval(sInterval)
      clearInterval(statsInterval)
    }
  }, [])

  if (!ready) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#FF6B35', fontFamily: 'system-ui' }}>
        <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: 6 }}>APEX</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>AI COMMAND CENTER</div>
        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <div style={{ width: 10, height: 10, background: '#FF6B35', borderRadius: '50%', animation: 'bounce 0.8s infinite' }} />
          <div style={{ width: 10, height: 10, background: '#FF6B35', borderRadius: '50%', animation: 'bounce 0.8s infinite 0.15s', opacity: 0.7 }} />
          <div style={{ width: 10, height: 10, background: '#FF6B35', borderRadius: '50%', animation: 'bounce 0.8s infinite 0.3s', opacity: 0.4 }} />
        </div>
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <OfficeFloor
        agentStatuses={agentStatuses}
        onAgentClick={setActiveChatAgent}
        hugoPresence={presenceStatus}
        stats={stats}
        activeChatAgent={activeChatAgent}
        setActiveChatAgent={setActiveChatAgent}
      />
    </ErrorBoundary>
  )
}
