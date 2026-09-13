import React, { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { AuthPage } from './pages/AuthPage'
import { PlansPage } from './pages/PlansPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ClientDashboard } from './pages/ClientDashboard'
import { supabase } from './lib/supabase'

function OtpConfirmationPage({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const inputRefs = useRef([])

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp]
      pastedData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      
      const lastIndex = Math.min(pastedData.length, 5)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      })

      if (verifyError) throw verifyError

      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError('')

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (resendError) throw resendError

      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Check Your Email</h1>
          <p className="text-white/60">
            We sent a 6-digit code to<br />
            <span className="text-white/80 font-semibold">{email}</span>
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg focus:outline-none focus:border-[#FF6B35] transition-colors"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm mb-4">
                Code resent successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold rounded-lg transition-all disabled:opacity-50 mb-3"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all disabled:opacity-50 mb-3"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 bg-transparent hover:bg-white/5 text-white/60 hover:text-white font-bold rounded-lg transition-all"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ClientRouter() {
  const { user, profile, loading } = useAuth()
  const [selectedTier, setSelectedTier] = useState(() => {
    try {
      const stored = localStorage.getItem('apex_selected_tier')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [view, setView] = useState('auth')
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  useEffect(() => {
    if (loading) return

    if (!user) {
      const pendingConfirm = localStorage.getItem('apex_email_pending')
      const pendingPlanSelection = localStorage.getItem('apex_pending_plan_selection')
      
      if (pendingConfirm === 'true') {
        setEmailConfirmationPending(true)
        setView('email_confirmation')
      } else if (pendingPlanSelection === 'true') {
        setView('auth')
      } else {
        setView('plans')
      }
    } else if (!profile?.company_name) {
      localStorage.removeItem('apex_email_pending')
      localStorage.removeItem('apex_pending_plan_selection')
      if (!selectedTier) {
        setView('plans')
      } else {
        setView('onboarding')
      }
    } else {
      localStorage.removeItem('apex_email_pending')
      localStorage.removeItem('apex_pending_plan_selection')
      localStorage.removeItem('apex_selected_tier')
      setView('dashboard')
    }
  }, [user, profile, loading, selectedTier])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading APEX...</p>
        </div>
      </div>
    )
  }

  if (view === 'auth') {
    return (
      <AuthPage
        onSuccess={() => setView('plans')}
        onEmailConfirmationRequired={(email) => {
          setPendingEmail(email)
          setEmailConfirmationPending(true)
          setView('email_confirmation')
        }}
      />
    )
  }

  if (view === 'email_confirmation') {
    return (
      <OtpConfirmationPage
        email={pendingEmail}
        onSuccess={() => {
          localStorage.removeItem('apex_email_pending')
          setEmailConfirmationPending(false)
          window.location.reload()
        }}
        onBack={() => {
          localStorage.removeItem('apex_email_pending')
          setEmailConfirmationPending(false)
          setView('auth')
        }}
      />
    )
  }

  if (view === 'plans') {
    return (
      <PlansPage
        onSelectPlan={(tier) => {
          setSelectedTier(tier)
          localStorage.setItem('apex_selected_tier', JSON.stringify(tier))
          
          if (!user) {
            localStorage.setItem('apex_pending_plan_selection', 'true')
            setView('auth')
          } else {
            setView('onboarding')
          }
        }}
      />
    )
  }

  if (view === 'onboarding' && selectedTier) {
    return (
      <OnboardingPage
        selectedTier={selectedTier}
        onComplete={() => {
          localStorage.removeItem('apex_selected_tier')
          setView('dashboard')
        }}
      />
    )
  }

  return <ClientDashboard />
}

export default function ClientApp() {
  return (
    <AuthProvider>
      <ClientRouter />
    </AuthProvider>
  )
}
