import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { getTierByName } from '../lib/pricing'

export function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refundingUser, setRefundingUser] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          user_tiers (*)
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])
    } catch (err) {
      console.error('Error loading users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefund(userId, fullAmount) {
    const amount = fullAmount && refundAmount ? parseFloat(refundAmount) : null

    if (!confirm(`Are you sure you want to refund this user${amount ? ` $${amount}` : ' (full amount)'}?`)) {
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-refund', {
        body: {
          userId,
          amount,
          reason: refundReason || 'Admin refund',
        },
      })

      if (error) throw error

      alert(`Refund successful: ${data.message}`)
      setRefundingUser(null)
      setRefundAmount('')
      setRefundReason('')
      loadUsers()
    } catch (err) {
      console.error('Error processing refund:', err)
      alert(`Refund failed: ${err.message}`)
    }
  }

  function openRefundDialog(userId) {
    setRefundingUser(userId)
    setRefundAmount('')
    setRefundReason('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading admin panel...</div>
          <div className="text-white/60">Please wait</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-white/80">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-4 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-[#0f0f14] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center">
                <span className="font-bold text-xs">AX</span>
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-widest">APEX OWNER ADMIN PANEL</h1>
                <p className="text-xs text-white/40">User & Subscription Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all"
              >
                🔄 Refresh
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">All Users</h2>
          <p className="text-white/60">Total users: {users.length}</p>
        </div>

        {users.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">No users yet</h3>
            <p className="text-white/60">Users will appear here once they sign up</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => {
              const activeTier = u.user_tiers?.find(t => t.status === 'active' || t.status === 'past_due')
              const tier = activeTier ? getTierByName(activeTier.tier_name) : null
              const allTiers = u.user_tiers || []

              return (
                <div
                  key={u.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center flex-shrink-0">
                        {u.logo_url ? (
                          <img src={u.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-2xl">🏢</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{u.company_name || 'Unnamed Company'}</h3>
                        <p className="text-sm text-white/60 mb-2">{u.email}</p>
                        {u.bio && (
                          <p className="text-sm text-white/40 mb-2">{u.bio}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/40">ID: {u.id.slice(0, 8)}...</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/40">
                            Joined: {new Date(u.created_at).toLocaleDateString()}
                          </span>
                          {u.stripe_customer_id && (
                            <>
                              <span className="text-white/40">•</span>
                              <span className="text-white/40">Stripe ID: {u.stripe_customer_id.slice(0, 12)}...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-bold mb-3">Subscriptions & Payments</h4>
                    {allTiers.length === 0 ? (
                      <div className="text-sm text-white/40 italic">No subscriptions or payments</div>
                    ) : (
                      <div className="space-y-2">
                        {allTiers.map((t) => {
                          const tierInfo = getTierByName(t.tier_name)
                          return (
                            <div
                              key={t.id}
                              className={`bg-white/5 border ${
                                t.status === 'active' ? 'border-green-500/50' :
                                t.status === 'refunded' ? 'border-red-500/50' :
                                t.status === 'cancelled' ? 'border-yellow-500/50' :
                                'border-white/10'
                              } rounded-lg p-4`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold">{tierInfo?.name || t.tier_name}</span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        t.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                        t.status === 'refunded' ? 'bg-red-500/20 text-red-400' :
                                        t.status === 'cancelled' ? 'bg-yellow-500/20 text-yellow-400' :
                                        t.status === 'past_due' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-white/20 text-white/60'
                                      }`}
                                    >
                                      {t.status}
                                    </span>
                                  </div>
                                  <div className="text-sm text-white/60 space-y-1">
                                    <div>${t.monthly_price}{t.is_annual ? '/year' : '/month'}</div>
                                    {t.stripe_subscription_id && (
                                      <div className="text-xs text-white/40">Sub ID: {t.stripe_subscription_id.slice(0, 20)}...</div>
                                    )}
                                    {t.stripe_price_id && (
                                      <div className="text-xs text-white/40">Price ID: {t.stripe_price_id.slice(0, 20)}...</div>
                                    )}
                                    {t.started_at && (
                                      <div className="text-xs text-white/40">
                                        Started: {new Date(t.started_at).toLocaleDateString()}
                                      </div>
                                    )}
                                    {t.expires_at && (
                                      <div className="text-xs text-white/40">
                                        Expires: {new Date(t.expires_at).toLocaleDateString()}
                                      </div>
                                    )}
                                    {t.admin_notes && (
                                      <div className="text-xs text-yellow-400 mt-2">
                                        Note: {t.admin_notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {(t.status === 'active' || t.status === 'past_due') && (
                                  <button
                                    onClick={() => openRefundDialog(u.id)}
                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400 rounded-lg text-sm font-bold transition-all"
                                  >
                                    💸 Refund
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {refundingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Refund Payment</h2>
            <p className="text-white/60 mb-6">
              Issue a refund for this user. Leave amount blank for full refund.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Refund Amount (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Leave blank for full refund"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Why is this refund being issued?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRefundingUser(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRefund(refundingUser, !refundAmount)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
