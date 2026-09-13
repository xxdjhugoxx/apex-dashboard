import React, { useState } from 'react'
import { PRICING_TIERS, getAnnualPrice } from '../lib/pricing'
import { useAuth } from '../lib/auth'

export function PlansPage({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8855] bg-clip-text text-transparent">
            Choose Your APEX Plan
          </h1>
          <p className="text-xl text-white/60">AI-powered marketing automation for every stage</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              billingCycle === 'annual'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Annual <span className="text-green-400 ml-2">Save 20%</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => {
            const isAnnual = billingCycle === 'annual' && !tier.oneTime
            const displayPrice = isAnnual ? getAnnualPrice(tier.price) : tier.price

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
                  tier.popular
                    ? 'border-[#FF6B35] bg-gradient-to-br from-[#FF6B35]/20 to-transparent'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-black mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black">${displayPrice}</span>
                    {!tier.oneTime && (
                      <span className="text-white/60">
                        /{isAnnual ? 'mo (annual)' : 'month'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">{tier.note}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.feats.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPlan(tier)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    tier.popular
                      ? 'bg-[#FF6B35] hover:bg-[#FF8855] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {user ? tier.cta : 'Sign Up to Get Started'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
