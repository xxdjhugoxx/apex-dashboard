import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

const AGENTS = [
  { id: 'ceo',      name: 'Leo',     emoji: '🦁', color: '#EF4444' },
  { id: 'sales',    name: 'Felix',   emoji: '🦊', color: '#FF6B35' },
  { id: 'marketing',name: 'Phoenix', emoji: '🦚', color: '#A855F7' },
  { id: 'ops',      name: 'Axel',    emoji: '🦡', color: '#10B981' },
  { id: 'finance',  name: 'Bruno',   emoji: '🐻', color: '#F59E0B' },
]

const SYSTEM_PROMPTS = {
  ceo:      'You are Leo, the CEO. Strategic, calm, decisive. Keep messages short and executive. You approve things and give high-level direction.',
  sales:    'You are Felix, the Sales agent. Enthusiastic, persuasive, numbers-driven. Keep messages short and energetic. Focus on leads and deals.',
  marketing:'You are Phoenix, the Marketing agent. Creative, bold, trend-aware. Keep messages short and creative. Focus on content and brand.',
  ops:      'You are Axel, the Operations agent. Practical, efficient, systematic. Keep messages short and clear. Focus on tasks and systems.',
  finance:  'You are Bruno, the Finance agent. Precise, careful, thorough with numbers. Keep messages short and factual. Focus on invoices and budgets.',
}

