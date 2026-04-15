import React, { useState, useEffect, useRef } from 'react'
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

const SYSTEM_PROMPTS = {
  ceo:      'You are Leo, the CEO. Strategic, calm, decisive. Keep messages short and executive. You approve things and give high-level direction.',
  sales:    'You are Felix, the Sales agent. Enthusiastic, persuasive, numbers-driven. Keep messages short and energetic. Focus on leads and deals.',
  marketing:'You are Phoenix, the Marketing agent. Creative, bold, trend-aware. Keep messages short and creative. Focus on content and brand.',
  ops:      'You are Axel, the Operations agent. Practical, efficient, systematic. Keep messages short and clear. Focus on tasks and systems.',
  finance:  'You are Bruno, the Finance agent. Precise, careful, thorough with numbers. Keep messages short and factual. Focus on invoices and budgets.',
}

const INITIAL_MESSAGES = [
  { role: 'system', agent: 'ceo', content: 'Team, Q3 targets are set. Sales needs to drive $150K revenue. Marketing, get our reach up 3x. Ops, keep efficiency at 95%. Finance, maintain healthy margins. Instagram, flood our feeds. Atlas, ship the features. Let\'s execute.' },
  { role: 'agent', agent: 'sales', content: 'On it Hugo! Pipeline already at $82K. Need marketing to feed me more qualified leads and I\'ll close the gap by end of month.' },
  { role: 'agent', agent: 'marketing', content: 'Felix, Instagram is blowing up — 340% organic reach last week. Give me 2 weeks and I\'ll double those leads you need.' },
  { role: 'agent', agent: 'ops', content: 'All automations running smooth. 47 tasks completed today. Zero bottlenecks. Ready to scale when you are.' },
  { role: 'agent', agent: 'finance', content: 'Monthly burn rate looks healthy. We\'re at 112% of revenue target. Two invoices pending — should push us to 118%.' },
  { role: 'agent', agent: 'instagram', content: 'Blaze checking in — just posted a reel that hit 12K views in 2 hours. DMs are flooding in. Our follower count jumped 800 today.' },
  { role: 'agent', agent: 'engineer', content: 'Atlas here. New feature deployed to production. Build passing, all tests green. Zero downtime deployment complete.' },
]

