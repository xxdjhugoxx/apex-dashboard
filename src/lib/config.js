// ─── APEX Realistic Config ─────────────────────────────────────────────────

export const SUPABASE_URL = 'https://jbumilopcidspfujphiq.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'

export const AGENTS = [
  { id: 'ceo',       name: 'Hugo',    emoji: '🦁', color: '#EF4444' },
  { id: 'sales',     name: 'Felix',   emoji: '🦊', color: '#FF6B35' },
  { id: 'marketing', name: 'Phoenix', emoji: '🦚', color: '#A855F7' },
  { id: 'ops',       name: 'Axel',   emoji: '🦡', color: '#10B981' },
  { id: 'finance',   name: 'Bruno',   emoji: '🐻', color: '#F59E0B' },
  { id: 'instagram', name: 'Blaze',   emoji: '📸', color: '#EC4899' },
  { id: 'engineer',  name: 'Atlas',   emoji: '🤖', color: '#06B6D4' },
]

export const DEPARTMENTS = [
  { id: 'sales',     name: 'SALES',      color: '#0D9488', agentId: 'sales'     },
  { id: 'marketing', name: 'MARKETING',  color: '#7C3AED', agentId: 'marketing'},
  { id: 'ops',       name: 'OPERATIONS', color: '#2563EB', agentId: 'ops'      },
  { id: 'finance',   name: 'FINANCE',    color: '#65A30D', agentId: 'finance'  },
  { id: 'instagram', name: 'INSTAGRAM', color: '#DB2777', agentId: 'instagram' },
  { id: 'engineer',  name: 'ENGINEERING',color: '#0891B2', agentId: 'engineer' },
]

export const INITIAL_MESSAGES = [
  { role: 'system', agent: 'ceo', content: 'Team, Q3 targets are set. Sales needs to drive $150K revenue. Marketing, get our reach up 3x. Ops, keep efficiency at 95%. Finance, maintain healthy margins. Instagram, flood our feeds. Atlas, ship the features. Let\'s execute.' },
  { role: 'agent', agent: 'sales', content: 'On it Hugo! Pipeline already at $82K. Need marketing to feed me more qualified leads and I\'ll close the gap by end of month.' },
  { role: 'agent', agent: 'marketing', content: 'Felix, Instagram is blowing up — 340% organic reach last week. Give me 2 weeks and I\'ll double those leads you need.' },
  { role: 'agent', agent: 'ops', content: 'All automations running smooth. 47 tasks completed today. Zero bottlenecks. Ready to scale when you are.' },
  { role: 'agent', agent: 'finance', content: 'Monthly burn rate looks healthy. We\'re at 112% of revenue target. Two invoices pending — should push us to 118%.' },
  { role: 'agent', agent: 'instagram', content: 'Blaze checking in — just posted a reel that hit 12K views in 2 hours. DMs are flooding in. Our follower count jumped 800 today.' },
  { role: 'agent', agent: 'engineer', content: 'Atlas here. New feature deployed to production. Build passing, all tests green. Zero downtime deployment complete.' },
]
