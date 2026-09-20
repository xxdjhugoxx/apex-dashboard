import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin (using regular client first)
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.is_admin) {
      throw new Error('Admin access required')
    }

    // Initialize service role client for reading all users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get all users with their tier information
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        company_name,
        created_at,
        is_admin,
        user_tiers (
          id,
          tier_name,
          status,
          stripe_customer_id,
          stripe_subscription_id,
          billing_interval,
          monthly_price,
          started_at,
          expires_at,
          past_due_at,
          admin_granted,
          admin_notes
        )
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      throw usersError
    }

    // Transform the data to include active subscription info
    const usersWithSubscriptions = users.map((user: any) => {
      const activeTier = user.user_tiers?.find((t: any) => 
        t.status === 'active' || t.status === 'trialing'
      )
      
      return {
        id: user.id,
        email: user.email,
        company_name: user.company_name,
        created_at: user.created_at,
        is_admin: user.is_admin,
        active_subscription: activeTier || null,
        all_subscriptions: user.user_tiers || [],
      }
    })

    return new Response(
      JSON.stringify({ users: usersWithSubscriptions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error listing users:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 400,
      }
    )
  }
})
