import React, { useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { getTierId } from '../lib/pricing'

export function OnboardingPage({ selectedTier, onComplete }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    bio: '',
    logoFile: null
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const { user, updateProfile } = useAuth()

  async function handleLogoUpload(file) {
    if (!file || !user) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('client-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('client-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  async function handleComplete() {
    setError('')
    setUploading(true)

    try {
      let logoUrl = null
      if (selectedTier.name !== 'Builder' && formData.logoFile) {
        logoUrl = await handleLogoUpload(formData.logoFile)
      }

      await updateProfile({
        company_name: formData.companyName,
        bio: formData.bio,
        logo_url: logoUrl,
        tier_id: getTierId(selectedTier.name)
      })

      await supabase.from('user_tiers').insert({
        user_id: user.id,
        tier_name: selectedTier.name,
        monthly_price: selectedTier.price,
        is_annual: false
      })

      onComplete?.()
    } catch (err) {
      setError(err.message || 'Setup failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">Welcome to APEX</h1>
          <p className="text-white/60">Let's set up your {selectedTier.name} account</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s <= step
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-[#FF6B35]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                  placeholder="Acme Inc."
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.companyName}
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold rounded-lg disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {selectedTier.name === 'Builder' ? 'Company Logo' : 'Upload Logo (Optional)'}
                </label>
                {selectedTier.name === 'Builder' ? (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg text-sm">
                    Logo design is included in your Builder package. Our team will create your logo and send it to you within 48 hours.
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, logoFile: e.target.files[0] })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold rounded-lg"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Brand Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35] resize-none"
                  placeholder="Tell us about your brand, target audience, and marketing goals..."
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={uploading}
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
