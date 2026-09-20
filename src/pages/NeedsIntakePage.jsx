import React, { useState } from 'react'
import { useAuth } from '../lib/auth'

const GOAL_OPTIONS = [
  { id: 'landing_page', label: 'Landing Page', emoji: '🌐' },
  { id: 'instagram', label: 'Instagram Setup', emoji: '📸' },
  { id: 'dms', label: 'DM Management', emoji: '💬' },
  { id: 'ads', label: 'Ads & Campaigns', emoji: '📢' },
  { id: 'logo_brand', label: 'Logo & Branding', emoji: '🎨' },
  { id: 'leads', label: 'Lead Generation', emoji: '🎯' },
]

export function NeedsIntakePage({ onComplete }) {
  const [freeText, setFreeText] = useState('')
  const [selectedGoals, setSelectedGoals] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { updateProfile } = useAuth()

  function toggleGoal(goalId) {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const needsData = {
        freeText: freeText.trim(),
        goals: selectedGoals
      }

      await updateProfile({
        needs_json: needsData
      })

      onComplete?.(needsData)
    } catch (err) {
      console.error('Error saving needs:', err)
      setError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-4xl font-black mb-2">What do you need?</h1>
          <p className="text-white/60">Help us recommend the best plan for your goals</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Free text input */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Tell us about your marketing needs
              </label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35] resize-none"
                placeholder="E.g., I need to build a landing page for my startup, set up Instagram, and start running ads to generate leads..."
              />
            </div>

            {/* Goal checkboxes */}
            <div>
              <label className="block text-sm font-bold mb-3">
                Select specific goals (optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id)
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35]/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{goal.emoji}</div>
                      <div className="text-sm font-bold">{goal.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onComplete?.(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
