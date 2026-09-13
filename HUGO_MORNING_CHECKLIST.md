# 🌅 HUGO MORNING ACTIVATION CHECKLIST

**Status**: System is built and ready for activation.  
**Time Required**: 10 minutes  
**What You'll Have**: Fully functional client signup → work queue system on free stack

---

## ✅ Step 1: Create Supabase Project (3 min)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `apex-dashboard` (or anything)
   - **Database Password**: Generate + SAVE IT
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. ☕ Wait ~2 minutes for provisioning

---

## ✅ Step 2: Run Database Schemas (2 min)

### 2.1 Run Agent Schema (existing tables)
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy entire contents of `supabase-schema.sql`
4. Paste and click **"Run"**
5. ✅ Should see "Success. No rows returned"

### 2.2 Run Client Schema (NEW tables)
1. Click **"New query"** again
2. Copy entire contents of `supabase-client-schema.sql`
3. Paste and click **"Run"**
4. ✅ Should see "Success. No rows returned"

**Tables Created:**
- `users` - Client profiles
- `user_tiers` - Subscription tracking
- `work_requests` - Job queue (CORTEX workers read from here)
- `integrations` - Ad accounts & social platforms (NEW)

---

## ✅ Step 3: Create Storage Bucket (1 min)

1. Go to **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Name: `client-assets`
4. Toggle **"Public bucket"** to ✅ ON
5. Click **"Create bucket"**
6. Click the bucket → **"Policies"** tab
7. Click **"New Policy"**
8. Select template: **"Allow public access to files"**
9. Click **"Save"**

---

## ✅ Step 4: Get API Credentials (1 min)

1. Go to **Settings → API** (gear icon, left sidebar)
2. Copy these TWO values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **SAVE THESE!** You'll need them in the next step.

---

## ✅ Step 5: Update Config & Deploy (3 min)

### 5.1 Update Local Config
Edit `src/lib/config.js`:

```javascript
export const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE'
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'
```

### 5.2 Commit & Push
```bash
git add src/lib/config.js
git commit -m "config: Add production Supabase credentials"
git push origin cursor/client-mvp-fc0c
```

### 5.3 Merge PR
1. Go to https://github.com/xxdjhugoxx/apex-dashboard/pull/3
2. Click **"Merge pull request"**
3. Click **"Confirm merge"**
4. GitHub Actions will auto-deploy (~2 min)

---

## ✅ Step 6: Test Live Site (2 min)

Visit: https://xxdjhugoxx.github.io/apex-dashboard/

### Test Flow:
1. **Plans Page** → Select "Growth" tier
2. **Sign Up** → Email: `test@apex.ai`, Password: `test123456`
3. **Onboarding**:
   - Company: "APEX Test Client"
   - Logo: Skip or upload
   - Bio: "Testing the system"
4. **Dashboard** → Click "+ New Request"
5. **Create Work Request**:
   - Job Type: "Social Media Post"
   - Title: "Instagram launch post"
   - Description: "Announce our new product"
6. **Integrations Tab** → Click "Integrations" button
   - See Meta Ads, Google Ads, Instagram cards
   - Click "Connect" (shows "Coming soon" message)
   - Note: "Ad spend is billed to YOUR ad account"
7. **Verify**:
   - Request shows with "queued" status
   - Go to Supabase → Table Editor → `work_requests`
   - See your request in the table
   - Check `integrations` table (empty until OAuth set up)

---

## 🎯 System Architecture (For Your Reference)

### Client Flow:
```
Client → Signs Up → Selects Tier → Creates Work Request
         ↓
    work_requests table (status: 'queued')
         ↓
    [CORTEX Workers pick up jobs - to be built]
         ↓
    Workers update status: 'in_progress' → 'completed'
         ↓
    Results written to result_data (JSONB)
         ↓
    Client sees completed work in dashboard
```

### This is a SYSTEM, Not a Studio

**Key Design Principles:**
1. **work_requests** = Job queue
2. **CORTEX workers** = Automated processors (not built yet)
3. **Humans** = Approval gates only, not producers
4. **result_data** = JSONB field for worker outputs

**Next Phase (After MVP):**
- Build CORTEX worker services
- Workers use **service_role** key to access work_requests
- Workers update status + write results
- Add approval gates (human reviews before publish)

---

## 🔐 Security Notes

**What's Safe to Commit:**
- ✅ Supabase Project URL (public)
- ✅ Anon/Public Key (safe for client-side)

**What to NEVER Commit:**
- ❌ Service Role Key (workers will use this later)
- ❌ Database Password
- ❌ Any paid API keys

**Service Role Key Location (for later):**
- Settings → API → `service_role` key
- Only use server-side for CORTEX workers
- Never expose in client code

---

## 🧪 Verify Everything Works

Run through this checklist:

- [ ] Site loads at GitHub Pages URL
- [ ] Can sign up with email/password
- [ ] Onboarding saves company info
- [ ] Dashboard loads with profile card
- [ ] Can create work request
- [ ] Request shows "queued" status
- [ ] Check Supabase: `work_requests` table has row
- [ ] Check Supabase: `users` table has profile
- [ ] Check Supabase: `user_tiers` table has tier

---

## 🚨 Troubleshooting

### "Failed to fetch" on live site
→ Check `src/lib/config.js` has correct credentials  
→ Rebuild: `npm run build && git push`

### Auth not working
→ Supabase → Authentication → Providers → Enable "Email"

### Logo upload fails
→ Check Storage → `client-assets` bucket exists and is public

### Work requests not saving
→ Check SQL Editor → Re-run `supabase-client-schema.sql`

---

## 📞 If Something's Broken

1. Check browser console for errors
2. Check Supabase logs: Logs & Reports (left sidebar)
3. Check GitHub Actions: Actions tab in repo
4. Open GitHub issue with error details

---

## 🎉 Success Criteria

✅ You're done when:
- Live site works end-to-end
- Client can sign up → onboard → create work request
- Work request appears in Supabase `work_requests` table
- Status shows as "queued"

**Next:** Build CORTEX workers to process the queue!

---

**Total Time:** ~10 minutes  
**Cost:** $0/month (free tier)  
**Status:** Ready to activate 🚀
