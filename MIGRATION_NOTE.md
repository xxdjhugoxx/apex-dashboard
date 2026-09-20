# Database Migration Required

After pulling these changes, run the following SQL migration in your Supabase SQL Editor:

**File:** `supabase-needs-migration.sql`

This adds the `needs_json` column to the `users` table for storing user needs intake responses used in plan recommendations.

## What Changed

### New Flow
1. **Sign in** button → Login page only (email + password)
2. Login page includes clear **Sign up** button
3. **Sign up** → create account with email + password (keeps OTP confirm)
4. After signup/verify: **"What do you need?"** intake page with:
   - Free text input for describing needs
   - Optional multi-select goals: landing page, Instagram, DMs, ads, logo/brand, leads
5. Client-side recommender maps needs → tier:
   - logo/landing/IG light → Starter (or Builder if one-time brand kit only)
   - + DMs / one dept → Focus
   - + ads/leads / multi-dept → Growth
   - full stack → Pro
   - agency/white-label → Agency
6. **Plans page**: shows **"✓ RECOMMENDED FOR YOU"** badge at the TOP for recommended tier
7. Plan select → Stripe Checkout → success → onboarding
8. If `user_tiers.status === 'active'`, skip Plans → dashboard/onboarding

### Files Changed
- `src/pages/NeedsIntakePage.jsx` - New intake form component
- `src/lib/recommendation.js` - New recommendation logic (rule-based, no AI API)
- `src/pages/PlansPage.jsx` - Added recommended tier badge and sorting
- `src/pages/AuthPage.jsx` - Clearer sign in/sign up separation
- `src/ClientApp.jsx` - Updated routing logic for new flow
- `supabase-needs-migration.sql` - Database migration for needs_json column

### Testing
Run `npm run build` to verify - build should succeed with no errors.
