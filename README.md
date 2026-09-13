# APEX HQ Client Dashboard

AI-powered marketing automation platform with client onboarding and work request management.

## Features

### Client-Facing MVP
- ✅ **Plans Page** - 6 pricing tiers synced from apexhq.cloud
- ✅ **Authentication** - Email/password signup via Supabase Auth
- ✅ **Onboarding Flow** - Tier selection → Company info → Logo upload → Brand bio
- ✅ **Client Dashboard** - View tier, brand profile, and manage work requests
- ✅ **Work Requests** - Create and track jobs (status: queued, in_progress, completed)
- ✅ **Tier-Based Job Types** - Each tier unlocks specific job types

### Internal Tools
- 🏢 **Office Visualization** - Live agent activity dashboard (original view)
- 📊 **Agent Status** - Real-time agent status and task monitoring

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: GitHub Pages (static site)
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

4. Update `src/lib/config.js` with your credentials:
```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co'
export const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

5. Run the schema setup in **SQL Editor**:
```bash
# Copy and run each SQL file in Supabase SQL Editor:
# 1. supabase-schema.sql (agent tables - already exists)
# 2. supabase-client-schema.sql (NEW: client tables)
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

### 3. Local Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Deployment Options

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

This MVP focuses on the core client signup path with free infrastructure:

❌ **Meta/Google OAuth** - Email/password only
❌ **Real Instagram Posting** - Jobs are queued but workers not connected
❌ **Paid AI APIs** - No Gemini/GPT calls in client flow
❌ **Stripe Integration** - Tier selection is UI-only (no billing)
❌ **Email Notifications** - Would need paid SMTP service
❌ **Real-time Updates** - Polling-based, not WebSocket

These can be added post-MVP when budget/infrastructure is ready.

## Test Plan

### Manual Testing Checklist

1. **Auth Flow**
   - [ ] Sign up with email/password
   - [ ] Enter 6-digit OTP code from email
   - [ ] Verify OTP and proceed to onboarding
   - [ ] Test resend code functionality
   - [ ] Sign in with existing account
   - [ ] Sign out

2. **Plans Page**
   - [ ] View all 6 pricing tiers
   - [ ] Toggle monthly/annual billing
   - [ ] See 20% discount on annual

3. **Onboarding**
   - [ ] Step 1: Enter company name
   - [ ] Step 2: Upload logo (or see Builder note)
   - [ ] Step 3: Enter brand bio
   - [ ] Complete setup

4. **Client Dashboard**
   - [ ] View brand profile card
   - [ ] See work requests (0 initially)
   - [ ] Create new work request
   - [ ] View request with "queued" status
   - [ ] See tier-appropriate job types

5. **Database**
   - [ ] Check `users` table has profile
   - [ ] Check `user_tiers` table has subscription
   - [ ] Check `work_requests` table has job

## Deployment Checklist

- [ ] Supabase project created
- [ ] Client schema SQL run
- [ ] Storage bucket created
- [ ] Auth provider enabled
- [ ] Config updated with real keys
- [ ] Build tested locally
- [ ] GitHub Pages enabled
- [ ] Custom domain configured (optional)

## Support

For issues or questions:
- GitHub Issues: https://github.com/xxdjhugoxx/apex-dashboard/issues
- Email: hugo@apexhq.cloud

## License

Proprietary - APEX AI Company
