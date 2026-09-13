# APEX HQ Supabase Edge Functions

This directory contains Supabase Edge Functions for the APEX HQ portal.

## Functions

### `create-checkout-session`

Creates a Stripe Checkout session for plan purchases.

**Endpoint:** `POST /functions/v1/create-checkout-session`

**Request Body:**
```json
{
  "tier_id": "starter|focus|growth|pro|agency|builder",
  "billing_interval": "monthly|annual|one_time",
  "success_url": "https://yourdomain.com/onboarding",
  "cancel_url": "https://yourdomain.com/plans"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

**Environment Variables Required:**
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_... or sk_test_...)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key

---

### `stripe-webhook`

Handles Stripe webhook events to sync subscription status to database.

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Events Handled:**
- `checkout.session.completed` - Creates user_tiers record when checkout completes
- `customer.subscription.updated` - Updates subscription status (active, past_due, etc.)
- `customer.subscription.deleted` - Marks subscription as cancelled

**Environment Variables Required:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (whsec_...)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for database writes)

**Webhook Configuration:**
Add this URL to your Stripe Dashboard webhooks:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

---

## Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Set Secrets

```bash
# Stripe keys
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase keys (usually auto-configured)
# supabase secrets set SUPABASE_URL=https://....supabase.co
# supabase secrets set SUPABASE_ANON_KEY=...
# supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Or deploy individually
supabase functions deploy create-checkout-session
```

---

## Local Development

Run functions locally:

```bash
# Start Supabase locally
supabase start

# Serve functions
supabase functions serve --env-file .env.local

# Or serve a specific function
supabase functions serve create-checkout-session --env-file .env.local
```

Create `.env.local` with your secrets:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Testing

### Test Checkout Session Creation

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tier_id": "starter",
    "billing_interval": "monthly",
    "success_url": "http://localhost:5173/onboarding",
    "cancel_url": "http://localhost:5173/plans"
  }'
```

### Test Webhook

Use Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook

# Trigger a test event
stripe trigger checkout.session.completed
```

---

## Logs

View function logs:

```bash
# View all logs
supabase functions logs

# View specific function
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook

# Follow logs in real-time
supabase functions logs --follow
```

---

## Troubleshooting

### Function returns 401 Unauthorized
- Ensure `Authorization` header is set with a valid Supabase JWT
- Check that user is authenticated before calling the function

### Checkout session creation fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check Stripe Dashboard → Logs for API errors
- Ensure price IDs in `src/lib/stripe-prices.js` match your Stripe account

### Webhook not receiving events
- Verify webhook URL is correct in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Use Stripe CLI to test webhook delivery locally

### Database writes fail
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (for webhook function)
- Check RLS policies on `user_tiers` table
- View function logs for detailed error messages
