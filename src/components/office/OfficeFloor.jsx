import React, { useState, useEffect } from 'react'
import { OfficeFloor } from './OfficeFloor'
import { ChatPanel } from './ChatPanel'
import { StatsBar } from './StatsBar'
import { hugoPresence } from '../../lib/hugoPresence'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/config'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const DEFAULT_STATS = {
  revenue: { value: 12840, target: 15000 },
  leads:   { value: 24,    target: 30    },
  posts:   { value: 12,    target: 15    },
  tasks:   { value: 31,    target: 40    },
}

export default function App() {
  const [presenceStatus, setPresenceStatus] = useState('away')
  const [agentStatuses, setAgentStatuses] = useState({})
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [activeChatAgent, setActiveChatAgent] = useState('ceo')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Mark Hugo as in-office when web dashboard is open
    hugoPresence.setInOffice()
    const unsub = hugoPresence.onStatusChange(setPresenceStatus)

    // Load Hugo's presence
    const loadPresence = async () => {
      try {
        const { data } = await supabase
          .from('hugo_status')
          .select('status')
          .eq('id', 1)
          .single()
        if (data) setPresenceStatus(data.status === 'in_office' ? 'in_office' : 'away')
      } catch (_) {}
    }
    loadPresence()

    // Poll agent statuses from Supabase
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
    pollStatuses()
    const statusInterval = setInterval(pollStatuses, 5000)

    // Poll stats from Supabase (sales_leads, tasks, etc.)
    const pollStats = async () => {
      try {
        // Revenue from invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('amount, status')
        const revenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0

        // Leads count
        const { count: leads } = await supabase
          .from('sales_leads')
          .select('*', { count: 'exact', head: true })

        // Posts count (from content calendar)
        const { count: posts } = await supabase
          .from('content_calendar')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'posted')

        // Tasks count
        const { count: tasks } = await supabase
          .from('agent_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'done')

        setStats({
          revenue: { value: revenue || 12840, target: 15000 },
          leads:   { value: leads || 24,      target: 30    },
          posts:   { value: posts || 12,      target: 15    },
          tasks:   { value: tasks || 31,      target: 40    },
        })
      } catch (_) {}
    }
    pollStats()
    const statsInterval = setInterval(pollStats, 10000)

    setReady(true)

    return () => {
      unsub()
      hugoPresence.setAway()
      clearInterval(statusInterval)
      clearInterval(statsInterval)
    }
  }, [])

  if (!ready) {
    return (
      <div style={{
        background: '#0a0a0f',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#FF6B35',
        fontFamily: 'system-ui',
      }}>
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
    <OfficeFloor
      agentStatuses={agentStatuses}
      onAgentClick={setActiveChatAgent}
      hugoPresence={presenceStatus}
      stats={stats}
    />
  )
}

// Re-export OfficeFloor as named export for backwards compat
export { OfficeFloor }