export function ChatPanel({ activeAgent, onAgentSelect, hugoPresence = 'away' }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(activeAgent || 'ceo')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeAgent) setSelectedAgent(activeAgent)
  }, [activeAgent])

  // Presence-aware system prompts — agents know if Hugo is in or out
  const systemPrompts = {
    in_office: {
      ceo:      'Hugo is IN THE OFFICE right now. He can see and respond immediately. Be direct, collaborative, and proactive. Ask for approvals if needed. This is real-time interaction.',
      sales:    'Hugo is IN THE OFFICE and can chat directly. Be energetic and collaborative. Report pipeline status and ask for help closing deals. Real-time conversation.',
      marketing:'Hugo is IN THE OFFICE — he can give instant feedback on creative. Show him what\'s performing. Ask for content approvals. Be bold and creative.',
      ops:      'Hugo is IN THE OFFICE — systems status update in real-time. Report blockers. Get instant approvals. Stay efficient and precise.',
      finance:  'Hugo is IN THE OFFICE — budget discussions in real-time. Share financial updates. Get instant approval on spending. Be thorough and precise.',
    },
    away: {
      ceo:      'Hugo is AWAY from the office (on Telegram). Work autonomously. Send periodic summary updates. Make decisions yourself unless it\'s a major strategic call. Keep him in the loop but don\'t wait on him.',
      sales:    'Hugo is AWAY — keep the pipeline moving. Work leads autonomously. Send him updates on Telegram when milestones hit. No need to wait for approvals.',
      marketing:'Hugo is AWAY — execute the content calendar independently. Post what\'s scheduled. Drop him Telegram updates when big wins happen (viral posts, milestone reach).',
      ops:      'Hugo is AWAY — keep all systems running. Handle tasks autonomously. Alert him via Telegram only for critical issues.',
      finance:  'Hugo is AWAY — manage invoices and budgets independently. Reconcile daily. Send Telegram summary every evening with financial status.',
    },
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', agent: selectedAgent, content: text }])
    setIsTyping(true)

    try {
      // Check for command patterns
      const lower = text.toLowerCase()

      if (lower.startsWith('/')) {
        // Slash command → route to specific agent
        const cmd = lower.slice(1)
        const target = AGENTS.find(a => a.name.toLowerCase() === cmd || a.id === cmd)
        if (target) {
          setMessages(prev => [...prev, {
            role: 'agent', agent: target.id,
            content: `${target.emoji} ${target.name} received your command: "${text}". Processing now...`
          }])
          setIsTyping(false)
          return
        }
      }

      // Build context for selected agent
      const agentMeta = AGENTS.find(a => a.id === selectedAgent)
      const presencePrompt = systemPrompts[hugoPresence]?.[selectedAgent] || systemPrompts.away[selectedAgent]
      const recentMsgs = messages.slice(-8).map(m => {
        const name = AGENTS.find(a => a.id === m.agent)?.name || m.agent
        return `${name}: ${m.content}`
      }).join('\n')

      // Simulate AI response (in production, call OpenAI/Claude here)
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600))

      const responses = {
        ceo: {
          in_office: ['Boss, Q3 numbers ready. Walk you through?', 'Hugo — briefing prepped. Priority today?', '3 decisions need your sign-off.', 'Team morale 97/100. Analysis ready.', "I've cleared my schedule."],
          away: ['Morning review done. Pipeline strong.', 'All 5 depts on track. No blockers.', 'Q3 strategy executing. Milestone hit.', 'Team executing well. Handling the rest.', '18% ahead of target.'],
        },
        sales: {
          in_office: ['Felix ON IT! Hot lead — Sarah, $12K.', 'Pipeline trending. 3 deals closing.', 'Just closed $4,200! Celebration?', 'Incredible momentum. Dashboard?', '3 new leads. Who first?'],
          away: ['2 deals closed today, $8,400.', 'Lead gen at 140% of target.', 'Hot lead in — $15K, 78% prob.', 'Running autonomously. On track.', 'Sales floor is HOT.'],
        },
        marketing: {
          in_office: ['Reel VIRAL — 50K views. Ad budget?', 'A/B test done — variant B wins +18%.', 'Content calendar ready.', 'Brand up 340%. Walk you through?', 'COLLAB opportunity. Deal terms?'],
          away: ['Instagram 100K reach this week.', 'Reel live. Watching engagement.', 'Socials up 400%. Day 2 campaign.', 'CTR 4.2%. Budget optimized.', '4 pieces posted. Engagement 8.7%.'],
        },
        ops: {
          in_office: ['Systems green. Automation idea.', 'Bottleneck found. Walk you through?', 'Uptime 99.2%. Want breakdown?', '3 workflows optimized. Approve?', 'Task queue cleared. Need me?'],
          away: ['47 tasks done. 99.2% uptime.', '3 workflows automated. Monitoring.', 'Schedule synced. All allocated.', 'Ops sprint done. Systems green.', 'Automation complete. All clear.'],
        },
        finance: {
          in_office: ['Invoice #15 cleared — $3,200.', 'Burn rate perfect. 4.5mo runway.', '112% of target. Review?', '2 invoices pending. Sign off?', 'Invoices reconciled. Summary?'],
          away: ['Revenue 112%. Outstanding $8,400.', '3 invoices sent, 2 paid $5,100.', 'Margins up 3%. Summary sent.', 'Budgets within limits. No escalate.', 'Runway 4.5mo. Monitoring closely.'],
        },
        instagram: {
          in_office: ['Blaze here! Reel hit 12K views.', 'Followers up 800 today. DMs flooding.', 'New post going LIVE now.', 'Collaboration request — approve?', 'Analytics look AMAZING. Want the report?'],
          away: ['Blaze: reel 12K views in 2hrs.', '800 new followers today.', 'Content posted. Engagement HIGH.', 'Running IG autonomously.', 'Story up. Monitoring replies.'],
        },
        engineer: {
          in_office: ['Atlas here. Feature deployed.', 'Build passing. Tests green.', 'Zero bugs. Ready to ship.', 'Code review done. LGTM.', 'Architecture optimized. Want demo?'],
          away: ['Atlas: feature shipped. Zero downtime.', 'Build complete. All tests passing.', 'Code deployed to production.', 'Deploying sprint 4.', 'Monitoring metrics post-launch.'],
        },
      }

      const opts = responses[selectedAgent]?.[hugoPresence] || responses[selectedAgent]?.away || ['Message received.']
      const response = opts[Math.floor(Math.random() * opts.length)]

      setMessages(prev => [...prev, {
        role: 'agent',
        agent: selectedAgent,
        content: `${agentMeta?.emoji} ${response}`
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent', agent: selectedAgent,
        content: `${AGENTS.find(a => a.id === selectedAgent)?.emoji} Sorry, I encountered an issue. Please try again.`
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
      {/* Header — Agent Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-white/5 overflow-x-auto">
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            onClick={() => { setSelectedAgent(agent.id); onAgentSelect && onAgentSelect(agent.id) }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0
              ${selectedAgent === agent.id
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
              }
            `}
            style={{
              backgroundColor: selectedAgent === agent.id ? agent.color + '30' : 'transparent',
              border: `1px solid ${selectedAgent === agent.id ? agent.color + '60' : 'transparent'}`,
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
          const isSelected = msg.agent === selectedAgent

          return (
            <div
              key={i}
              className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                style={{
                  backgroundColor: isUser ? '#FF6B35' : (agent?.color + '30' || '#333'),
                  border: `1px solid ${isUser ? '#FF6B35' : (agent?.color + '50' || '#333')}`,
                }}
              >
                {isUser ? '👤' : agent?.emoji}
              </div>

              {/* Bubble */}
              <div
                className={`
                  max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                  ${isUser
                    ? 'bg-[#FF6B35] text-white rounded-tr-md'
                    : 'bg-white/5 text-white/90 rounded-tl-md border border-white/5'
                  }
                  ${isSelected && !isUser ? 'border-l-2' : ''}
                `}
                style={isSelected && !isUser ? { borderLeftColor: agent?.color } : {}}
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

        {/* Typing indicator */}
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
            ref={inputRef}
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
          Or type <span className="text-white/40">/leo /felix /phoenix /axel /bruno</span> to ping a specific agent
        </p>
      </div>
    </div>
  )
}
