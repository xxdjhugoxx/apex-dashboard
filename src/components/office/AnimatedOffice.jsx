import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, DEPARTMENTS } from '../../lib/config'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const STATUS_COLORS = {
  idle:       { bg: '#94A3B8', text: '#1E293B', label: 'IDLE'    },
  working:    { bg: '#FDE047', text: '#713F12', label: 'WORKING' },
  delivering: { bg: '#86EFAC', text: '#14532D', label: 'ACTIVE'  },
  offline:    { bg: '#94A3B8', text: '#1E293B', label: 'OFFLINE' },
}

function StatusTag({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.idle
  return (
    <div
      className="rounded px-1.5 py-0.5 font-bold"
      style={{ backgroundColor: s.bg, color: s.text, fontSize: 8, letterSpacing: 0.5 }}
    >
      {s.label}
    </div>
  )
}

// ─── Department Pod ─────────────────────────────────────────────────────────
function Pod({ dept, agent, status, onClick }) {
  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      style={{ border: `3px solid ${dept.color}`, backgroundColor: '#ffffff', minWidth: 150 }}
      onClick={onClick}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: dept.color }}
      >
        <span className="text-white font-black tracking-widest" style={{ fontSize: 10 }}>{dept.name}</span>
        <StatusTag status={status || 'idle'} />
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col items-center gap-2">
        {/* Agent avatar */}
        <div className="flex flex-col items-center">
          <div
            className="rounded-full flex items-center justify-center text-white font-bold border-2 shadow-sm"
            style={{
              width: 40,
              height: 40,
              backgroundColor: dept.color,
              borderColor: dept.color,
              fontSize: 20,
            }}
          >
            {agent?.emoji || '🤖'}
          </div>
          <div className="font-bold text-gray-700 mt-1" style={{ fontSize: 10 }}>
            {agent?.name || dept.agentId}
          </div>
        </div>

        {/* Desk monitors row */}
        <div className="flex gap-2 items-end">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className="rounded"
                style={{
                  width: 28,
                  height: 20,
                  backgroundColor: '#1f2937',
                  border: `2px solid ${dept.color}`,
                }}
              >
                <div className="rounded-sm m-0.5" style={{
                  width: 'calc(100% - 4px)',
                  height: 'calc(100% - 4px)',
                  backgroundColor: dept.color + '40',
                }} />
              </div>
              <div className="rounded" style={{
                width: 34,
                height: 5,
                backgroundColor: '#92400E',
                border: '1px solid #78350F',
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Boss Pod ──────────────────────────────────────────────────────────────
function BossPod({ agent, status }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '3px solid #EF4444', backgroundColor: '#ffffff', minWidth: 200 }}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: '#EF4444' }}
      >
        <span className="text-white font-black tracking-widest" style={{ fontSize: 11 }}>CHIEF EXECUTIVE</span>
        <StatusTag status={status || 'delivering'} />
      </div>

      <div className="p-3 flex flex-col items-center gap-2">
        {/* Hugo avatar with crown */}
        <div className="flex flex-col items-center">
          <div style={{
            width: 0, height: 0,
            borderLeft: '16px solid transparent',
            borderRight: '16px solid transparent',
            borderBottom: '10px solid #F59E0B',
            marginBottom: -2,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          }} />
          <div
            className="rounded-full flex items-center justify-center text-white font-bold border-2 shadow-lg"
            style={{
              width: 52,
              height: 52,
              backgroundColor: '#7f1d1d',
              borderColor: '#EF4444',
              fontSize: 26,
            }}
          >
            🦁
          </div>
          <div className="font-black text-red-600 mt-1 tracking-widest" style={{ fontSize: 12 }}>
            {agent?.name || 'HUGO'}
          </div>
        </div>

        {/* Desk monitors */}
        <div className="flex gap-3 items-end">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className="rounded"
                style={{
                  width: 36,
                  height: 26,
                  backgroundColor: '#1f2937',
                  border: '2px solid #EF4444',
                }}
              >
                <div className="rounded-sm m-1" style={{
                  width: 'calc(100% - 4px)',
                  height: 'calc(100% - 4px)',
                  backgroundColor: '#EF444440',
                }} />
              </div>
              <div className="rounded" style={{
                width: 42,
                height: 6,
                backgroundColor: '#92400E',
                border: '1px solid #78350F',
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Server Rack decoration ─────────────────────────────────────────────────
function ServerRack() {
  return (
    <div
      className="flex flex-col gap-0.5 px-1.5 py-2 rounded"
      style={{ backgroundColor: '#374151', width: 64, height: 64 }}
    >
      {[0,1,2,3].map(i => (
        <div
          key={i}
          className="flex-1 rounded-sm flex gap-0.5 p-0.5"
          style={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
        >
          {[0,1,2].map(j => (
            <div
              key={j}
              className="flex-1 rounded-sm"
              style={{ backgroundColor: i % 2 === 0 ? '#22c55e' : '#ef4444', opacity: 0.5 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Main Office ────────────────────────────────────────────────────────────
export function AnimatedOffice({ agentStatuses = {}, onAgentClick }) {
  const [deptStatuses, setDeptStatuses] = useState(
    Object.fromEntries(DEPARTMENTS.map(d => [d.id, 'idle']))
  )

  // Poll Supabase for real agent statuses every 5 seconds
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const { data } = await supabase
          .from('agent_status')
          .select('agent_id, status')
          .in('agent_id', DEPARTMENTS.map(d => d.id))

        if (data && data.length > 0) {
          const mapped = {}
          data.forEach(row => { mapped[row.agent_id] = row.status || 'idle' })
          setDeptStatuses(prev => ({ ...prev, ...mapped }))
        }
      } catch (e) {
        // Supabase not set up yet — show default idle
      }
    }

    fetchStatuses()
    const interval = setInterval(fetchStatuses, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePodClick = (dept) => {
    onAgentClick && onAgentClick(dept.agentId)
  }

  // Map dept statuses using agent id matching
  const getDeptStatus = (dept) => {
    return deptStatuses[dept.id] || 'idle'
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ backgroundColor: '#f3f4f6' }}
    >
      {/* ── Header ── */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '4px solid #374151',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#f3f4f6',
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 3,
          fontFamily: 'monospace',
        }}>🏢 APEX HQ</span>
        <div style={{ flex: 1 }} />
        <div className="flex items-center gap-1.5">
          <div className="rounded-full" style={{
            width: 7, height: 7,
            backgroundColor: '#22c55e',
            boxShadow: '0 0 6px #22c55e',
          }} />
          <span style={{ color: '#86efac', fontSize: 10, fontWeight: 'bold' }}>LIVE</span>
        </div>
      </div>

      {/* ── Grid floor ── */}
      <div
        className="flex-1 grid gap-5 p-5 overflow-auto"
        style={{
          backgroundColor: '#e5e7eb',
          backgroundImage: `
            linear-gradient(rgba(209,213,219,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(209,213,219,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          alignContent: 'start',
        }}
      >
        {/* Server racks top corners */}
        <div style={{ position: 'absolute', top: 56, left: 12 }}>
          <ServerRack />
        </div>
        <div style={{ position: 'absolute', top: 56, right: 12 }}>
          <ServerRack />
        </div>

        {/* ── Boss row ── */}
        <div className="col-span-full flex justify-center mt-2" style={{ position: 'relative', zIndex: 2 }}>
          <BossPod
            agent={agentStatuses?.ceo || { name: 'Hugo' }}
            status={agentStatuses?.ceo?.status || 'delivering'}
          />
        </div>

        {/* ── Department pods 2×3 ── */}
        <div
          className="col-span-full grid gap-4"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
        >
          {DEPARTMENTS.map(dept => {
            const agent = {
              sales:     { name: 'Felix',   emoji: '🦊' },
              marketing: { name: 'Phoenix', emoji: '🦚' },
              ops:       { name: 'Axel',   emoji: '🦡' },
              finance:   { name: 'Bruno',   emoji: '🐻' },
              instagram: { name: 'Blaze',   emoji: '📸' },
              engineer:  { name: 'Atlas',  emoji: '🤖' },
            }[dept.agentId]

            return (
              <div key={dept.id} className="flex justify-center">
                <Pod
                  dept={dept}
                  agent={agent}
                  status={getDeptStatus(dept)}
                  onClick={() => handlePodClick(dept)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
