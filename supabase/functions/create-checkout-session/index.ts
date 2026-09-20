import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { STRIPE_PRICE_IDS } from '../_shared/stripe-prices.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { tier_id, billing_interval, success_url, cancel_url } = await req.json()

    if (!tier_id || !billing_interval) {
      throw new Error('Missing required fields: tier_id, billing_interval')
    }

    // Get price ID from shared constants (now using correct LIVE price IDs)
    const tierPrices = STRIPE_PRICE_IDS[tier_id as keyof typeof STRIPE_PRICE_IDS]
    const priceId = tierPrices?.[billing_interval as keyof typeof tierPrices]

    if (!priceId || typeof priceId !== 'string') {
      throw new Error(`Invalid tier_id (${tier_id}) or billing_interval (${billing_interval})`)
    }

    // Determine checkout mode (payment for builder, subscription for others)
    const mode = tier_id === 'builder' ? 'payment' : 'subscription'

    // Get user email
    const userEmail = user.email

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: success_url || `${req.headers.get('origin')}/onboarding`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/plans`,
      customer_email: userEmail,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        tier_id,
        billing_interval,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
