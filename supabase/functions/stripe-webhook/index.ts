import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { getMonthlyPriceFromPriceId, getTierNameFromPriceId } from '../_shared/stripe-prices.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing stripe-signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

    console.log(`Received event: ${event.type}`)

    // Initialize Supabase Admin Client (service_role key for database writes)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.client_reference_id || session.metadata?.user_id
        const tierId = session.metadata?.tier_id
        const billingInterval = session.metadata?.billing_interval
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string | null

        if (!userId || !tierId || !billingInterval) {
          console.error('Missing metadata in checkout session', session)
          break
        }

        // Get price ID from session line items
        const priceId = session.line_items?.data?.[0]?.price?.id || 
                       (subscriptionId ? (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0]?.price.id : null)
        
        // Calculate monthly_price from price ID
        const monthlyPrice = priceId ? getMonthlyPriceFromPriceId(priceId) : 0

        // Determine status based on payment status
        const status = session.payment_status === 'paid' ? 'active' : 'pending'

        // Insert or update user_tiers record
        const { error: upsertError } = await supabaseAdmin
          .from('user_tiers')
          .upsert(
            {
              user_id: userId,
              tier_id: tierId,
              tier_name: tierId, // tier_name = tier_id as requested
              status,
              billing_interval: billingInterval,
              monthly_price: monthlyPrice,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (upsertError) {
          console.error('Error upserting user_tiers:', upsertError)
        } else {
          console.log(`User tier created/updated for user ${userId}`)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const customerId = subscription.customer as string
        const subscriptionId = subscription.id
        const status = subscription.status

        // Map Stripe subscription status to our status
        let tierStatus = 'active'
        if (status === 'past_due') {
          tierStatus = 'past_due'
        } else if (status === 'canceled' || status === 'unpaid') {
          tierStatus = 'cancelled'
        } else if (status === 'incomplete' || status === 'incomplete_expired') {
          tierStatus = 'expired'
        }

        // Get price ID from subscription
        const priceId = subscription.items.data[0]?.price.id
        const monthlyPrice = priceId ? getMonthlyPriceFromPriceId(priceId) : undefined
        const tierName = priceId ? getTierNameFromPriceId(priceId) : undefined

        // Update user_tiers by stripe_subscription_id
        const updateData: any = {
          status: tierStatus,
          updated_at: new Date().toISOString(),
        }
        
        if (monthlyPrice !== undefined) {
          updateData.monthly_price = monthlyPrice
        }
        
        if (tierName !== null && tierName !== undefined) {
          updateData.tier_name = tierName
        }
        
        if (priceId) {
          updateData.stripe_price_id = priceId
        }

        const { error: updateError } = await supabaseAdmin
          .from('user_tiers')
          .update(updateData)
          .eq('stripe_subscription_id', subscriptionId)

        if (updateError) {
          console.error('Error updating subscription status:', updateError)
        } else {
          console.log(`Subscription ${subscriptionId} status updated to ${tierStatus}`)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        // Mark subscription as cancelled
        const { error: deleteError } = await supabaseAdmin
          .from('user_tiers')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        if (deleteError) {
          console.error('Error cancelling subscription:', deleteError)
        } else {
          console.log(`Subscription ${subscriptionId} cancelled`)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
