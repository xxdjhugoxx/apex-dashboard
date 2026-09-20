import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.3.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') || 'hugo@apexhq.cloud'
    if (!adminUser || adminUser.email !== OWNER_EMAIL) {
      throw new Error('Forbidden: Admin access required')
    }

    const { userId, amount, reason } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('*, user_tiers(*)')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      throw new Error('User not found')
    }

    const activeTiers = (targetUser.user_tiers || []).filter(
      (t: any) => t.status === 'active' || t.status === 'past_due'
    )

    if (activeTiers.length === 0) {
      throw new Error('No active subscription or payment found for this user')
    }

    const tier = activeTiers[0]
    let refund = null
    let refundedAmount = 0

    if (tier.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(tier.stripe_subscription_id)
      
      const invoices = await stripe.invoices.list({
        subscription: tier.stripe_subscription_id,
        status: 'paid',
        limit: 10,
      })

      if (invoices.data.length === 0) {
        throw new Error('No paid invoices found for this subscription')
      }

      const latestInvoice = invoices.data[0]
      const charge = latestInvoice.charge

      if (!charge) {
        throw new Error('No charge found for this invoice')
      }

      const refundAmount = amount ? Math.round(amount * 100) : undefined

      refund = await stripe.refunds.create({
        charge: charge as string,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          user_id: userId,
          tier_name: tier.tier_name,
          admin_reason: reason || 'Admin refund',
        },
      })

      refundedAmount = refund.amount / 100

      await stripe.subscriptions.cancel(tier.stripe_subscription_id)
    } else {
      const customer = await stripe.customers.retrieve(targetUser.stripe_customer_id)
      
      if (customer.deleted) {
        throw new Error('Customer not found')
      }

      const charges = await stripe.charges.list({
        customer: targetUser.stripe_customer_id,
        limit: 10,
      })

      const paidCharges = charges.data.filter(c => c.paid && !c.refunded)

      if (paidCharges.length === 0) {
        throw new Error('No paid charges found for this customer')
      }

      const latestCharge = paidCharges[0]
      const refundAmount = amount ? Math.round(amount * 100) : undefined

      refund = await stripe.refunds.create({
        charge: latestCharge.id,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          user_id: userId,
          tier_name: tier.tier_name,
          admin_reason: reason || 'Admin refund',
        },
      })

      refundedAmount = refund.amount / 100
    }

    const adminNote = `Refunded $${refundedAmount} on ${new Date().toISOString()}. Reason: ${reason || 'Admin refund'}. Refund ID: ${refund.id}`

    await supabase
      .from('user_tiers')
      .update({
        status: 'refunded',
        admin_notes: adminNote,
      })
      .eq('id', tier.id)

    return new Response(
      JSON.stringify({
        success: true,
        refund: {
          id: refund.id,
          amount: refundedAmount,
          status: refund.status,
        },
        message: `Successfully refunded $${refundedAmount}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing refund:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
