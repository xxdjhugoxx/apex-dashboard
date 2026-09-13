import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.3.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handlePaymentSucceeded(invoice)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handlePaymentFailed(invoice)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.user_id
  const tierName = session.metadata?.tier_name
  const isAnnual = session.metadata?.is_annual === 'true'
  const customerId = session.customer as string

  if (!userId || !tierName) {
    console.error('Missing user_id or tier_name in session metadata')
    return
  }

  await supabase
    .from('users')
    .update({ stripe_customer_id: customerId })
    .eq('id', userId)

  if (session.mode === 'payment') {
    const { data: tierData } = await supabase
      .from('user_tiers')
      .select('*')
      .eq('user_id', userId)
      .eq('tier_name', tierName)
      .single()

    if (!tierData) {
      await supabase.from('user_tiers').insert({
        user_id: userId,
        tier_name: tierName,
        monthly_price: session.amount_total ? session.amount_total / 100 : 0,
        is_annual: false,
        status: 'active',
        stripe_price_id: session.line_items?.data[0]?.price?.id,
      })
    } else {
      await supabase
        .from('user_tiers')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .eq('tier_name', tierName)
    }
  } else if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0]?.price.id

    const { data: existingTier } = await supabase
      .from('user_tiers')
      .select('*')
      .eq('user_id', userId)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!existingTier) {
      await supabase.from('user_tiers').insert({
        user_id: userId,
        tier_name: tierName,
        monthly_price: subscription.items.data[0]?.price.unit_amount
          ? subscription.items.data[0].price.unit_amount / 100
          : 0,
        is_annual: isAnnual,
        status: 'active',
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        started_at: new Date(subscription.current_period_start * 1000).toISOString(),
        expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      })
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { data: tier } = await supabase
    .from('user_tiers')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!tier) return

  await supabase
    .from('user_tiers')
    .update({
      status: subscription.status === 'active' ? 'active' : subscription.status,
      started_at: new Date(subscription.current_period_start * 1000).toISOString(),
      expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('user_tiers')
    .update({
      status: 'cancelled',
      expires_at: new Date(subscription.ended_at! * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  await supabase
    .from('user_tiers')
    .update({ status: 'active' })
    .eq('stripe_subscription_id', subscriptionId)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  await supabase
    .from('user_tiers')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)
}
