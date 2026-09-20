# APEX Owner Admin Panel Guide

## Overview

The Owner Admin Panel allows Hugo (the APEX owner) to manage user subscriptions, view payments, and issue refunds directly from the dashboard.

## Features Added

### 1. Stripe Promotion Codes at Checkout ✅

The checkout session now supports promotion codes. Users can enter promo codes like `APEXTEST99` during payment.

**Updated file:** `supabase/functions/create-checkout-session/index.ts`

**What changed:**
- Added `allow_promotion_codes: true` to Stripe checkout session configuration

### 2. Admin Refund Functionality ✅

New edge function to process full or partial refunds for user payments.

**New file:** `supabase/functions/admin-refund/index.ts`

**Features:**
- Process full refunds (default)
- Process partial refunds (specify amount)
- Automatic subscription cancellation on refund
- Refund tracking with admin notes
- Only accessible by owner (verified by email)

### 3. Owner Admin Dashboard ✅

Complete admin panel for managing all users and their subscriptions.

**New file:** `src/pages/AdminDashboard.jsx`

**Features:**
- View all registered users
- See user details (company, email, logo, bio)
- View all subscriptions and payments per user
- Display subscription status (active, cancelled, refunded, past_due)
- View Stripe IDs (customer, subscription, price)
- Issue refunds with confirmation dialog
- Optional refund amount and reason fields
- Real-time status updates

### 4. Database Schema Update ✅

Added admin notes tracking to user_tiers table.

**New file:** `supabase-admin-refund-migration.sql`

**What changed:**
- Added `admin_notes` column to `user_tiers` table
- Stores refund history and admin actions

## Accessing the Admin Panel

### For Owner (Hugo)

1. Sign in to APEX with your owner email: `hugo@apexhq.cloud`
2. Navigate to: `https://your-domain.com/?admin=true`
3. You'll see the **APEX Owner Admin Panel** with all users listed

### URL Examples

- **Production:** `https://app.apexhq.cloud/?admin=true`
- **Local Dev:** `http://localhost:5173/?admin=true`
- **Preview:** `https://preview.apexhq.cloud/?admin=true`

## Using Promotion Codes

### Creating a Test Coupon in Stripe

