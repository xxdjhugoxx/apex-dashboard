# APEX HQ - Quick Setup Guide

This guide walks you through deploying APEX HQ on **free infrastructure** (Supabase + GitHub Pages).

## Prerequisites

- GitHub account
- Node.js 16+ installed
- 10 minutes of your time

## Step 1: Supabase Setup (5 min)

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Fill in:
   - **Name**: apex-dashboard
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **Create Project** (takes ~2 minutes)

### 1.2 Get API Credentials

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

### 1.3 Run Database Schema

1. Go to **SQL Editor** (left sidebar)
2. Create a new query
3. Copy contents of `supabase-schema.sql` and run it
4. Create another query
5. Copy contents of `supabase-client-schema.sql` and run it
6. You should see success messages

### 1.4 Enable Auth

1. Go to **Authentication → Providers**
2. Enable **Email** provider (should be on by default)
3. Optional: Customize email templates

### 1.5 Create Storage Bucket

1. Go to **Storage** (left sidebar)
2. Click **New Bucket**
3. Name: `client-assets`
4. **Public**: ✅ Yes
5. Click **Create Bucket**
6. Click the bucket → **Policies** → Click **New Policy**
7. Template: **Allow public access to files**
8. Save

## Step 2: Local Development (3 min)

### 2.1 Clone and Install

```bash
git clone https://github.com/xxdjhugoxx/apex-dashboard.git
cd apex-dashboard
npm install
```

### 2.2 Configure Supabase

Edit `src/lib/config.js`:

```javascript
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'
export const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY-HERE'
```

Replace with values from Step 1.2.

### 2.3 Test Locally

```bash
npm run dev
```

Open http://localhost:5173

Test the flow:
1. Click a pricing tier
2. Sign up with email/password
3. Complete onboarding
4. Create a work request

## Step 3: Deploy to GitHub Pages (2 min)

### 3.1 Build Production

```bash
npm run build
```

This creates a `dist/` folder.

### 3.2 Deploy

#### Option A: GitHub Actions (Recommended)

1. Push your changes to GitHub
2. Go to repo **Settings → Pages**
3. Source: **GitHub Actions**
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

5. Push this file → GitHub Actions will auto-deploy

#### Option B: Manual Deploy

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

### 3.3 Enable GitHub Pages

1. Go to repo **Settings → Pages**
2. Source: **Deploy from branch**
3. Branch: **gh-pages** / **(root)**
4. Click **Save**
5. Wait 1-2 minutes
6. Your site is live at: `https://xxdjhugoxx.github.io/apex-dashboard/`

## Testing Your Deployment

Visit your GitHub Pages URL and test:

1. ✅ Plans page loads
2. ✅ Sign up creates account
3. ✅ Onboarding saves profile
4. ✅ Dashboard shows work requests
5. ✅ Create work request works

## Troubleshooting

### "Failed to fetch" errors

- Check Supabase URL and key in `src/lib/config.js`
- Make sure both SQL schemas were run
- Check browser console for specific errors

### Logo upload fails

- Make sure `client-assets` bucket exists
- Check bucket is **public**
- Check RLS policies allow public uploads

### Auth not working

- Check Email provider is enabled in Supabase
- Check there are no typos in credentials
- Try signing up with a real email (check spam folder)

### Page blank after deploy

- Check `vite.config.js` has `base: './'`
- Check GitHub Pages is enabled
- Wait 2-3 minutes for propagation
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

## Next Steps

Once deployed:

1. ✅ Test the full signup flow
2. ✅ Check Supabase dashboard for user data
3. ✅ Create test work requests
4. ✅ Share the link with Hugo for approval

## What's NOT Included (MVP Scope)

Remember, this is the FREE MVP. It does NOT include:

- ❌ Payment processing (Stripe)
- ❌ Real Instagram posting
- ❌ AI content generation (requires paid APIs)
- ❌ Email notifications
- ❌ Meta/Google OAuth
- ❌ Real-time job processing

These can be added later when you're ready to scale!

## Need Help?

- Check `README.md` for full documentation
- Open a GitHub issue
- Email: hugo@apexhq.cloud

---

**Time to deploy**: ~10 minutes  
**Monthly cost**: $0 (100% free tier)  
**Result**: Fully functional client signup → dashboard flow
