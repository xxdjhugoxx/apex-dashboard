# APEX HQ Client Dashboard

AI-powered marketing automation platform with client onboarding and work request management.

## Features

### Client-Facing MVP
- ✅ **Plans Page** - 6 pricing tiers synced from apexhq.cloud
- ✅ **Authentication** - Email/password signup via Supabase Auth
- ✅ **Stripe Payments** - Full subscription & one-time payment flow with webhooks
- ✅ **Onboarding Flow** - Sign up → Verify → Choose plan → Pay → Setup profile
- ✅ **Client Dashboard** - View tier, brand profile, and manage work requests
- ✅ **Work Requests** - Create and track jobs (status: queued, in_progress, completed)
- ✅ **Tier-Based Job Types** - Each tier unlocks specific job types

### Internal Tools
- 🏢 **Office Visualization** - Live agent activity dashboard (original view)
- 📊 **Agent Status** - Real-time agent status and task monitoring

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payments**: Stripe Checkout + Webhooks
- **Hosting**: Cloudflare Pages (recommended) or GitHub Pages
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/xxdjhugoxx/apex-dashboard.git
cd apex-dashboard
npm install
```

### 2. Supabase Setup (Free Tier)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings → API** and copy:
   - Project URL
   - Anon/Public Key
   - Service Role Key (needed for Stripe webhooks)

4. Update `src/lib/config.js` with your credentials:
```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co'
export const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

5. Run the schema setup in **SQL Editor**:
```bash
# Copy and run each SQL file in Supabase SQL Editor:
# 1. supabase-schema.sql (agent tables - already exists)
# 2. supabase-client-schema.sql (client tables with Stripe fields)
```

6. Enable Email Auth:
   - Go to **Authentication → Providers**
   - Enable **Email** provider
   - **Configure email templates** (REQUIRED for OTP signup):
     - Go to **Authentication → Email Templates**
     - Select **Confirm signup** template
     - Update the email body to include `{{ .Token }}` prominently
     - Example: "Your verification code is: **{{ .Token }}**"
     - The 6-digit OTP code will be emailed to users during signup
     - You can still include the confirmation link as a fallback option

7. Create Storage Bucket:
   - Go to **Storage**
   - Create public bucket: `client-assets`
   - Enable public access for logo uploads

### 3. Stripe Payment Setup

**⚠️ Required for accepting payments and managing subscriptions**

See **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** for complete step-by-step instructions including:
- Creating Stripe products and prices
- Getting API keys and Price IDs
- Deploying Supabase Edge Functions
- Configuring webhooks
- Testing payment flow
- Going live

**Quick setup:**
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Create 6 products (Builder, Starter, Focus, Growth, Pro, Agency)
3. Copy Price IDs and API keys
4. Deploy Edge Functions: `supabase functions deploy`
5. Add secrets: `supabase secrets set STRIPE_SECRET_KEY=...`
6. Configure webhook in Stripe Dashboard
7. Update `.env` with your Price IDs

### 4. Local Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Note:** For full payment testing locally, you'll need to:
1. Deploy Supabase Edge Functions (they run on Supabase, not locally)
2. Configure Stripe webhook to point to your deployed function URL
3. Use Stripe test mode and test card numbers

### 5. Deployment Options

#### Option A: Cloudflare Pages (Recommended)

**Dashboard Configuration:**
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** (leave empty)
- **Build comments:** Enabled (optional)
- **Branch deployments:** All branches (optional)

**Via Cloudflare Dashboard:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub repository (`xxdjhugoxx/apex-dashboard`)
4. Configure the build settings above
5. Click **Save and Deploy**

**Via Wrangler CLI (Alternative):**
```bash
# Install wrangler globally (first time only)
npm install -g wrangler

# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=apex-dashboard
```

**Note:** The project includes `wrangler.toml` with SPA routing configuration. No interactive prompts required.

#### Option B: GitHub Pages

1. Update `package.json` homepage field:
```json
{
  "homepage": "https://xxdjhugoxx.github.io/apex-dashboard"
}
```

2. Build and deploy:
```bash
npm run build
```

3. Push the `dist/` folder to `gh-pages` branch:
```bash
# Use GitHub Actions or manual push
git subtree push --prefix dist origin gh-pages
```

4. Enable GitHub Pages in repo settings → Pages → Source: gh-pages branch

## Project Structure

```
src/
├── lib/
│   ├── auth.jsx           # Auth context provider
│   ├── supabase.js        # Supabase client
│   ├── config.js          # API keys & config
│   └── pricing.js         # Pricing tiers (synced from apexhq.cloud)
├── pages/
│   ├── AuthPage.jsx       # Sign in / Sign up
│   ├── PlansPage.jsx      # Pricing selection
│   ├── OnboardingPage.jsx # Multi-step onboarding
│   └── ClientDashboard.jsx # Main client view
├── components/
│   └── office/            # Office visualization components
├── ClientApp.jsx          # Client app router
├── App.jsx               # Office visualization (original)
└── main.jsx              # Entry point

supabase-schema.sql          # Agent tables (existing)
supabase-client-schema.sql   # Client tables (NEW)
```

