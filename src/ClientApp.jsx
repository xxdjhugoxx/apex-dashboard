import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { AuthPage } from './pages/AuthPage'
import { PlansPage } from './pages/PlansPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ClientDashboard } from './pages/ClientDashboard'

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
        onEmailConfirmationRequired={() => {
          setEmailConfirmationPending(true)
          setView('email_confirmation')
        }}
      />
    )
  }

  if (view === 'email_confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8855] mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="text-3xl font-black mb-2">Check Your Email</h1>
            <p className="text-white/60">We sent you a confirmation link</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-white/80 mb-4">
              Please check your inbox and click the confirmation link to activate your account.
            </p>
            <p className="text-sm text-white/60 mb-6">
              Once confirmed, you'll be automatically signed in and can continue setting up your account.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF8855] text-white font-bold rounded-lg transition-all"
              >
                I've Confirmed - Continue
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('apex_email_pending')
                  setEmailConfirmationPending(false)
                  setView('auth')
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
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
