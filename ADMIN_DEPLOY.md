# APEX HQ Admin Panel - Deployment Guide

## Overview
Private admin panel for Hugo (owner@apexhq.cloud) to manage all APEX HQ clients. Includes user management, subscription control, and coupon creation.

---

## 🚀 Quick Deploy Steps

### 1. Run Database Migration

Connect to your Supabase project and run the following SQL in order:

```sql
-- supabase-schema-admin.sql
-- This adds the is_admin column and admin tracking fields
```

Copy and paste the entire contents of `supabase-schema-admin.sql` into the SQL Editor in Supabase Dashboard.

### 2. Deploy Supabase Edge Functions

You need to deploy 3 new edge functions. Make sure you have the Supabase CLI installed and authenticated.

```bash
# Deploy admin-list-users function
supabase functions deploy admin-list-users

# Deploy admin-manage-subscription function
supabase functions deploy admin-manage-subscription

# Deploy admin-manage-coupons function
supabase functions deploy admin-manage-coupons
```

**Environment Variables Required:**
All functions use these existing secrets (already configured):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

No new secrets needed! ✅

### 3. Set Your Admin Status

After creating your owner@apexhq.cloud account (or whichever email you want as admin), run this SQL in Supabase:

```sql
-- Make owner@apexhq.cloud an admin
UPDATE public.users 
SET is_admin = true 
WHERE email = 'owner@apexhq.cloud';
```

Replace `owner@apexhq.cloud` with your actual admin email if different.

### 4. Deploy Frontend

The frontend changes are already in this branch. Deploy as normal:

```bash
# Build and deploy to production
npm run build
# Deploy dist/ folder to your hosting (Vercel, Netlify, etc.)
```

---

## 🎯 Access Admin Panel

1. **Sign in** at app.apexhq.cloud with your admin email
2. **Automatically redirected** to admin dashboard (if is_admin = true)
3. Non-admin users cannot access admin features (secured by RLS + JWT checks)

---

## 📋 Admin Features

### User Management
- **View all users** with subscription status, company info, creation date
- **Search users** by email or company name
- **Real-time subscription data** from Stripe + Supabase

### Subscription Actions
1. **Cancel Subscription**
   - Cancels in Stripe
   - Updates user_tiers to `cancelled` status
   - User retains access until period end (Stripe default)

2. **Revoke Access** (Delete)
   - Immediately cancels Stripe subscription
   - Marks all user subscriptions as `cancelled`
   - Use for refunds or immediate termination

3. **Grant Tier** (Comp Access)
   - Give any tier for free (no Stripe charge)
   - Sets `admin_granted = true` in user_tiers
   - Perfect for comps, partners, or beta testers
   - Add admin notes (e.g., "Partner deal", "Comp for feedback")

4. **Change Tier**
   - Update existing subscription to different tier
   - Admin override (no Stripe billing change)
   - Useful for manual tier adjustments

### Coupon Management
1. **Create Coupons**
   - Percentage discount (e.g., 20% off)
   - Fixed amount discount (e.g., $50 off)
   - Duration: once, repeating (X months), or forever
   - Optional max redemptions

2. **View All Coupons**
   - See all created coupons with details
   - Active/inactive status

3. **Promo Codes**
   - View all promotion codes
   - See redemption counts
   - Track usage limits

4. **Attach Coupon to User**
   - Apply coupon to customer's active subscription
   - Instant discount on next billing cycle

---

## 🔒 Security Notes

### RLS (Row Level Security)
- Regular users can only see their own data (unchanged)
- Admin functions use **service role** to bypass RLS
- Admin check happens BEFORE any service role operations

### JWT Verification
All admin edge functions:
1. ✅ Verify user is authenticated (JWT token)
2. ✅ Check `users.is_admin = true` via regular client
3. ✅ Only then use service role for admin operations

### Non-Admin Protection
- Non-admin users redirected to client dashboard
- Admin functions return 403 Forbidden for non-admins
- Service role key NEVER exposed to frontend

