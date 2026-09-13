# Stripe Integration Setup Guide

This guide will help you configure Stripe Checkout and webhooks for APEX HQ subscriptions.

## Overview

The integration uses **LIVE Stripe products** that already exist in your account. **Do not create new products.**

### Price IDs (Already Configured in Code)

| Tier | Monthly Price ID | Annual Price ID |
|------|-----------------|-----------------|
| Builder (one-time) | `price_1TUdCZDGWTAZtT1dO17v7Cru` | N/A |
| Starter | `price_1TUdDLDGWTAZtT1dCJZytHz2` | `price_1TUdEHDGWTAZtT1dakZye0Mj` |
| Focus | `price_1TUdFHDGWTAZtT1dv3Uv3jWQ` | `price_1TUdFHDGWTAZtT1d5VEQcWve` |
| Growth | `price_1TUdFwDGWTAZtT1d50weXHKG` | `price_1TUdFwDGWTAZtT1dim8fS0bP` |
| Pro | `price_1TUdGvDGWTAZtT1dEoPsEi2R` | `price_1TUdGvDGWTAZtT1dYQ5vVNEu` |
| Agency | `price_1TUdHeDGWTAZtT1dR6yC38Yc` | `price_1TUdHeDGWTAZtT1djjrd8fov` |

---

## Step 1: Get Your Stripe Secret Key

1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_live_...`)
3. Keep this safe — you'll add it to Supabase in Step 3

---

## Step 2: Run Database Migration

Run this SQL in your Supabase SQL Editor to add Stripe fields to the `user_tiers` table:

```sql
-- See supabase-schema-stripe.sql
```

Or run via Supabase CLI:

```bash
supabase db push --include-all
```

---

## Step 3: Deploy Supabase Edge Functions

### A. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### B. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Get your project ref from [Supabase Dashboard → Settings → General](https://supabase.com/dashboard/project/_/settings/general).

### C. Set Secrets in Supabase

Add your Stripe secret key and webhook secret (you'll get the webhook secret in Step 4):

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
# You'll set STRIPE_WEBHOOK_SECRET after Step 4
```

### D. Deploy Edge Functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

After deploying, note the webhook URL:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

---

## Step 4: Configure Stripe Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Paste your webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Under **Select events to listen to**, add these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to Supabase:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET
```

8. **Redeploy the webhook function** to pick up the new secret:

```bash
supabase functions deploy stripe-webhook
```

---

## Step 5: Add Stripe Publishable Key to Frontend (Optional)

If you want to use Stripe.js in the frontend (not currently needed), add your publishable key to `.env`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
```

---

## Step 6: Test the Integration

### Test with Stripe Test Mode (Recommended First)

Before going live, test with Stripe test keys:

1. Switch to test mode in Stripe Dashboard (toggle in top-right)
2. Create test products/prices with the same structure
3. Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` with test keys (`sk_test_...` and `whsec_test_...`)
4. Redeploy functions
5. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)

### Test Live Mode

1. Sign up for a new test account on your APEX site
2. Choose a plan
3. Complete checkout with a real card (or use Stripe CLI to trigger test webhook events)
4. Verify:
   - User is redirected to onboarding
   - `user_tiers` table has a new row with `status = 'active'`
   - Next sign-in skips plan picker and goes to dashboard

---

## Troubleshooting

### Checkout session creation fails

- **Check Edge Function logs:** `supabase functions logs create-checkout-session`
- **Verify secrets are set:** `supabase secrets list`
- **Check Stripe Dashboard → Logs** for API errors

### Webhook not receiving events

- **Verify webhook URL is correct** in Stripe Dashboard
- **Check webhook secret is set:** `supabase secrets list`
- **Check Edge Function logs:** `supabase functions logs stripe-webhook`
- **Test webhook manually:** Stripe Dashboard → Webhooks → Send test webhook

### User redirected to plans after paying

- **Check `user_tiers` table** for the user's row
- **Verify `status = 'active'`** (not `pending` or `cancelled`)
- **Check webhook logs** to ensure `checkout.session.completed` was processed

### Subscription updates not reflected

- **Check webhook is receiving `customer.subscription.updated` events**
- **Check Edge Function logs** for errors
- **Verify `stripe_subscription_id` in `user_tiers` matches Stripe**

---

## Security Checklist

- [ ] `STRIPE_SECRET_KEY` is set in Supabase secrets (never committed to git)
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Supabase secrets
- [ ] Webhook endpoint is deployed and receiving events
- [ ] `.env` file is in `.gitignore`
- [ ] Row Level Security (RLS) is enabled on `user_tiers` table
- [ ] Edge Functions validate user authentication before creating checkout sessions

---

## Support

If you encounter issues:

1. Check Supabase Edge Function logs: `supabase functions logs <function-name>`
2. Check Stripe Dashboard → Developers → Logs for API errors
3. Check Stripe Dashboard → Webhooks for webhook delivery status

---

## Summary

✅ **Live Stripe products configured** (no new products needed)  
✅ **Edge Functions deployed** (`create-checkout-session`, `stripe-webhook`)  
✅ **Webhook configured** in Stripe Dashboard  
✅ **Database schema updated** with Stripe fields  
✅ **Frontend integrated** with checkout flow  
✅ **Auth gate** skips plan picker for active subscriptions
