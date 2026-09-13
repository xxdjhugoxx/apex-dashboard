# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payments for the APEX Dashboard subscription flow.

## Prerequisites

- A Stripe account (free to create at [stripe.com](https://stripe.com))
- A Supabase project with the client schema installed
- The APEX Dashboard repository cloned locally

## Overview

The payment flow works as follows:

1. **User Journey**: Sign up → Email verification → Choose plan → **Pay via Stripe Checkout** → Onboarding → Dashboard
2. **On return sign-in**: If active subscription exists → Dashboard (skips plan selection)
3. **Webhook Updates**: Stripe webhooks automatically update subscription status in `user_tiers` table

## Step 1: Create Stripe Products & Prices

### 1.1 Log into Stripe Dashboard

Go to [dashboard.stripe.com](https://dashboard.stripe.com) and navigate to **Products**.

### 1.2 Create Products

Create the following products with their prices:

#### Builder (One-time Payment)
- Product Name: `APEX Builder`
- Price: `$300` (one-time payment)
- Copy the **Price ID** (starts with `price_`)

#### Starter Plan
- Product Name: `APEX Starter`
- Monthly Price: `$149/month` (recurring)
- Annual Price: `$119/month` billed annually ($1,428/year - 20% off)
- Copy both **Price IDs**

#### Focus Plan
- Product Name: `APEX Focus`
- Monthly Price: `$297/month` (recurring)
- Annual Price: `$238/month` billed annually ($2,856/year - 20% off)
- Copy both **Price IDs**

#### Growth Plan
- Product Name: `APEX Growth`
- Monthly Price: `$697/month` (recurring)
- Annual Price: `$558/month` billed annually ($6,696/year - 20% off)
- Copy both **Price IDs**

#### Pro Plan
- Product Name: `APEX Pro`
- Monthly Price: `$1,497/month` (recurring)
- Annual Price: `$1,198/month` billed annually ($14,376/year - 20% off)
- Copy both **Price IDs**

#### Agency Plan
- Product Name: `APEX Agency`
- Monthly Price: `$2,997/month` (recurring)
- Annual Price: `$2,398/month` billed annually ($28,776/year - 20% off)
- Copy both **Price IDs**

### 1.3 Note Your Price IDs

Keep all Price IDs handy. You'll need them for environment variables.

## Step 2: Get Stripe API Keys

### 2.1 Get Publishable Key

1. Go to **Developers → API Keys**
2. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. This will be `VITE_STRIPE_PUBLISHABLE_KEY`

### 2.2 Get Secret Key

1. On the same page, copy the **Secret key** (starts with `sk_test_` or `sk_live_`)
2. This will be `STRIPE_SECRET_KEY`
3. **⚠️ NEVER commit this key to git**

## Step 3: Deploy Supabase Edge Functions

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Link Your Project

```bash
supabase link --project-ref cfwbqzktltxgllqdhaug
```

### 3.4 Set Edge Function Secrets

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

# Set Supabase Service Role Key (from Supabase Dashboard → Settings → API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Note: STRIPE_WEBHOOK_SECRET will be set after creating the webhook in Step 5
```

### 3.5 Deploy Functions

```bash
# Deploy checkout session function
supabase functions deploy create-checkout-session

# Deploy webhook handler
supabase functions deploy stripe-webhook
```

### 3.6 Verify Deployment

After deployment, you'll get URLs like:
- `https://cfwbqzktltxgllqdhaug.supabase.co/functions/v1/create-checkout-session`
- `https://cfwbqzktltxgllqdhaug.supabase.co/functions/v1/stripe-webhook`

Test the create-checkout-session endpoint is live:
```bash
curl https://cfwbqzktltxgllqdhaug.supabase.co/functions/v1/create-checkout-session
```

## Step 4: Update Database Schema

### 4.1 Run Migration Script

In Supabase Dashboard → SQL Editor, run:

```sql
-- Copy contents from supabase-stripe-migration.sql
```

This adds:
- `stripe_customer_id` to `users` table
- `stripe_subscription_id` and `stripe_price_id` to `user_tiers` table

## Step 5: Configure Stripe Webhook

### 5.1 Create Webhook Endpoint

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Endpoint URL: `https://cfwbqzktltxgllqdhaug.supabase.co/functions/v1/stripe-webhook`
4. Description: `APEX Dashboard Subscriptions`

### 5.2 Select Events to Listen For

Add these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 5.3 Copy Webhook Signing Secret

1. After creating the webhook, click to view details
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to Supabase secrets:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here
```

### 5.4 Redeploy Webhook Function

```bash
supabase functions deploy stripe-webhook
```

## Step 6: Configure Local Environment

### 6.1 Create .env File

```bash
cp .env.example .env
```

### 6.2 Update .env with Your Values

```env
# Supabase (from Dashboard → Settings → API)
VITE_SUPABASE_URL=https://cfwbqzktltxgllqdhaug.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe Publishable Key (safe to commit)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Price IDs (paste the IDs you copied from Step 1)
VITE_STRIPE_PRICE_BUILDER=price_xxxxx
VITE_STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
VITE_STRIPE_PRICE_FOCUS_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_FOCUS_ANNUAL=price_xxxxx
VITE_STRIPE_PRICE_GROWTH_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_GROWTH_ANNUAL=price_xxxxx
VITE_STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_PRO_ANNUAL=price_xxxxx
VITE_STRIPE_PRICE_AGENCY_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_AGENCY_ANNUAL=price_xxxxx
```

## Step 7: Build and Deploy

### 7.1 Build for Production

```bash
npm run build
```

### 7.2 Deploy to Cloudflare Pages

**Via Cloudflare Dashboard:**

1. Go to **Workers & Pages** → **Create application** → **Pages**
2. Connect to your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Environment variables (add in Cloudflare Pages settings):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - All `VITE_STRIPE_PRICE_*` variables

**Via Wrangler CLI:**

```bash
npx wrangler pages deploy dist --project-name=apex-dashboard
```

## Step 8: Test the Payment Flow

### 8.1 Test Checkout (Test Mode)

1. Go to your deployed app: `https://app.apexhq.cloud`
2. Sign up with a new account
3. Verify email with OTP code
4. Choose a plan (e.g., "Starter - Monthly")
5. Click the plan button to start checkout

### 8.2 Use Stripe Test Cards

Use these test card numbers (any future expiry, any CVC):

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

### 8.3 Verify Success Flow

After successful payment:
1. Should redirect back to app with `?payment=success`
2. Should see onboarding page (enter company details)
3. Complete onboarding
4. Should land on dashboard

### 8.4 Test Return Sign-In

1. Sign out from dashboard
2. Sign in again with same credentials
3. Should go **directly to dashboard** (not plans page)

### 8.5 Check Database

In Supabase → Table Editor:

**`user_tiers` table should have:**
- `user_id`: your user UUID
- `tier_name`: "Starter" (or whichever you selected)
- `status`: "active"
- `stripe_subscription_id`: sub_xxxxx
- `stripe_price_id`: price_xxxxx
- `expires_at`: future date for subscriptions

**`users` table should have:**
- `stripe_customer_id`: cus_xxxxx

## Step 9: Monitor Webhooks

### 9.1 View Webhook Events

Go to **Developers → Webhooks** in Stripe Dashboard → Click your endpoint

You should see events being sent:
- `checkout.session.completed` when payment completes
- `customer.subscription.created` when subscription starts
- `invoice.payment_succeeded` for recurring payments

### 9.2 Debugging

If webhooks fail:
1. Check webhook event details in Stripe Dashboard
2. View Edge Function logs in Supabase Dashboard → Edge Functions → Logs
3. Common issues:
   - Missing secrets (STRIPE_WEBHOOK_SECRET)
   - Incorrect signature verification
   - Database RLS policies blocking updates

## Step 10: Switch to Live Mode

When ready for production:

### 10.1 In Stripe Dashboard

1. Toggle from **Test mode** to **Live mode** (top right)
2. Recreate products and prices in live mode
3. Get new live API keys (`pk_live_...` and `sk_live_...`)
4. Create new webhook endpoint with live mode URL

### 10.2 Update Environment Variables

Replace all `sk_test_` and `pk_test_` keys with `sk_live_` and `pk_live_` versions in:
- Supabase Edge Function secrets
- Cloudflare Pages environment variables
- Local `.env` (if testing production mode)

### 10.3 Update Price IDs

Replace all test Price IDs with live Price IDs in environment variables.

## Troubleshooting

### Error: "Stripe is not configured"

**Cause**: Missing or placeholder Stripe Price IDs in environment variables

**Fix**: 
1. Ensure all `VITE_STRIPE_PRICE_*` variables are set in `.env`
2. Verify Price IDs are actual Stripe IDs (start with `price_`)
3. Rebuild the app after updating `.env`

### Error: "Failed to create checkout session"

**Cause**: Edge Function not deployed or secrets missing

**Fix**:
1. Verify function is deployed: `supabase functions list`
2. Check secrets are set: `supabase secrets list`
3. Test function directly with curl

### Webhook Events Not Firing

**Cause**: Webhook endpoint URL incorrect or signature mismatch

**Fix**:
1. Verify webhook URL in Stripe Dashboard matches your function URL
2. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
3. Check webhook logs in Stripe Dashboard for error details

### Subscription Status Not Updating

**Cause**: Database RLS policies or webhook handler error

**Fix**:
1. Check Edge Function logs in Supabase
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (bypasses RLS)
3. Check database schema has Stripe fields added

## Security Notes

- ✅ **DO commit**: Publishable keys (`pk_*`), Price IDs
- ❌ **NEVER commit**: Secret keys (`sk_*`), webhook secrets (`whsec_*`), service role keys
- Use Supabase secrets for Edge Functions
- Use Cloudflare Pages environment variables for frontend vars
- Keep `.env` in `.gitignore`

## Support

For issues:
- Check Edge Function logs in Supabase Dashboard
- Check webhook events in Stripe Dashboard
- Review database updates in Supabase Table Editor
- Test each step independently

## Summary

Once setup is complete, the flow is fully automated:

1. User selects plan → Stripe Checkout opens
2. User pays → Stripe sends webhook to Supabase Edge Function
3. Edge Function updates `user_tiers` table with subscription
4. User returns to app → onboarding or dashboard
5. On next sign-in → app checks `user_tiers` status → routes to dashboard if active

No manual intervention required after initial setup!
