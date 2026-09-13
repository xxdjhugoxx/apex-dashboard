import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { getTierByName } from '../lib/pricing'

export function ClientDashboard() {
  const { user, profile, signOut } = useAuth()
  const [workRequests, setWorkRequests] = useState([])
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadWorkRequests()
    }
  }, [user])

  async function loadWorkRequests() {
    try {
      const { data, error } = await supabase
        .from('work_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkRequests(data || [])
    } catch (err) {
      console.error('Error loading work requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const tier = profile?.tier_id ? getTierByName(profile.tier_id) : null
  const allowedJobTypes = getJobTypesForTier(profile?.tier_id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-[#0f0f14]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center">
              <span className="font-bold text-xs">AX</span>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-widest">APEX CLIENT DASHBOARD</h1>
              <p className="text-xs text-white/40">{profile?.company_name || 'Welcome'}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] flex items-center justify-center">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-2xl">🏢</span>
                )}
              </div>
              <div>
                <h3 className="font-bold">{profile?.company_name || 'Your Company'}</h3>
                <p className="text-xs text-white/60">{tier?.name || 'Starter'} Plan</p>
              </div>
            </div>
            {profile?.bio && (
              <p className="text-sm text-white/60 mt-3">{profile.bio}</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-2">Work Requests</h3>
            <div className="text-3xl font-black">{workRequests.length}</div>
            <p className="text-xs text-white/60">Total requests submitted</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-2">Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-xs text-white/60 mt-2">All systems operational</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Work Requests</h2>
            <button
              onClick={() => setShowNewRequest(true)}
              className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold text-sm transition-all"
            >
              + New Request
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-white/60">Loading...</div>
          ) : workRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">No work requests yet</h3>
              <p className="text-white/60 mb-6">Create your first request to get started</p>
              <button
                onClick={() => setShowNewRequest(true)}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold transition-all"
              >
                Create First Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{req.title}</h3>
                      <p className="text-sm text-white/60 mb-2">{req.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-white/40">Type: {req.job_type}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/40">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : req.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {req.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewRequest && (
        <NewRequestModal
          allowedJobTypes={allowedJobTypes}
          userId={user.id}
          onClose={() => setShowNewRequest(false)}
          onSuccess={() => {
            setShowNewRequest(false)
            loadWorkRequests()
          }}
        />
      )}
    </div>
  )
}

function NewRequestModal({ allowedJobTypes, userId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    jobType: allowedJobTypes[0]?.value || '',
    title: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase.from('work_requests').insert({
        user_id: userId,
        job_type: formData.jobType,
        title: formData.title,
        description: formData.description,
        status: 'queued'
      })

      if (error) throw error
      onSuccess?.()
    } catch (err) {
      alert('Failed to create request: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6">New Work Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Job Type</label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
            >
              {allowedJobTypes.map((jt) => (
                <option key={jt.value} value={jt.value}>
                  {jt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
              placeholder="E.g., Create Instagram post for product launch"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35] resize-none"
              placeholder="Provide details about what you need..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getJobTypesForTier(tierId) {
  const baseTypes = [
    { value: 'content_post', label: 'Social Media Post' },
    { value: 'caption_gen', label: 'Caption Generation' }
  ]

  if (!tierId) return baseTypes

  const tierTypes = {
    builder: [
      { value: 'logo', label: 'Logo Design' },
      { value: 'landing_page', label: 'Landing Page' },
      { value: 'instagram_setup', label: 'Instagram Setup' },
      { value: 'brand_voice', label: 'Brand Voice Document' }
    ],
    starter: baseTypes,
    focus: [
      ...baseTypes,
      { value: 'department_audit', label: 'Department Audit' },
      { value: 'workflow_build', label: 'Workflow Build' }
    ],
    growth: [
      ...baseTypes,
      { value: 'lead_scoring', label: 'Lead Scoring' },
      { value: 'competitor_report', label: 'Competitor Report' },
      { value: 'multi_channel', label: 'Multi-Channel Campaign' }
    ],
    pro: [
      ...baseTypes,
      { value: 'custom_voice_training', label: 'Custom Voice Training' },
      { value: 'strategy_call', label: 'Strategy Call' },
      { value: 'full_report', label: 'Full Marketing Report' }
    ],
    agency: [
      ...baseTypes,
      { value: 'white_label', label: 'White Label Setup' },
      { value: 'api_access', label: 'API Integration' },
      { value: 'dedicated_support', label: 'Dedicated Support Request' }
    ]
  }

  return tierTypes[tierId] || baseTypes
}
