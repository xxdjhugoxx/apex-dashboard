# Integrations Feature - Product Clarification

## 🎯 What APEX HQ Actually Is

**APEX HQ is a SYSTEM that companies hire to RUN their marketing/ads/Instagram.**

### Key Points:
- ✅ APEX is NOT an agency that manages client money
- ✅ APEX is NOT a studio where humans manually create each post
- ✅ APEX IS a system that automates marketing execution
- ✅ Clients keep full control of their ad accounts
- ✅ Ad spend flows directly through client accounts
- ✅ APEX workers execute campaigns automatically

---

## 💡 Why Integrations Matter

**Problem**: APEX needs access to client ad accounts and social platforms to run campaigns.

**Solution**: Integrations page where clients connect:
1. **Meta Ads** - Facebook & Instagram advertising
2. **Google Ads** - Search, display, YouTube advertising
3. **Instagram** - Automated posting

---

## 🏗️ How It Works

### Client Side (UI):
```
Client logs in → Dashboard → Integrations tab
  ↓
Sees 3 integration cards (Meta Ads, Google Ads, Instagram)
  ↓
Clicks "Connect" on Meta Ads
  ↓
(OAuth flow - coming soon once App IDs configured)
  ↓
Authenticates with their Meta Business account
  ↓
Tokens stored in integrations table
  ↓
Status changes: disconnected → connected
```

### Worker Side (Backend):
```
CORTEX Worker picks up work_request
  ↓
Checks job_type: "multi_channel_campaign"
  ↓
Reads integrations table for this user
  ↓
Gets Meta Ads access token
  ↓
Uses Meta Ads API with CLIENT'S token
  ↓
Creates campaign in CLIENT'S ad account
  ↓
Ad platform charges CLIENT directly
  ↓
Worker updates work_request: completed
```

---

## 📊 Database Schema

### integrations Table
```sql
create table public.integrations (
  id uuid primary key,
  user_id uuid not null,           -- Which client
  provider text not null,           -- 'meta_ads', 'google_ads', 'instagram'
  status text default 'disconnected', -- 'disconnected', 'connected', 'needs_reauth'
  
  -- OAuth tokens (encrypted at rest by Supabase)
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  
  -- Account info
  account_id text,                 -- Platform account ID
  account_name text,               -- Friendly name
  metadata jsonb default '{}',     -- Platform-specific data
  
  -- Tracking
  connected_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(user_id, provider)        -- One connection per provider per user
);
```

### RLS Policies
```sql
-- Clients can only see their own integrations
create policy "Users can view own integrations"
  on public.integrations for select
  using (auth.uid() = user_id);

-- Workers (service_role) can read all integrations
create policy "Service role can read all integrations"
  on public.integrations for select
  using (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
```

---

## 🎨 UI Components

### Integration Card (Disconnected State)
```
┌─────────────────────────────────────────────┐
│ 📘 Meta Ads                    [Connect]    │
│    Facebook & Instagram ad campaigns        │
│                                             │
│ ℹ️ Ad spend is billed to YOUR ad account.  │
│    APEX never pays or invoices ad spend.   │
│                                             │
│ 📝 Connect your Meta Business Manager...   │
│    Coming soon: OAuth will be enabled...   │
└─────────────────────────────────────────────┘
```

### Integration Card (Connected State)
```
┌─────────────────────────────────────────────┐
│ 📘 Meta Ads            ● Connected          │
│    Facebook & Instagram ad campaigns        │
│                            [Disconnect]     │
│                                             │
│ Account ID: act_123456789                   │
│ Connected: Sep 13, 2026                     │
└─────────────────────────────────────────────┘
```

### Integration Card (Needs Reauth State)
```
┌─────────────────────────────────────────────┐
│ 📘 Meta Ads            ⚠️ Needs Reauth      │
│    Facebook & Instagram ad campaigns        │
│                            [Disconnect]     │
│                                             │
│ ⚠️ Action Required: Reconnect this...      │
└─────────────────────────────────────────────┘
```

---

## 💰 Ad Spend Flow

### Traditional Agency Model (NOT APEX):
```
Client → Pays Agency → Agency Pays Ad Platform
         (markup)        (ad spend)
```

### APEX Model:
```
Client → Connects Ad Account → APEX Creates Campaigns
                                  ↓
                         Ad Platform Charges CLIENT Directly
```

**Key Difference**: APEX never touches client money. APEX only provides the automation system.

---

## 🔐 Security & Privacy

### Token Storage:
- ✅ Access tokens stored in Supabase (encrypted at rest)
- ✅ Refresh tokens stored securely
- ✅ Tokens never exposed to client-side JavaScript
- ✅ Workers use service_role key to access tokens

