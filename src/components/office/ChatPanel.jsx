import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { AGENTS, INITIAL_MESSAGES } from '../../lib/config'

// Presence-aware system prompts
const PRESENCE_PROMPTS = {
  in_office: {
    ceo:      'Hugo is IN THE OFFICE — real-time chat. Be direct and collaborative. Make decisions now.',
    sales:    'Hugo is IN THE OFFICE and can respond instantly. Report pipeline status, ask for help closing deals.',
    marketing: 'Hugo is IN THE OFFICE — he can approve creative and give instant feedback. Be bold and proactive.',
    ops:      'Hugo is IN THE OFFICE — systems status in real-time. Report blockers, get instant approvals.',
    finance:  'Hugo is IN THE OFFICE — budget discussions in real-time. Share updates, get spending approvals.',
    instagram: 'Hugo is IN THE OFFICE — can approve posts and give instant feedback. Show what\'s performing.',
    engineer: 'Hugo is IN THE OFFICE — can do code reviews and approve deploys instantly.',
  },
  away: {
    ceo:      'Hugo is AWAY — work autonomously. Send summary updates. Make calls without waiting.',
    sales:    'Hugo is AWAY — keep pipeline moving. Update via Telegram on milestones.',
    marketing: 'Hugo is AWAY — execute the content calendar. Report wins via Telegram.',
    ops:      'Hugo is AWAY — keep systems running. Escalate only critical issues.',
    finance:  'Hugo is AWAY — manage finances independently. Send evening summary.',
    instagram: 'Hugo is AWAY — post as scheduled. DM him big wins on Telegram.',
    engineer: 'Hugo is AWAY — ship features and deploy. Report completed work via activity log.',
  },
}

