// ─── APEX Stripe Price IDs (LIVE) ─────────────────────────────────────────
// These are the LIVE Stripe product & price IDs from Hugo's account
// DO NOT create new products — use these exact IDs
// This file is shared between Supabase Edge Functions

/**
 * Stripe Price ID mapping by tier and billing interval
 * Maps tier_id (builder, starter, focus, growth, pro, agency) 
 * and billing interval (monthly, annual, one_time) to Stripe price IDs
 */
export const STRIPE_PRICE_IDS = {
  builder: {
    product_id: 'prod_UTaN3jUcgvttmq',
    one_time: 'price_1TUdCZDGWTAZtT1dO17v7Cru' // $300 one-time
  },
  starter: {
    product_id: 'prod_UTaOPRTPGamshL',
    monthly: 'price_1TUdDLDGWTAZtT1dCJZytHz2', // $149/mo
    annual: 'price_1UFKJSDGWTAZtT1dnV6yy3p4'   // $1430.40/yr
  },
  focus: {
    product_id: 'prod_UTaQxIrEaBpS7s',
    monthly: 'price_1TUdFHDGWTAZtT1dv3Uv3jWQ', // $297/mo
    annual: 'price_1UFKJTDGWTAZtT1dS8QkN0ac'   // $2851.20/yr
  },
  growth: {
    product_id: 'prod_UTaQM9JxuvNF1K',
    monthly: 'price_1TUdFwDGWTAZtT1d50weXHKG', // $697/mo
    annual: 'price_1UFKJUDGWTAZtT1dZqqQrvmq'   // $6691.20/yr
  },
  pro: {
    product_id: 'prod_UTaRyf1QZ7H8lj',
    monthly: 'price_1TUdGvDGWTAZtT1dEoPsEi2R', // $1497/mo
    annual: 'price_1UFKJVDGWTAZtT1dmsUeLGOD'   // $14371.20/yr
  },
  agency: {
    product_id: 'prod_UTaSjMZrM8SRA5',
    monthly: 'price_1TUdHeDGWTAZtT1dR6yC38Yc', // $2997/mo
    annual: 'price_1UFKJVDGWTAZtT1dP47HbtRD'   // $28771.20/yr
  }
}

/**
 * Get Stripe price ID for a given tier and billing interval
 * @param tierName - Tier name (builder, starter, focus, growth, pro, agency)
 * @param billingInterval - Billing interval (monthly, annual, one_time)
 * @returns Stripe price ID or null if not found
 */
export function getStripePriceId(tierName: string, billingInterval: string): string | null {
  const tier = tierName.toLowerCase()
  const interval = billingInterval.toLowerCase()
  
  if (!STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS]) {
    console.error(`Unknown tier: ${tierName}`)
    return null
  }

  const tierPrices = STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS] as any
  const priceId = tierPrices[interval]
  
  if (!priceId) {
    console.error(`No price ID for ${tierName} with ${billingInterval} billing`)
    return null
  }

  return priceId
}

/**
 * Get billing interval for a tier
 * Builder is always one_time, others can be monthly or annual
 * @param tierName - Tier name
 * @param isAnnual - Whether annual billing is selected
 * @returns Billing interval (one_time, monthly, annual)
 */
export function getBillingInterval(tierName: string, isAnnual: boolean): string {
  const tier = tierName.toLowerCase()
  
  if (tier === 'builder') {
    return 'one_time'
  }
  
  return isAnnual ? 'annual' : 'monthly'
}

/**
 * Get Stripe checkout mode for a tier
 * Builder uses payment mode (one-time), others use subscription mode
 * @param tierName - Tier name
 * @returns Checkout mode (payment or subscription)
 */
export function getCheckoutMode(tierName: string): 'payment' | 'subscription' {
  const tier = tierName.toLowerCase()
  return tier === 'builder' ? 'payment' : 'subscription'
}

/**
 * Get monthly price for a tier from price ID
 * Returns 0 if not found
 * @param priceId - Stripe price ID
 * @returns Monthly price in dollars
 */
export function getMonthlyPriceFromPriceId(priceId: string): number {
  const priceMap: Record<string, number> = {
    // Builder
    'price_1TUdCZDGWTAZtT1dO17v7Cru': 0, // one-time, not monthly
    // Starter
    'price_1TUdDLDGWTAZtT1dCJZytHz2': 149,
    'price_1UFKJSDGWTAZtT1dnV6yy3p4': 119.20, // annual = $1430.40/yr ÷ 12
    // Focus
    'price_1TUdFHDGWTAZtT1dv3Uv3jWQ': 297,
    'price_1UFKJTDGWTAZtT1dS8QkN0ac': 237.60, // annual = $2851.20/yr ÷ 12
    // Growth
    'price_1TUdFwDGWTAZtT1d50weXHKG': 697,
    'price_1UFKJUDGWTAZtT1dZqqQrvmq': 557.60, // annual = $6691.20/yr ÷ 12
    // Pro
    'price_1TUdGvDGWTAZtT1dEoPsEi2R': 1497,
    'price_1UFKJVDGWTAZtT1dmsUeLGOD': 1197.60, // annual = $14371.20/yr ÷ 12
    // Agency
    'price_1TUdHeDGWTAZtT1dR6yC38Yc': 2997,
    'price_1UFKJVDGWTAZtT1dP47HbtRD': 2397.60, // annual = $28771.20/yr ÷ 12
  }
  
  return priceMap[priceId] || 0
}

/**
 * Get tier name from price ID
 * @param priceId - Stripe price ID
 * @returns Tier name or null if not found
 */
export function getTierNameFromPriceId(priceId: string): string | null {
  for (const [tierName, tierData] of Object.entries(STRIPE_PRICE_IDS)) {
    const tierPrices = tierData as any
    for (const [interval, price] of Object.entries(tierPrices)) {
      if (interval !== 'product_id' && price === priceId) {
        return tierName
      }
    }
  }
  return null
}
