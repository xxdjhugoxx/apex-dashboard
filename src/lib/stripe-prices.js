// ─── APEX Stripe Price IDs (LIVE) ─────────────────────────────────────────
// These are the LIVE Stripe product & price IDs from Hugo's account
// DO NOT create new products — use these exact IDs

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
 * @param {string} tierName - Tier name (builder, starter, focus, growth, pro, agency)
 * @param {string} billingInterval - Billing interval (monthly, annual, one_time)
 * @returns {string|null} Stripe price ID or null if not found
 */
export function getStripePriceId(tierName, billingInterval) {
  const tier = tierName.toLowerCase()
  const interval = billingInterval.toLowerCase()
  
  if (!STRIPE_PRICE_IDS[tier]) {
    console.error(`Unknown tier: ${tierName}`)
    return null
  }

  const priceId = STRIPE_PRICE_IDS[tier][interval]
  
  if (!priceId) {
    console.error(`No price ID for ${tierName} with ${billingInterval} billing`)
    return null
  }

  return priceId
}

/**
 * Get billing interval for a tier
 * Builder is always one_time, others can be monthly or annual
 * @param {string} tierName - Tier name
 * @param {boolean} isAnnual - Whether annual billing is selected
 * @returns {string} Billing interval (one_time, monthly, annual)
 */
export function getBillingInterval(tierName, isAnnual) {
  const tier = tierName.toLowerCase()
  
  if (tier === 'builder') {
    return 'one_time'
  }
  
  return isAnnual ? 'annual' : 'monthly'
}

/**
 * Get Stripe checkout mode for a tier
 * Builder uses payment mode (one-time), others use subscription mode
 * @param {string} tierName - Tier name
 * @returns {string} Checkout mode (payment or subscription)
 */
export function getCheckoutMode(tierName) {
  const tier = tierName.toLowerCase()
  return tier === 'builder' ? 'payment' : 'subscription'
}
