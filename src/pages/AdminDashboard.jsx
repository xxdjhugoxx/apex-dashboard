import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export function AdminDashboard() {
  const { user, profile, signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [coupons, setCoupons] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showGrantTier, setShowGrantTier] = useState(false)
  const [showCreateCoupon, setShowCreateCoupon] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundUserId, setRefundUserId] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      loadUsers()
      loadCoupons()
    }
  }, [user])

  async function loadUsers() {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('admin-list-users')
      
      if (error) throw error
      setUsers(data.users || [])
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Failed to load users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadCoupons() {
    try {
      const { data: couponsData, error: couponsError } = await supabase.functions.invoke(
        'admin-manage-coupons',
        { body: { action: 'list_coupons' } }
      )
      
      if (couponsError) throw couponsError
      setCoupons(couponsData.coupons || [])

      const { data: promoData, error: promoError } = await supabase.functions.invoke(
        'admin-manage-coupons',
        { body: { action: 'list_promo_codes' } }
      )
      
      if (promoError) throw promoError
      setPromoCodes(promoData.promo_codes || [])
    } catch (err) {
      console.error('Error loading coupons:', err)
    }
  }

  async function handleAction(action, userId, additionalParams = {}) {
    if (!confirm(`Are you sure you want to ${action} this subscription?`)) {
      return
    }

    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      const { data, error } = await supabase.functions.invoke(
        'admin-manage-subscription',
        { body: { action, user_id: userId, ...additionalParams } }
      )

      if (error) throw error
      
      setSuccess(data.message || 'Action completed successfully')
      await loadUsers()
      setShowGrantTier(false)
      setSelectedUser(null)
    } catch (err) {
      console.error(`Error performing ${action}:`, err)
      setError(err.message || `Failed to ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCreateCoupon(formData) {
    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      const { data, error } = await supabase.functions.invoke(
        'admin-manage-coupons',
        { body: { action: 'create_coupon', ...formData } }
      )

      if (error) throw error
      
      setSuccess('Coupon created successfully')
      await loadCoupons()
      setShowCreateCoupon(false)
    } catch (err) {
      console.error('Error creating coupon:', err)
      setError(err.message || 'Failed to create coupon')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRefund(userId) {
    const amount = refundAmount ? parseFloat(refundAmount) : null

    if (!confirm(`Are you sure you want to refund this user${amount ? ` $${amount}` : ' (full amount)'}?`)) {
      return
    }

    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      const { data, error } = await supabase.functions.invoke('admin-refund', {
        body: {
          userId,
          amount,
          reason: refundReason || 'Admin refund',
        },
      })

      if (error) throw error

      setSuccess(data.message || 'Refund processed successfully')
      await loadUsers()
      setShowRefundDialog(false)
      setRefundUserId(null)
      setRefundAmount('')
      setRefundReason('')
    } catch (err) {
      console.error('Error processing refund:', err)
      setError(err.message || 'Failed to process refund')
    } finally {
      setActionLoading(false)
    }
  }

  function openRefundDialog(userId) {
    setRefundUserId(userId)
    setRefundAmount('')
    setRefundReason('')
    setShowRefundDialog(true)
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const TIERS = [
    { id: 'builder', name: 'Builder', price: 349 },
    { id: 'starter', name: 'Starter', price: 199 },
    { id: 'focus', name: 'Focus', price: 449 },
    { id: 'growth', name: 'Growth', price: 899 },
    { id: 'pro', name: 'Pro', price: 1699 },
    { id: 'agency', name: 'Agency', price: 3499 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f14] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center">
                <span className="font-bold text-lg">👑</span>
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-widest">APEX ADMIN PANEL</h1>
                <p className="text-xs text-white/40">{profile?.email || 'Owner'}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all"
            >
              Sign Out
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'users' ? 'bg-[#FF6B35]' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'coupons' ? 'bg-[#FF6B35]' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Coupons ({coupons.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
            {success}
            <button onClick={() => setSuccess('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search users by email or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const activeSub = user.active_subscription
                  const isActive = activeSub?.status === 'active' || activeSub?.status === 'trialing'
                  
                  return (
                    <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{user.company_name || user.email}</h3>
                            {user.is_admin && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded">
                                ADMIN
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded">
                                ACTIVE
                              </span>
                            )}
                            {activeSub?.admin_granted && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded">
                                COMP
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm mb-2">{user.email}</p>
                          <p className="text-white/40 text-xs">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {activeSub && (
                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/40 text-xs mb-1">Tier</p>
                              <p className="font-bold">{activeSub.tier_name}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-1">Price</p>
                              <p className="font-bold">${activeSub.monthly_price}/{activeSub.billing_interval}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-1">Status</p>
                              <p className="font-bold capitalize">{activeSub.status}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-1">Started</p>
                              <p className="font-bold">{new Date(activeSub.started_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {activeSub.stripe_customer_id && (
                            <p className="text-white/40 text-xs mt-3">
                              Customer: {activeSub.stripe_customer_id}
                            </p>
                          )}
                          {activeSub.stripe_subscription_id && (
                            <p className="text-white/40 text-xs">
                              Subscription: {activeSub.stripe_subscription_id}
                            </p>
                          )}
                          {activeSub.admin_notes && (
                            <p className="text-yellow-300/80 text-xs mt-2">
                              Note: {activeSub.admin_notes}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {isActive && (
                          <>
                            <button
                              onClick={() => openRefundDialog(user.id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                              💸 Refund
                            </button>
                            <button
                              onClick={() => handleAction('cancel', user.id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                              Cancel Subscription
                            </button>
                            <button
                              onClick={() => handleAction('delete', user.id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                              Revoke Access
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowGrantTier(true)
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                        >
                          {isActive ? 'Change Tier' : 'Grant Access'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setShowCreateCoupon(true)}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold transition-all"
              >
                + Create Coupon
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-bold text-xl mb-4">Coupons</h2>
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold">{coupon.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          coupon.valid ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {coupon.valid ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-2">
                        {coupon.percent_off ? `${coupon.percent_off}% off` : `$${coupon.amount_off / 100} off`}
                      </p>
                      <p className="text-white/40 text-xs">
                        Duration: {coupon.duration}
                        {coupon.duration === 'repeating' && ` (${coupon.duration_in_months} months)`}
                      </p>
                      <p className="text-white/40 text-xs">ID: {coupon.id}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-bold text-xl mb-4">Promo Codes</h2>
                <div className="space-y-3">
                  {promoCodes.map((promo) => (
                    <div key={promo.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{promo.code}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          promo.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {promo.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-1">
                        Coupon: {promo.coupon.id}
                      </p>
                      <p className="text-white/40 text-xs">
                        Times used: {promo.times_redeemed}
                        {promo.max_redemptions && ` / ${promo.max_redemptions}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Grant Tier Modal */}
      {showGrantTier && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#1a1a24] border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {selectedUser.active_subscription ? 'Change' : 'Grant'} Tier
            </h2>
            <p className="text-white/60 mb-6">{selectedUser.email}</p>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const tier = TIERS.find(t => t.id === formData.get('tier_id'))
              
              handleAction(
                selectedUser.active_subscription ? 'change' : 'grant',
                selectedUser.id,
                {
                  tier_id: tier.id,
                  tier_name: tier.name,
                  monthly_price: tier.price,
                  billing_interval: formData.get('billing_interval'),
                  admin_notes: formData.get('admin_notes'),
                }
              )
            }}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Tier</label>
                <select
                  name="tier_id"
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                >
                  {TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - ${tier.price}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Billing Interval</label>
                <select
                  name="billing_interval"
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Admin Notes</label>
                <textarea
                  name="admin_notes"
                  placeholder="Reason for granting access..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowGrantTier(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateCoupon && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#1a1a24] border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create Coupon</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const data = {
                name: formData.get('name'),
                duration: formData.get('duration'),
                max_redemptions: formData.get('max_redemptions') || undefined,
              }

              const discountType = formData.get('discount_type')
              if (discountType === 'percent') {
                data.percent_off = parseFloat(formData.get('percent_off'))
              } else {
                data.amount_off = parseFloat(formData.get('amount_off')) * 100 // cents
                data.currency = 'usd'
              }

              if (data.duration === 'repeating') {
                data.duration_in_months = parseInt(formData.get('duration_in_months'))
              }

              handleCreateCoupon(data)
            }}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., SAVE20"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Discount Type</label>
                <select
                  name="discount_type"
                  required
                  onChange={(e) => {
                    const percentInput = document.getElementById('percent_off_input')
                    const amountInput = document.getElementById('amount_off_input')
                    if (e.target.value === 'percent') {
                      percentInput.style.display = 'block'
                      amountInput.style.display = 'none'
                    } else {
                      percentInput.style.display = 'none'
                      amountInput.style.display = 'block'
                    }
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="percent">Percentage</option>
                  <option value="amount">Fixed Amount</option>
                </select>
              </div>

              <div id="percent_off_input" className="mb-4">
                <label className="block text-sm font-bold mb-2">Percent Off</label>
                <input
                  type="number"
                  name="percent_off"
                  min="1"
                  max="100"
                  placeholder="20"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div id="amount_off_input" className="mb-4" style={{ display: 'none' }}>
                <label className="block text-sm font-bold mb-2">Amount Off ($)</label>
                <input
                  type="number"
                  name="amount_off"
                  min="1"
                  placeholder="50"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Duration</label>
                <select
                  name="duration"
                  required
                  onChange={(e) => {
                    const monthsInput = document.getElementById('duration_months')
                    monthsInput.style.display = e.target.value === 'repeating' ? 'block' : 'none'
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="once">Once</option>
                  <option value="repeating">Repeating</option>
                  <option value="forever">Forever</option>
                </select>
              </div>

              <div id="duration_months" className="mb-4" style={{ display: 'none' }}>
                <label className="block text-sm font-bold mb-2">Duration (Months)</label>
                <input
                  type="number"
                  name="duration_in_months"
                  min="1"
                  placeholder="3"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Max Redemptions (optional)</label>
                <input
                  type="number"
                  name="max_redemptions"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCoupon(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Dialog */}
      {showRefundDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Issue Refund</h2>
            <p className="text-white/60 mb-6">
              Process a refund for this user. Leave amount blank for a full refund.
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
                <label className="block text-sm font-bold mb-2">Reason (optional)</label>
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
                onClick={() => setShowRefundDialog(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRefund(refundUserId)}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getJobTypesForTier(tierId) {
  const jobsByTier = {
    builder: ['logo', 'landing_page', 'instagram_setup', 'brand_voice'],
    starter: ['content_post', 'caption_gen', 'basic_report'],
    focus: ['content_post', 'caption_gen', 'basic_report', 'department_audit', 'workflow_build', 'brand_training'],
    growth: ['content_post', 'caption_gen', 'basic_report', 'department_audit', 'workflow_build', 'brand_training', 'lead_scoring', 'competitor_report', 'multi_channel'],
    pro: ['content_post', 'caption_gen', 'basic_report', 'department_audit', 'workflow_build', 'brand_training', 'lead_scoring', 'competitor_report', 'multi_channel', 'custom_voice_training', 'strategy_call', 'full_report'],
    agency: ['content_post', 'caption_gen', 'basic_report', 'department_audit', 'workflow_build', 'brand_training', 'lead_scoring', 'competitor_report', 'multi_channel', 'custom_voice_training', 'strategy_call', 'full_report', 'white_label', 'api_access', 'dedicated_support'],
  }
  return jobsByTier[tierId] || []
}