export function ChatPanel({ activeAgent, onAgentSelect, hugoPresence = 'away' }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(activeAgent || 'ceo')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeAgent) setSelectedAgent(activeAgent)
  }, [activeAgent])

  const sendMessage = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')

    setMessages(prev => [...prev, { role: 'user', agent: selectedAgent, content: text }])
    setIsTyping(true)

    try {
      const lower = text.toLowerCase()

      // Slash command routing
      if (lower.startsWith('/')) {
        const cmd = lower.slice(1)
        const target = AGENTS.find(a => a.name.toLowerCase() === cmd || a.id === cmd)
        if (target) {
          setMessages(prev => [...prev, {
            role: 'agent', agent: target.id,
            content: `${target.emoji} ${target.name} received: "${text}". I'll handle this now.`
          }])
          setIsTyping(false)
          return
        }
      }

      const agentMeta = AGENTS.find(a => a.id === selectedAgent)
      const prompt = PRESENCE_PROMPTS[hugoPresence]?.[selectedAgent] || PRESENCE_PROMPTS.away[selectedAgent]

      // Build context
      const recentMsgs = messages.slice(-8).map(m => {
        const name = AGENTS.find(a => a.id === m.agent)?.name || m.agent
        return `${name}: ${m.content}`
      }).join('\n')

      // Call Supabase edge function or AI (placeholder for now)
      // In production: call your AI agent endpoint here
      await new Promise(r => setTimeout(r, 800))

      // Realistic response based on agent role
      const responses = {
        ceo: {
          in_office: ['Q3 analysis ready. Walk you through the numbers?', '3 priorities need your call. Ready?', 'Team is performing. No blockers.'],
          away: ['Morning review done. All depts on track.', 'No critical issues. Executing plan.', 'Team hitting milestones. Handling independently.'],
        },
        sales: {
          in_office: ['Pipeline at $82K. Need marketing leads to close gap.', '3 hot deals in final stage. Want to review?', 'Felix has momentum. Pipeline strong.'],
          away: ['Closed $8,400 today. Running pipeline independently.', 'Lead gen 140% of target. Working autonomously.', 'Sales floor is hot. No help needed.'],
        },
        marketing: {
          in_office: ['340% organic reach last week. Want to see the campaign?', 'Content calendar ready. Need your approval on creative.', 'A/B test ready. Which variant should we push?'],
          away: ['Instagram organic reach up 340%. Executing campaign plan.', '3 posts live. Engagement tracking. No intervention needed.', 'Brand campaign running. Monitoring metrics.'],
        },
        ops: {
          in_office: ['Uptime 99.2%. Systems GREEN. Want the breakdown?', '3 workflows optimized. Ready to scale.', 'Task queue clear. No blockers. Ready for next sprint.'],
          away: ['47 tasks completed today. All systems operational.', 'Automation running. Efficiency at 95%. No escalate needed.', 'Ops sprint done. Ready for next priority.'],
        },
        finance: {
          in_office: ['Burn rate healthy. 4.5mo runway. Want the full report?', '112% of revenue target. Two invoices pending your sign-off.', 'Monthly reconciliation done. Margins up 3%.'],
          away: ['Revenue 112% of target. No corrective action needed.', '3 invoices sent, 2 paid ($5,100). Running normal.', 'Budgets within limits. Financial health: GREEN.'],
        },
        instagram: {
          in_office: ['Reel hit 12K views in 2 hours. DMs flooding.', 'Follower count +800 today. Want to see analytics?', 'New post ready. Need approval before going live.'],
          away: ['Reel live. 12K views in 2hrs. Engagement HIGH.', 'Content posted as scheduled. Monitoring DMs.', 'Blaze running IG autonomously. No intervention needed.'],
        },
        engineer: {
          in_office: ['Sprint 4 feature deployed. Zero downtime.', 'Build passing, tests green. Ready for code review.', 'Architecture optimized. Want a demo?'],
          away: ['Feature shipped to production. Zero downtime.', 'Sprint 4 complete. All tests passing.', 'Deploying now. Monitoring post-launch metrics.'],
        },
      }

      const opts = responses[selectedAgent]?.[hugoPresence] || responses[selectedAgent]?.away || ['Message received. Handling it.']
      const reply = opts[Math.floor(Math.random() * opts.length)]

      setMessages(prev => [...prev, {
        role: 'agent',
        agent: selectedAgent,
        content: `${agentMeta?.emoji} ${reply}`
      }])

      // Log activity to Supabase
      try {
        await supabase.from('agent_activity').insert({
          agent_id: selectedAgent,
          activity: text.slice(0, 100),
          result: reply,
          hugo_present: hugoPresence === 'in_office',
        })
      } catch (_) {}
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent', agent: selectedAgent,
        content: `${AGENTS.find(a => a.id === selectedAgent)?.emoji} Message logged. I'll follow up shortly.`
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f14] rounded-2xl border border-white/10 overflow-hidden">
      {/* Agent Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-white/5 overflow-x-auto">
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            onClick={() => { setSelectedAgent(agent.id); onAgentSelect && onAgentSelect(agent.id) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            style={{
              backgroundColor: selectedAgent === agent.id ? agent.color + '30' : 'transparent',
              border: `1px solid ${selectedAgent === agent.id ? agent.color + '60' : 'transparent'}`,
              color: selectedAgent === agent.id ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          >
            <span>{agent.emoji}</span>
            <span>{agent.name}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          const agent = AGENTS.find(a => a.id === msg.agent)

          return (
            <div key={i} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                style={{
                  backgroundColor: isUser ? '#FF6B35' : (agent?.color + '30' || '#333'),
                  border: `1px solid ${isUser ? '#FF6B35' : (agent?.color + '50' || '#333')}`,
                }}
              >
                {isUser ? '👤' : agent?.emoji}
              </div>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  isUser ? 'bg-[#FF6B35] text-white rounded-tr-md' : 'bg-white/5 text-white/90 rounded-tl-md'
                }`}
              >
                {!isUser && agent && (
                  <p className="text-[10px] font-bold mb-1" style={{ color: agent.color }}>
                    {agent.emoji} {agent.name}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ backgroundColor: (AGENTS.find(a => a.id === selectedAgent)?.color || '#333') + '30' }}
            >
              {AGENTS.find(a => a.id === selectedAgent)?.emoji}
            </div>
            <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 focus-within:border-[#FF6B35]/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${AGENTS.find(a => a.id === selectedAgent)?.name || 'agent'}...`}
            className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#FF8855] transition-colors text-sm"
          >
            →
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-1.5 text-center">
          Type <span className="text-white/40">/felix /phoenix /axel /bruno /blaze /atlas</span> to ping an agent
        </p>
      </div>
    </div>
  )
}
