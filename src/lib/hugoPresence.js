import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jbumilopcidspfujphiq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW1pb3BwY2lkc3BmdWpwYWhpcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzYyMDI4LCJleHAiOjE5NTczMzgwMjh9.ZopNUt9bD7_P6qCyBdN7pHCDc9y0qTyegH1p2n8kHNs'
)

// Track Hugo's presence: 'in_office' | 'away'
let hugoStatus = 'away'
let statusListeners = []

export const hugoPresence = {
  // Called when Hugo opens the office UI
  setInOffice: async () => {
    hugoStatus = 'in_office'
    try {
      await supabase.from('hugo_status').upsert({ id: 'hugo', status: 'in_office', updated_at: new Date().toISOString() })
    } catch (e) {}
    statusListeners.forEach(fn => fn('in_office'))
  },

  // Called when Hugo closes the tab or goes to Telegram
  setAway: async () => {
    hugoStatus = 'away'
    try {
      await supabase.from('hugo_status').upsert({ id: 'hugo', status: 'away', updated_at: new Date().toISOString() })
    } catch (e) {}
    statusListeners.forEach(fn => fn('away'))
  },

  // Get current status
  getStatus: () => hugoStatus,

  // Subscribe to status changes (for agents to react)
  onStatusChange: (fn) => {
    statusListeners.push(fn)
    return () => { statusListeners = statusListeners.filter(l => l !== fn) }
  },
}

// Listen for real-time status changes
supabase
  .channel('hugo_presence')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'hugo_status' }, (payload) => {
    if (payload.new && payload.new.status) {
      hugoStatus = payload.new.status
      statusListeners.forEach(fn => fn(payload.new.status))
    }
  })
  .subscribe()

export { supabase }
