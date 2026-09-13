// ─── APEX HQ — Pricing Tiers ───────────────────────────────────────────────

export const TIERS = [
  {
    id: 'simple',
    name: 'Simple',
    price: '$29',
    period: 'per month',
    description: 'For solo creators getting started with AI agents',
    features: [
      '5 AI agent requests/day',
      'Logo generation',
      'Basic caption writing',
      'Email support',
      'Community access',
    ],
    cta: 'Start Simple',
    color: '#10B981',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99',
    period: 'per month',
    description: 'For power users scaling content & engagement',
    features: [
      'Unlimited AI agent requests',
      'Logo + post image generation',
      'Caption & DM reply writing',
      'Priority support',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Go Pro',
    color: '#6366F1',
    highlighted: true,
  },
  {
    id: 'ads_lite',
    name: 'Ads Lite',
    price: '$149',
    period: 'per month',
    description: 'Pro + AI-powered ad creative generation',
    features: [
      'Everything in Pro',
      'AI ad creative generation',
      'A/B test copy variations',
      'Performance insights',
      'Ad spend optimization tips',
      '⚠️ Ad spend not included — bring your own budget',
    ],
    cta: 'Launch Ads',
    color: '#EC4899',
    highlighted: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For teams needing dedicated agents & custom workflows',
    features: [
      'Everything in Ads Lite',
      'Dedicated AI agents',
      'Custom integrations',
      'White-label options',
      'SLA & priority support',
      'Volume pricing',
    ],
    cta: 'Contact Sales',
    color: '#F59E0B',
    highlighted: false,
  },
]

export const JOB_TYPES = {
  logo: {
    id: 'logo',
    name: 'Logo Generation',
    description: 'AI-generated brand logos',
    minTier: 'simple',
    icon: '🎨',
  },
  post_image: {
    id: 'post_image',
    name: 'Post Image',
    description: 'Social media post images',
    minTier: 'pro',
    icon: '📸',
  },
  caption: {
    id: 'caption',
    name: 'Caption Writing',
    description: 'AI-written captions & copy',
    minTier: 'simple',
    icon: '✍️',
  },
  dm_reply: {
    id: 'dm_reply',
    name: 'DM Reply',
    description: 'Personalized DM responses',
    minTier: 'pro',
    icon: '💬',
  },
  ad_creative: {
    id: 'ad_creative',
    name: 'Ad Creative',
    description: 'Performance-optimized ad creatives',
    minTier: 'ads_lite',
    icon: '🎯',
  },
}

// Tier hierarchy (for feature gating)
export const TIER_HIERARCHY = ['simple', 'pro', 'ads_lite', 'enterprise']

export function canAccessJobType(userTier, jobType) {
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier)
  const requiredTierIndex = TIER_HIERARCHY.indexOf(JOB_TYPES[jobType]?.minTier || 'simple')
  return userTierIndex >= requiredTierIndex
}
