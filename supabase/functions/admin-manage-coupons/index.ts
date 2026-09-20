import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

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

    // Initialize Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated and is admin
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.is_admin) {
      throw new Error('Admin access required')
    }

    // Parse request body
    const { action, ...params } = await req.json()

    if (!action) {
      throw new Error('Missing required field: action')
    }

    // Handle different actions
    if (action === 'list_coupons') {
      // List all coupons
      const coupons = await stripe.coupons.list({ limit: 100 })
      
      return new Response(
        JSON.stringify({ coupons: coupons.data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'list_promo_codes') {
      // List all promotion codes
      const promoCodes = await stripe.promotionCodes.list({ limit: 100, active: true })
      
      return new Response(
        JSON.stringify({ promo_codes: promoCodes.data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'create_coupon') {
      // Create a new coupon
      const { 
        name, 
        percent_off, 
        amount_off, 
        currency, 
        duration, 
        duration_in_months,
        max_redemptions,
      } = params

      if (!name || !duration) {
        throw new Error('Missing required fields: name, duration')
      }

      if (!percent_off && !amount_off) {
        throw new Error('Must specify either percent_off or amount_off')
      }

      const couponParams: any = {
        name,
        duration, // 'once', 'repeating', 'forever'
      }

      if (percent_off) {
        couponParams.percent_off = percent_off
      } else if (amount_off) {
        couponParams.amount_off = amount_off
        couponParams.currency = currency || 'usd'
      }

      if (duration === 'repeating' && duration_in_months) {
        couponParams.duration_in_months = duration_in_months
      }

      if (max_redemptions) {
        couponParams.max_redemptions = max_redemptions
      }

      const coupon = await stripe.coupons.create(couponParams)

      return new Response(
        JSON.stringify({ success: true, coupon }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'create_promo_code') {
      // Create a promotion code for a coupon
      const { coupon_id, code, max_redemptions, active } = params

      if (!coupon_id) {
        throw new Error('Missing required field: coupon_id')
      }

      const promoParams: any = {
        coupon: coupon_id,
        active: active !== false,
      }

      if (code) {
        promoParams.code = code
      }

      if (max_redemptions) {
        promoParams.max_redemptions = max_redemptions
      }

      const promoCode = await stripe.promotionCodes.create(promoParams)

      return new Response(
        JSON.stringify({ success: true, promo_code: promoCode }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'attach_coupon') {
      // Attach a coupon to a customer's subscription
      const { customer_id, coupon_id } = params

      if (!customer_id || !coupon_id) {
        throw new Error('Missing required fields: customer_id, coupon_id')
      }

      // Get customer's active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer_id,
        status: 'active',
        limit: 1,
      })

      if (subscriptions.data.length === 0) {
        throw new Error('No active subscription found for customer')
      }

      // Update subscription with coupon
      const subscription = await stripe.subscriptions.update(
        subscriptions.data[0].id,
        { coupon: coupon_id }
      )

      return new Response(
        JSON.stringify({ success: true, subscription }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else {
      throw new Error(`Invalid action: ${action}`)
    }

  } catch (error) {
    console.error('Error managing coupons:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 400,
      }
    )
  }
})