## Database Schema

### Client Tables

**users** - Client profiles
- id (UUID, references auth.users)
- email, company_name, logo_url, bio
- tier_id (builder/starter/focus/growth/pro/agency)

**user_tiers** - Subscription tracking
- id, user_id, tier_name, monthly_price
- is_annual, status, started_at, expires_at

**work_requests** - Job queue
- id, user_id, job_type, title, description
- status (queued/in_progress/completed)
- priority, result_data, timestamps

## Pricing Tiers

| Tier | Price | Description |
|------|-------|-------------|
| **Builder** | $300 one-time | Logo, landing page, Instagram setup |
| **Starter** | $149/mo | 1 brand profile, 1 agent, 300 runs/mo |
| **Focus** | $297/mo | 1 profile, 1 department, 900 runs/mo |
| **Growth** | $697/mo | 2 profiles, 3 departments, 2.5K runs/mo (POPULAR) |
| **Pro** | $1,497/mo | 3 profiles, all agents, 6K runs/mo |
| **Agency** | $2,997/mo | Unlimited profiles, unlimited runs, white-label |

Annual billing: 20% off (monthly * 0.8)

## Job Types by Tier

- **Builder**: logo, landing_page, instagram_setup, brand_voice
- **Starter**: content_post, caption_gen
- **Focus**: + department_audit, workflow_build
- **Growth**: + lead_scoring, competitor_report, multi_channel
- **Pro**: + custom_voice_training, strategy_call, full_report
- **Agency**: + white_label, api_access, dedicated_support

## What's NOT Included (MVP Scope)

This MVP focuses on the core client signup and payment path:

❌ **Meta/Google OAuth** - Email/password only
❌ **Real Instagram Posting** - Jobs are queued but workers not connected
❌ **Paid AI APIs** - No Gemini/GPT calls in client flow
❌ **Email Notifications** - Would need paid SMTP service (uses Supabase Auth emails only)
❌ **Real-time Updates** - Polling-based, not WebSocket

These can be added when needed.

## Test Plan

### Manual Testing Checklist

1. **Auth Flow**
   - [ ] Sign up with email/password
   - [ ] Enter 6-digit OTP code from email
   - [ ] Verify OTP and proceed to plans page
   - [ ] Test resend code functionality
   - [ ] Sign in with existing account
   - [ ] Sign out

2. **Plans Page**
   - [ ] View all 6 pricing tiers
   - [ ] Toggle monthly/annual billing
   - [ ] See 20% discount on annual
   - [ ] Click plan button to start checkout

3. **Payment Flow (Stripe Test Mode)**
   - [ ] Redirect to Stripe Checkout
   - [ ] Use test card: 4242 4242 4242 4242
   - [ ] Complete payment successfully
   - [ ] Return to app with payment success
   - [ ] Webhook fires and updates database

4. **Onboarding (Post-Payment)**
   - [ ] Step 1: Enter company name
   - [ ] Step 2: Upload logo (or see Builder note)
   - [ ] Step 3: Enter brand bio
   - [ ] Complete setup and land on dashboard

5. **Return Sign-In Flow**
   - [ ] Sign out from dashboard
   - [ ] Sign in again with same account
   - [ ] Should go **directly to dashboard** (skip plans page)
   - [ ] Verify no plan selection prompt

6. **Client Dashboard**
   - [ ] View brand profile card
   - [ ] See selected tier displayed
   - [ ] Create new work request
   - [ ] View request with "queued" status
   - [ ] See tier-appropriate job types

7. **Database Verification**
   - [ ] Check `users` table has profile + `stripe_customer_id`
   - [ ] Check `user_tiers` table has subscription with `status='active'`
   - [ ] Check `stripe_subscription_id` and `stripe_price_id` populated
   - [ ] Check `work_requests` table has job

## Deployment Checklist

### Supabase
- [ ] Supabase project created
- [ ] Client schema SQL run (with Stripe fields)
- [ ] Storage bucket created
- [ ] Auth provider enabled
- [ ] Email templates configured for OTP

### Stripe
- [ ] Stripe account created
- [ ] Products and prices created (6 tiers, monthly + annual)
- [ ] Price IDs copied to `.env`
- [ ] API keys obtained (publishable + secret)
- [ ] Edge Functions deployed (`create-checkout-session`, `stripe-webhook`)
- [ ] Secrets configured in Supabase
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret added to Supabase secrets

### Deployment
- [ ] Environment variables configured
- [ ] Build tested locally
- [ ] Deployed to Cloudflare Pages or GitHub Pages
- [ ] Production environment variables set
- [ ] Payment flow tested end-to-end
- [ ] Custom domain configured (optional)

## Support

For issues or questions:
- GitHub Issues: https://github.com/xxdjhugoxx/apex-dashboard/issues
- Email: hugo@apexhq.cloud

## License

Proprietary - APEX AI Company
