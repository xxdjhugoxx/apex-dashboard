// ─── APEX Pricing Tiers ─────────────────────────────────────────────────────
// Synced from apexhq.cloud pricing section (live site source of truth)

export const PRICING_TIERS = [
  {
    name: 'Builder',
    price: 300,
    oneTime: true,
    note: 'One-time project · no subscription',
    cta: 'Get Builder',
    feats: [
      'Logo + brand identity',
      'Landing page (ZIP for hosting)',
      'Instagram name & bio',
      '3 starter posts',
      'Brand voice document',
      'One-time, no subscription'
    ]
  },
  {
    name: 'Starter',
    price: 149,
    note: 'Test the waters with a curated agent team',
    cta: 'Start with Starter',
    feats: [
      '1 brand profile',
      'Choose 1 specific agent',
      '300 agent runs / month',
      'Approval queue',
      'Weekly report'
    ]
  },
  {
    name: 'Focus',
    price: 297,
    note: 'Pick one department and go all-in',
    cta: 'Start with Focus',
    feats: [
      '1 brand profile',
      'Choose 1 full department',
      'All agents within that dept',
      '900 agent runs / month',
      'Brand voice training',
      'Approval workflow'
    ]
  },
  {
    name: 'Growth',
    price: 697,
    popular: true,
    note: 'Multi-channel marketing for scaling brands',
    cta: 'Start with Growth',
    feats: [
      '2 brand profiles',
      'Choose 3 departments',
      'All agents in those depts',
      '2,500 agent runs / month',
      'Lead qualification + scoring',
      'Competitor monitoring',
      'Priority queue',
      'Live chat support'
    ]
  },
  {
    name: 'Pro',
    price: 1497,
    note: 'Full marketing department + builder kit',
    cta: 'Start with Pro',
    feats: [
      '3 brand profiles',
      'All 12 departments unlocked',
      'All 36 agents',
      '6,000 agent runs / month',
      'Builder brand kit included',
      'Custom brand voice fine-tuning',
      'Monthly strategy call',
      'Slack support channel'
    ]
  },
  {
    name: 'Agency',
    price: 2997,
    note: 'Unlimited everything + builder brand kit',
    cta: 'Start with Agency',
    feats: [
      'Unlimited brand profiles',
      'All 36 agents · all departments',
      'Unlimited agent runs',
      'Builder brand kit included',
      'White-label client dashboards',
      'Per-brand isolated workspaces',
      'Custom agent training',
      'Dedicated account team',
      'API access'
    ]
  }
]

// ─── Pricing Utilities ─────────────────────────────────────────────────────

/**
 * Calculate annual pricing (80% of monthly price, billed annually)
 * @param {number} monthlyPrice - Monthly price in dollars
 * @returns {number} Annual monthly equivalent
 */
export function getAnnualPrice(monthlyPrice) {
  return Math.round(monthlyPrice * 0.8)
}

/**
 * Get tier by name (case-insensitive)
 * @param {string} tierName - Name of the tier
 * @returns {object|null} Tier object or null if not found
 */
export function getTierByName(tierName) {
  const normalized = tierName.toLowerCase()
  return PRICING_TIERS.find(tier => tier.name.toLowerCase() === normalized) || null
}

/**
 * Get tier ID from tier name (for database/API references)
 * @param {string} tierName - Name of the tier
 * @returns {string} Lowercase tier ID (e.g., 'builder', 'starter', 'growth')
 */
export function getTierId(tierName) {
  return tierName.toLowerCase()
}

/**
 * Map legacy job types to current tier IDs (if needed for backward compatibility)
 * @param {string} jobType - Legacy job type identifier
 * @returns {string} Current tier ID
 */
export function mapJobTypeToTier(jobType) {
  const mapping = {
    'builder': 'builder',
    'starter': 'starter',
    'focus': 'focus',
    'growth': 'growth',
    'pro': 'pro',
    'agency': 'agency',
    // Add legacy mappings here if needed in the future
  }
  return mapping[jobType.toLowerCase()] || 'starter'
}
