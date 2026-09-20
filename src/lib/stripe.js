import { supabase } from './supabase'

const STRIPE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`

export const STRIPE_PRICE_IDS = {
  builder: import.meta.env.VITE_STRIPE_PRICE_BUILDER || 'price_builder_placeholder',
  starter_monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly_placeholder',
  starter_annual: import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual_placeholder',
  focus_monthly: import.meta.env.VITE_STRIPE_PRICE_FOCUS_MONTHLY || 'price_focus_monthly_placeholder',
  focus_annual: import.meta.env.VITE_STRIPE_PRICE_FOCUS_ANNUAL || 'price_focus_annual_placeholder',
  growth_monthly: import.meta.env.VITE_STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly_placeholder',
  growth_annual: import.meta.env.VITE_STRIPE_PRICE_GROWTH_ANNUAL || 'price_growth_annual_placeholder',
  pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
  pro_annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual_placeholder',
  agency_monthly: import.meta.env.VITE_STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly_placeholder',
  agency_annual: import.meta.env.VITE_STRIPE_PRICE_AGENCY_ANNUAL || 'price_agency_annual_placeholder',
}

export function getStripePriceId(tierName, isAnnual) {
  const tierKey = tierName.toLowerCase()
  
  if (tierKey === 'builder') {
    return STRIPE_PRICE_IDS.builder
  }
  
  const suffix = isAnnual ? '_annual' : '_monthly'
  const key = `${tierKey}${suffix}`
  return STRIPE_PRICE_IDS[key] || null
}

export async function createCheckoutSession(tierName, isAnnual, user) {
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const priceId = getStripePriceId(tierName, isAnnual)
  
  if (!priceId) {
    throw new Error(`No Stripe Price ID configured for ${tierName}`)
  }

  if (priceId.includes('placeholder')) {
    throw new Error(
      'Stripe is not configured. Please add Stripe Price IDs to your environment variables. ' +
      'See README.md for setup instructions.'
    )
  }

  const { data: { session: authSession } } = await supabase.auth.getSession()
  
  const response = await fetch(STRIPE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authSession?.access_token}`,
    },
    body: JSON.stringify({
      tierName,
      priceId,
      isAnnual,
      userEmail: user.email,
      userId: user.id,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create checkout session')
  }

  const data = await response.json()
  return data
}

export async function hasActiveSubscription(userId) {
  if (!userId) return false

  const { data, error } = await supabase
    .from('user_tiers')
    .select('status, expires_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return false

  if (data.expires_at) {
    return new Date(data.expires_at) > new Date()
  }

  return data.status === 'active' || data.status === 'trialing'
}
