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

export function ChatPanel({ activeAgent, onAgentSelect }) {
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
      const systemPrompt = SYSTEM_PROMPTS[selectedAgent]
      const recentMsgs = messages.slice(-8).map(m => {
        const name = AGENTS.find(a => a.id === m.agent)?.name || m.agent
        return `${name}: ${m.content}`
      }).join('\n')

      // Simulate AI response (in production, call OpenAI/Claude here)
      await new Promise(r => setTimeout(r, 800 + Math.random() * 700))

      const responses = {
        ceo: [
          'Strategy approved. Execute on my mark.',
          'Good progress. Keep me posted on milestones.',
          'The numbers support this move. Approved.',
          'Let\'s stay focused on Q3 targets. Don\'t get distracted.',
          'I\'ve reviewed the data. Here\'s my decision: proceed.',
        ],
        sales: [
          'Love the energy! I\'ll get those leads converting ASAP.',
          'Pipeline update: we\'re trending 18% above target. Let\'s keep pushing.',
          'Felix here — I just closed a $4,200 deal. Team score: unreal.',
          'Need more marketing support? I can hit $200K if you feed me more leads.',
          'Hot lead just came in — Sarah from TechCorp. $12K potential.',
        ],
        marketing: [
          'Content calendar is PACKED for the week. Expect viral.',
          'Phoenix checking in — reel hit 50K views organically. Time to amplify with ads.',
          'A/B test results are in: variant B wins by 18%. Switching all traffic.',
          'Social mentions up 400% this month. Brand is HOT.',
          'I\'m on it! Creating a thread that will 10x our reach.',
        ],
        ops: [
          'Axel here — all tasks on track. 14 completed today, zero blockers.',
          'Systems are green. Automation running at 99.2% uptime.',
          'I\'ve optimized the workflow. Efficiency up 12% this sprint.',
          'Task queue cleared. Ready for more assignments.',
          'Scheduling synced. Next 3 days are fully optimized.',
        ],
        finance: [
          'Bruno here — revenue tracking at 112% of monthly target. Looking healthy.',
          'Invoice #14 just cleared: $2,850 received. Outstanding: $8,400.',
          'Budget analysis complete. We have headroom for the Q3 expansion.',
          'All invoices reconciled. Financial runway looks solid.',
          'Monthly burn rate is sustainable. We\'re cash-flow positive.',
        ],
      }

      const opts = responses[selectedAgent] || ['Message received.']
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
