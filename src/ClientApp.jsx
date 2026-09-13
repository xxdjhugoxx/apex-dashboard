import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { AuthPage } from './pages/AuthPage'
import { PlansPage } from './pages/PlansPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ClientDashboard } from './pages/ClientDashboard'

function ClientRouter() {
  const { user, profile, loading } = useAuth()
  const [selectedTier, setSelectedTier] = useState(null)
  const [view, setView] = useState('auth')

  useEffect(() => {
    if (loading) return

    if (!user) {
      setView('auth')
    } else if (!profile?.company_name) {
      if (!selectedTier) {
        setView('plans')
      } else {
        setView('onboarding')
      }
    } else {
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
    return <AuthPage onSuccess={() => setView('plans')} />
  }

  if (view === 'plans') {
    return (
      <PlansPage
        onSelectPlan={(tier) => {
          setSelectedTier(tier)
          setView('onboarding')
        }}
      />
    )
  }

  if (view === 'onboarding' && selectedTier) {
    return (
      <OnboardingPage
        selectedTier={selectedTier}
        onComplete={() => setView('dashboard')}
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
