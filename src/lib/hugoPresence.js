import { supabase } from './supabase'

// Track Hugo's presence: 'in_office' | 'away'
let hugoStatus = 'away'
let statusListeners = []

export const hugoPresence = {
  setInOffice: async () => {
    hugoStatus = 'in_office'
    try {
      await supabase.from('hugo_status').upsert({ id: 'hugo', status: 'in_office', updated_at: new Date().toISOString() })
    } catch (e) {}
    statusListeners.forEach(fn => fn('in_office'))
  },

  setAway: async () => {
    hugoStatus = 'away'
    try {
      await supabase.from('hugo_status').upsert({ id: 'hugo', status: 'away', updated_at: new Date().toISOString() })
    } catch (e) {}
    statusListeners.forEach(fn => fn('away'))
  },

  getStatus: () => hugoStatus,

  onStatusChange: (fn) => {
    statusListeners.push(fn)
    return () => { statusListeners = statusListeners.filter(l => l !== fn) }
  },
}

// Listen for real-time changes
supabase
  .channel('hugo_presence')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'hugo_status' }, (payload) => {
    if (payload.new && payload.new.status) {
      hugoStatus = payload.new.status
      statusListeners.forEach(fn => fn(payload.new.status))
    }
  })
  .subscribe()