1. Go to [Stripe Dashboard → Coupons](https://dashboard.stripe.com/coupons)
2. Click **Create coupon**
3. Configure the discount:
   - **Name:** APEXTEST99
   - **Type:** Percentage or Amount off
   - **Value:** e.g., 99% off or $99 off
   - **Duration:** Once, Forever, or Repeating
4. Click **Create coupon**
5. Go to [Promotion Codes](https://dashboard.stripe.com/promotion_codes)
6. Click **New** and create promotion code: `APEXTEST99`
7. Link it to the coupon you just created

### Testing the Coupon

1. Go to Plans page: `https://app.apexhq.cloud`
2. Select any paid plan (Starter, Growth, Pro, etc.)
3. Proceed to Stripe Checkout
4. Click **Add promotion code** at checkout
5. Enter: `APEXTEST99`
6. The discount will be applied automatically
7. Complete payment with test card: `4242 4242 4242 4242`

## Issuing Refunds

### Step-by-Step Refund Process

1. **Access Admin Panel:**
   - Sign in as Hugo
   - Go to `https://app.apexhq.cloud/?admin=true`

2. **Find the User:**
   - Scroll through the user list
   - Or use browser search (Ctrl+F / Cmd+F)

3. **Click Refund Button:**
   - Each active subscription shows a **💸 Refund** button
   - Click it to open the refund dialog

4. **Configure Refund:**
   - **Full refund:** Leave amount field blank
   - **Partial refund:** Enter dollar amount (e.g., 50.00 for $50)
   - **Reason:** Optional note for internal tracking

5. **Confirm:**
   - Click **Confirm Refund**
   - Confirmation dialog will appear
   - Confirm again to process

6. **What Happens:**
   - Stripe processes the refund
   - Subscription is cancelled automatically
   - User tier status changes to "refunded"
   - Admin note is added with refund details
   - User receives refund email from Stripe

### Refund Notes

After a refund, the admin panel displays:
```
Refunded $297 on 2026-09-20T10:30:00.000Z
Reason: Customer requested cancellation
Refund ID: re_1AbCdEfGhIjKlMnO
```

## Deployment Instructions

### 1. Deploy the Admin Refund Edge Function

```bash
# Navigate to project directory
cd apex-dashboard

# Deploy the new admin-refund function
npx supabase functions deploy admin-refund

# Set the OWNER_EMAIL secret (if not already set)
npx supabase secrets set OWNER_EMAIL=hugo@apexhq.cloud
```

### 2. Run Database Migration

```bash
# In Supabase SQL Editor, run:
# supabase-admin-refund-migration.sql

# Or via CLI:
npx supabase db push
```

### 3. Deploy Frontend Changes

**For Cloudflare Pages:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=apex-dashboard
```

**For GitHub Pages:**
```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

## Security Notes

- Admin panel only accessible by owner email (`hugo@apexhq.cloud`)
- Edge function verifies JWT token and email
- Requires service role key to access all user data
- RLS policies still apply for regular users
- Refund actions are logged with timestamps and reasons

## Technical Details

### Edge Function Authentication Flow

1. User makes request with auth token in header
2. Function extracts and verifies JWT token
3. Looks up user email from database
4. Compares with `OWNER_EMAIL` environment variable
5. Returns 403 Forbidden if not owner

### Refund Flow

1. Admin selects user and clicks Refund
2. Frontend calls `admin-refund` edge function
3. Function retrieves user's active subscription/payment
4. Locates most recent paid charge via Stripe API
5. Creates refund via `stripe.refunds.create()`
6. Cancels subscription if applicable
7. Updates `user_tiers` status to "refunded"
8. Adds admin note with refund details
9. Returns success response to frontend

### Database Schema

```sql
user_tiers {
  id: uuid
  user_id: uuid
  tier_name: text
  monthly_price: numeric
  is_annual: boolean
  status: text  -- 'active', 'cancelled', 'refunded', 'past_due'
  admin_notes: text  -- NEW: Tracks refunds and admin actions
  stripe_subscription_id: text
  stripe_price_id: text
  started_at: timestamptz
  expires_at: timestamptz
  created_at: timestamptz
}
```

## Troubleshooting

### Cannot Access Admin Panel

**Issue:** Redirected to dashboard instead of admin panel

**Solution:**
- Verify you're signed in with `hugo@apexhq.cloud`
- Check URL includes `?admin=true`
- Clear browser cache and try again

### Refund Failed Error

**Issue:** "No paid invoices found" or similar error

**Possible causes:**
1. User never completed payment
2. Payment still processing
3. Already refunded

**Solution:**
- Check Stripe Dashboard for payment status
- Verify user has `stripe_customer_id` in database
- Check subscription status in `user_tiers` table

### Edge Function Not Deployed

**Issue:** Function invoke fails with 404

**Solution:**
```bash
# List deployed functions
npx supabase functions list

# Deploy admin-refund
npx supabase functions deploy admin-refund

# Verify deployment
npx supabase functions list
```

## Testing Checklist

- [ ] Sign in as Hugo (`hugo@apexhq.cloud`)
- [ ] Access admin panel via `?admin=true`
- [ ] View list of all users
- [ ] See user subscriptions and payment details
- [ ] Create test subscription with test coupon `APEXTEST99`
- [ ] Issue full refund on test subscription
- [ ] Verify refund appears in Stripe Dashboard
- [ ] Verify user tier status changes to "refunded"
- [ ] Verify admin note is saved
- [ ] Test partial refund (optional)
- [ ] Verify non-owner cannot access admin panel

## Summary

### For Hugo to Use Promotion Codes

1. Customer goes to checkout
2. Clicks "Add promotion code"
3. Enters `APEXTEST99` (or any code you created in Stripe)
4. Discount applies automatically

### For Hugo to Refund a Payment

1. Go to `https://app.apexhq.cloud/?admin=true`
2. Find the user in the list
3. Click **💸 Refund** on their active subscription
4. Enter amount (optional) and reason (optional)
5. Click **Confirm Refund**
6. Done! User is refunded and subscription cancelled

## Files Modified/Created

```
✅ supabase/functions/create-checkout-session/index.ts  (updated)
✅ supabase/functions/admin-refund/index.ts             (new)
✅ src/pages/AdminDashboard.jsx                         (new)
✅ src/ClientApp.jsx                                    (updated)
✅ supabase-admin-refund-migration.sql                  (new)
✅ ADMIN_PANEL_GUIDE.md                                 (new)
```