---

## 🧪 Testing the Admin Panel

### Test as Admin
1. Set your test account as admin:
   ```sql
   UPDATE public.users SET is_admin = true WHERE email = 'test@example.com';
   ```
2. Sign in and verify redirect to admin dashboard
3. Test each action with a test user

### Test as Regular User
1. Create a non-admin account
2. Verify they see client dashboard (not admin)
3. Try accessing admin functions (should fail with 403)

### Test Subscription Actions
1. Create a test user with active subscription
2. Cancel subscription → verify Stripe webhook updates status
3. Grant free tier → verify no Stripe charge, admin_granted = true
4. Change tier → verify user_tiers updated

### Test Coupons
1. Create coupon (20% off, once)
2. Create promo code for that coupon
3. Use promo code in checkout (as regular user)
4. Verify discount applied in Stripe

---

## 📊 Database Schema Changes

New columns added to `public.users`:
- `is_admin` (boolean, default false) - Admin access flag

New columns added to `public.user_tiers`:
- `admin_granted` (boolean, default false) - Tier granted by admin (not paid)
- `admin_notes` (text) - Admin notes about subscription

Existing Stripe columns (from PR #10):
- `stripe_customer_id`
- `stripe_subscription_id`
- `billing_interval`
- `past_due_at`

---

## 🐛 Troubleshooting

### "Admin access required" error
- Verify `is_admin = true` in Supabase users table
- Clear browser cache and re-login
- Check browser console for JWT errors

### Users list empty
- Check edge function logs: `supabase functions logs admin-list-users`
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Test function directly: `supabase functions invoke admin-list-users`

### Coupons not showing
- Verify Stripe secret key is correct
- Check function logs: `supabase functions logs admin-manage-coupons`
- Test Stripe connection with curl

### Subscription action fails
- Check Stripe subscription ID is valid
- Verify webhook is processing (for status updates)
- Check edge function logs for Stripe API errors

---

## 🎨 UI Features

- **Dark/Neon Theme** - Consistent with APEX brand
- **Searchable User List** - Filter by email or company
- **Confirmation Dialogs** - Prevent accidental actions
- **Real-time Status** - Active/cancelled/comp badges
- **Responsive Design** - Works on mobile + desktop

---

## 📁 Files Changed/Added

### New Files
- `supabase-schema-admin.sql` - Database migration
- `supabase/functions/admin-list-users/index.ts` - List all users
- `supabase/functions/admin-manage-subscription/index.ts` - Subscription management
- `supabase/functions/admin-manage-coupons/index.ts` - Coupon management
- `src/pages/AdminDashboard.jsx` - Admin UI component
- `ADMIN_DEPLOY.md` - This file

### Modified Files
- `src/ClientApp.jsx` - Added admin routing logic

---

## 🔄 Future Enhancements (Optional)

Consider adding later:
- User activity logs (who did what when)
- Bulk actions (cancel multiple subscriptions)
- Email user directly from admin panel
- Export user/subscription data to CSV
- Analytics dashboard (MRR, churn, etc.)
- Webhook event viewer

---

## ✅ Deployment Checklist

- [ ] Run `supabase-schema-admin.sql` migration
- [ ] Deploy `admin-list-users` edge function
- [ ] Deploy `admin-manage-subscription` edge function
- [ ] Deploy `admin-manage-coupons` edge function
- [ ] Set owner@apexhq.cloud as admin in database
- [ ] Deploy frontend with admin routes
- [ ] Test admin login and redirect
- [ ] Test user list loads
- [ ] Test subscription cancel action
- [ ] Test grant tier action
- [ ] Test coupon creation
- [ ] Test as non-admin user (should not access)

---

## 📞 Support

Questions? Check:
1. Edge function logs: `supabase functions logs <function-name>`
2. Supabase logs: Dashboard > Logs
3. Stripe events: Dashboard > Developers > Events
4. Browser console for frontend errors

Hugo, you're all set! 🚀