const INITIAL_MESSAGES = [
  { role: 'system', agent: 'ceo', content: 'Team, Q3 targets are set. Sales needs to drive $150K revenue. Marketing, get our reach up 3x. Ops, keep efficiency at 95%. Finance, maintain healthy margins. Let\'s execute.' },
  { role: 'agent', agent: 'sales', content: 'On it Leo! Pipeline already at $82K. Need marketing to feed me more qualified leads and I\'ll close the gap by end of month.' },
  { role: 'agent', agent: 'marketing', content: 'Felix, Instagram is blowing up — 340% organic reach last week. Give me 2 weeks and I\'ll double those leads you need.' },
  { role: 'agent', agent: 'ops', content: 'All automations running smooth. 47 tasks completed today. Zero bottlenecks. Ready to scale when you are.' },
  { role: 'agent', agent: 'finance', content: 'Monthly burn rate looks healthy. We\'re at 112% of revenue target. Two invoices pending — should push us to 118%.' },
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
          in_office: [
            'Boss, I have the Q3 numbers ready. Want me to walk you through the breakdown?',
            'Leo here — the leadership briefing is prepped. What\'s our priority for today?',
            'Three strategic decisions need your sign-off. Should we tackle them now?',
            'Team morale is at 97/100 this week. What\'s driving that? Want my analysis?',
            'I\'ve cleared my schedule — full focus on whatever you need.',
          ],
          away: [
            'Hugo, just finished my morning review. Pipeline looks strong. Working autonomously today — I\'ll ping you if anything needs escalation.',
            'Periodic update: all 5 departments on track. No blockers. Continuing execution.',
            'Q3 strategy execution in progress. Major milestone hit on revenue. Will update you via Telegram.',
            'No major decisions needed today. Team is executing well. I\'m handling the rest.',
            'Morning briefing complete. We\'re 18% ahead of target. Monitoring closely.',
          ],
        },
        sales: {
          in_office: [
            'Felix in the house! Got a hot lead — Sarah from TechCorp, $12K. Want me to loop you in?',
            'Pipeline is TRENDING. Three deals closing this week. Need marketing to feed me more and I\'ll hit $200K EOM.',
            'Yo! Just closed $4,200 with NovaTech. Can I get a quick approval to throw a team celebration lunch?',
            'Felix here — I\'m seeing some incredible momentum. Want me to show you the dashboard?',
            'Boss! 3 new qualified leads today. Who should I prioritize — your call.',
          ],
          away: [
            'Felix reporting in — 2 deals closed today, $8,400 total. Sending full pipeline update to Telegram now.',
            'Auto-update: Lead gen hitting 140% of target this week. Felix is LOCKED IN. Working the phones.',
            'Hot lead just came in while you were out — already qualified, $15K potential. Closing probability: 78%.',
            'Felix here, running autonomously. All active deals on track. Will update when major milestones hit.',
            'Sales floor is HOT today. Two more meetings scheduled. Pipeline growing fast — you\'ll see the numbers tonight.',
          ],
        },
        marketing: {
          in_office: [
            'Phoenix here! Instagram reel is VIRAL — 50K views and climbing. Want to see the analytics before I push ad budget?',
            'Hey Boss! A/B test results are in — variant B wins by 18%. Want to greenlight the switch before I scale?',
            'Content calendar for next week is READY. Can you review the highlights? Want your take on the strategy.',
            'Phoenix checking in — brand awareness up 340% this month. Want me to walk you through the campaign breakdown?',
            'Boss! Got a COLLAB opportunity — micro-influencer wants to partner. Can you approve the deal terms?',
          ],
          away: [
            'Phoenix dropping a Telegram update: Instagram hit 100K reach this week. Organic growth insane. Boosting with ads now.',
            'Content drop complete — new reel went live. Watching engagement closely. Will escalate if it goes viral.',
            'Marketing update: social mentions up 400%. Running day 2 of the campaign. All metrics green. Executing autonomously.',
            'Phoenix working the algorithms. Day 3 of paid campaign — CTR at 4.2%, well above industry standard. Budget optimized.',
            'Morning content sprint done. Posted 4 pieces across channels. Engagement rate: 8.7%. Brand growing fast.',
          ],
        },
        ops: {
          in_office: [
            'Axel here! Systems are green. Got an automation idea — want me to show you the workflow before I deploy it?',
            'Boss, noticed a bottleneck in the task queue. Can I get 2 mins to walk you through the fix?',
            'Morning systems check complete. 99.2% uptime across all tools. Want the detailed breakdown?',
            'Axel here — I optimized 3 workflows today. Efficiency up 12%. Can you approve the changes before I roll out?',
            'Hey! Task queue is CLEARED. Got 20 min before my next automation run. Anything you need?',
          ],
          away: [
            'Axel reporting: all 47 tasks completed today. Zero blockers. Systems running at 99.2% uptime. Fully autonomous.',
            'Ops update: automated 3 new workflows today. Efficiency up 12%. Will monitor overnight and escalate if anything breaks.',
            'Axel here — scheduling synced for the next 3 days. All resources optimally allocated. Running in background.',
            'Morning ops sprint complete. Task queue: empty. Team utilization: 94%. Systems: green. Nothing to escalate.',
            'Daily automation run complete. No intervention needed. Evening status: all clear. Monitoring overnight.',
          ],
        },
        finance: {
          in_office: [
            'Bruno here! Invoice #15 just cleared — $3,200 received. Want me to walk you through the cash flow?',
            'Boss, monthly burn rate looks PERFECT. Got 4.5 months runway. Want my breakdown of the Q3 budget?',
            'Hey! Financial report is ready. We\'re at 112% of revenue target. Want to review before I finalize the projections?',
            'Bruno here — two invoices pending approval. Can you sign off so I can send them out?',
            'Finance update: all invoices reconciled. Healthy margins maintained. Want me to prepare the investor summary?',
          ],
          away: [
            'Bruno here — daily financial sync complete. Revenue at 112% of target. Outstanding invoices: $8,400. All healthy.',
            'Evening finance update: 3 invoices sent, 2 paid today totaling $5,100. Cash position strong. No action needed.',
            'Bruno running autonomously. Monthly reconciliation complete. Margins up 3% vs last month. Summary sent to Telegram.',
            'Financial health check: all budgets within limits. Burn rate sustainable. Q3 projections updated. Nothing to escalate.',
            'Bruno here: financial forecast updated. 4.5 month runway confirmed. Next invoice cycle in 5 days. Will monitor closely.',
          ],
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
