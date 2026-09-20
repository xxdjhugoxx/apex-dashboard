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
    const { action, user_id, tier_id, tier_name, monthly_price, billing_interval, admin_notes } = await req.json()

    if (!action || !user_id) {
      throw new Error('Missing required fields: action, user_id')
    }

    // Initialize service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Handle different actions
    if (action === 'cancel') {
      // Cancel subscription
      const { data: userTier, error: tierError } = await supabaseAdmin
        .from('user_tiers')
        .select('stripe_subscription_id, stripe_customer_id')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single()

      if (tierError) {
        throw new Error('No active subscription found')
      }

      // Cancel in Stripe if subscription exists
      if (userTier.stripe_subscription_id) {
        await stripe.subscriptions.cancel(userTier.stripe_subscription_id)
      }

      // Update status in database
      const { error: updateError } = await supabaseAdmin
        .from('user_tiers')
        .update({ 
          status: 'cancelled',
          expires_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('status', 'active')

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription cancelled' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'delete') {
      // Delete/revoke access - cancel subscription and mark as cancelled
      const { data: userTier } = await supabaseAdmin
        .from('user_tiers')
        .select('stripe_subscription_id')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single()

      // Cancel in Stripe if subscription exists
      if (userTier?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(userTier.stripe_subscription_id)
      }

      // Update all subscriptions to cancelled
      const { error: updateError } = await supabaseAdmin
        .from('user_tiers')
        .update({ 
          status: 'cancelled',
          expires_at: new Date().toISOString()
        })
        .eq('user_id', user_id)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: 'Access revoked' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'grant') {
      // Grant tier (admin override - no payment required)
      if (!tier_id || !tier_name || monthly_price === undefined) {
        throw new Error('Missing required fields: tier_id, tier_name, monthly_price')
      }

      // Cancel any existing active subscriptions first
      const { data: existingTier } = await supabaseAdmin
        .from('user_tiers')
        .select('stripe_subscription_id')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single()

      if (existingTier?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(existingTier.stripe_subscription_id)
      }

      // Cancel all active tiers
      await supabaseAdmin
        .from('user_tiers')
        .update({ status: 'cancelled' })
        .eq('user_id', user_id)
        .eq('status', 'active')

      // Create new admin-granted tier
      const { error: insertError } = await supabaseAdmin
        .from('user_tiers')
        .insert({
          user_id,
          tier_name,
          monthly_price,
          billing_interval: billing_interval || 'monthly',
          status: 'active',
          admin_granted: true,
          admin_notes: admin_notes || 'Admin granted access',
          started_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      return new Response(
        JSON.stringify({ success: true, message: `${tier_name} tier granted` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else if (action === 'change') {
      // Change tier (admin override)
      if (!tier_name || monthly_price === undefined) {
        throw new Error('Missing required fields: tier_name, monthly_price')
      }

      // Update existing active tier
      const { error: updateError } = await supabaseAdmin
        .from('user_tiers')
        .update({
          tier_name,
          monthly_price,
          billing_interval: billing_interval || 'monthly',
          admin_granted: true,
          admin_notes: admin_notes || 'Admin changed tier',
        })
        .eq('user_id', user_id)
        .eq('status', 'active')

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, message: `Tier changed to ${tier_name}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } else {
      throw new Error(`Invalid action: ${action}`)
    }

  } catch (error) {
    console.error('Error managing subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 400,
      }
    )
  }
})