### Access Control:
- ✅ Clients can only see their own integrations
- ✅ Clients can disconnect at any time
- ✅ Workers read tokens server-side only
- ✅ RLS policies enforce isolation

---

## 🚀 Future: OAuth Implementation

### When App IDs Are Ready:

1. **Meta OAuth**:
```javascript
// Redirect to Meta OAuth
const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?
  client_id=${META_APP_ID}&
  redirect_uri=${REDIRECT_URI}&
  scope=ads_management,instagram_basic,instagram_content_publish`
```

2. **Google OAuth**:
```javascript
// Redirect to Google OAuth
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${GOOGLE_CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  scope=https://www.googleapis.com/auth/adwords`
```

3. **Instagram OAuth**:
```javascript
// Uses Meta OAuth with Instagram scopes
const authUrl = `https://api.instagram.com/oauth/authorize?
  client_id=${INSTAGRAM_APP_ID}&
  redirect_uri=${REDIRECT_URI}&
  scope=instagram_basic,instagram_content_publish`
```

### Callback Handler:
```javascript
// /api/integrations/callback
async function handleOAuthCallback(code, provider, userId) {
  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code, provider)
  
  // Store in integrations table
  await supabase.from('integrations').upsert({
    user_id: userId,
    provider: provider,
    status: 'connected',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: tokens.expires_at,
    account_id: tokens.account_id,
    connected_at: new Date()
  })
}
```

---

## 🎯 Use Cases

### 1. Client Connects Meta Ads
```
Client → Integrations → Connect Meta Ads
  → OAuth to Meta Business Manager
  → APEX gets access token
  → Token stored in integrations table
  → Status: connected
```

### 2. Client Creates Work Request
```
Client → Dashboard → New Request
  → Type: "Multi-Channel Campaign"
  → Title: "Launch fall product line"
  → Description: "Target women 25-45, $5K budget"
  → Submit (status: queued)
```

### 3. Worker Executes Campaign
```
Worker → Polls work_requests table
  → Finds queued job
  → Reads integrations for this user
  → Gets Meta Ads token
  → Calls Meta Ads API:
    - Create campaign
    - Create ad sets
    - Create ads
  → Updates work_request: completed
  → Result: Campaign live in CLIENT'S account
```

### 4. Client Views Results
```
Client → Dashboard → Work Requests
  → Sees "completed" status
  → result_data shows:
    - Campaign ID: 123456789
    - Ad Set IDs: [111, 222, 333]
    - Targeting: Women 25-45
    - Budget: $5,000
    - Status: Active
  → Client logs into Meta Ads Manager
  → Sees campaign running in THEIR account
  → Ad spend charges THEIR payment method
```

---

## 📋 Checklist for Full Implementation

### Phase 1: OAuth Setup (Next)
- [ ] Register Meta Business app
- [ ] Register Google Ads app
- [ ] Register Instagram app
- [ ] Configure redirect URIs
- [ ] Add App IDs to environment
- [ ] Implement OAuth callback handlers
- [ ] Test token storage

### Phase 2: Token Refresh (After OAuth)
- [ ] Implement token refresh logic
- [ ] Cron job to refresh expiring tokens
- [ ] Update status to 'needs_reauth' on failure
- [ ] Notify clients when reauth needed

### Phase 3: Worker Integration (After Tokens)
- [ ] Workers read integrations table
- [ ] Workers use client tokens for API calls
- [ ] Workers handle rate limits per account
- [ ] Workers log all actions to work_requests

---

## 🎉 Current Status

**UI**: ✅ Complete (Meta Ads, Google Ads, Instagram cards)  
**Database**: ✅ Complete (integrations table + RLS)  
**OAuth**: ⏳ Stubbed (shows "Coming soon" message)  
**Worker Access**: ✅ Complete (service_role policies)  
**Documentation**: ✅ Complete (this file)  

**Next Step**: Register OAuth apps and implement callback handlers.

---

## 💬 Copy Used in UI

### Banner:
> **Ad spend is billed to YOUR ad account.** APEX never pays or invoices ad spend. 
> We connect to your existing Meta Ads, Google Ads, and Instagram accounts to run campaigns on your behalf. 
> You maintain full control and visibility of all spending through your own ad platform dashboards.

### Meta Ads:
> Connect your Meta Business Manager to run Facebook and Instagram ad campaigns. 
> APEX will create and manage campaigns using YOUR ad account.

### Google Ads:
> Connect your Google Ads account to run search, display, and YouTube campaigns. 
> APEX will manage campaigns using YOUR ad account.

### Instagram:
> Connect your Instagram Business account to enable automated posting. 
> APEX will post on your behalf (no manual work required).

---

**This is a SYSTEM, not a studio.**  
Clients own accounts. APEX executes automatically.
