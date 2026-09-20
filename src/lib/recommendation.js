/**
 * APEX Plan Recommendation Engine
 * 
 * Simple rule-based logic to map user needs to tier recommendations.
 * No paid AI API required - uses keyword matching and goal analysis.
 */

/**
 * Recommend a tier based on user needs
 * @param {Object} needs - User needs data { freeText: string, goals: string[] }
 * @returns {string} Recommended tier name ('Builder', 'Starter', 'Focus', 'Growth', 'Pro', 'Agency')
 */
export function recommendTier(needs) {
  if (!needs || (!needs.freeText && (!needs.goals || needs.goals.length === 0))) {
    // No needs data - default to Starter
    return 'Starter'
  }

  const text = (needs.freeText || '').toLowerCase()
  const goals = needs.goals || []

  // Agency indicators (highest tier)
  const agencyKeywords = ['agency', 'white-label', 'white label', 'clients', 'multiple brands', 'unlimited']
  if (agencyKeywords.some(kw => text.includes(kw))) {
    return 'Agency'
  }

  // Pro indicators (full stack)
  const proKeywords = ['full stack', 'everything', 'all departments', 'complete solution', 'comprehensive']
  if (proKeywords.some(kw => text.includes(kw))) {
    return 'Pro'
  }

  // Growth indicators (multi-channel, ads + leads)
  const hasAds = goals.includes('ads') || text.includes('ad') || text.includes('campaign')
  const hasLeads = goals.includes('leads') || text.includes('lead') || text.includes('conversion')
  const multiChannel = text.includes('multi') || text.includes('multiple channel') || text.includes('scaling')
  
  if ((hasAds && hasLeads) || multiChannel) {
    return 'Growth'
  }

  // Focus indicators (one department, DMs)
  const hasDMs = goals.includes('dms') || text.includes('dm') || text.includes('message')
  const hasDepartment = text.includes('department') || text.includes('team')
  
  if (hasDMs || hasDepartment || (hasAds || hasLeads)) {
    return 'Focus'
  }

  // Builder indicators (one-time brand kit only)
  const hasLogo = goals.includes('logo_brand') || text.includes('logo') || text.includes('brand')
  const hasLanding = goals.includes('landing_page') || text.includes('landing')
  const hasInstagram = goals.includes('instagram') || text.includes('instagram') || text.includes('ig')
  const isOneTime = text.includes('one-time') || text.includes('one time') || text.includes('just need')
  
  // If only brand/logo/landing and seems one-time, recommend Builder
  if (isOneTime && (hasLogo || hasLanding)) {
    return 'Builder'
  }

  // Starter (light usage - landing/IG without heavy goals)
  if ((hasLogo || hasLanding || hasInstagram) && goals.length <= 2) {
    return 'Starter'
  }

  // Default fallback
  return 'Starter'
}

/**
 * Get a human-readable explanation for why a tier was recommended
 * @param {Object} needs - User needs data
 * @param {string} recommendedTier - The recommended tier name
 * @returns {string} Explanation text
 */
export function getRecommendationReason(needs, recommendedTier) {
  const reasons = {
    'Builder': 'Perfect for one-time brand setup with logo and landing page',
    'Starter': 'Great starting point for light marketing needs',
    'Focus': 'Ideal for focused department or DM management',
    'Growth': 'Best for multi-channel campaigns with ads and lead generation',
    'Pro': 'Full marketing department for comprehensive needs',
    'Agency': 'Unlimited solution for agencies and multiple brands'
  }

  return reasons[recommendedTier] || reasons['Starter']
}
