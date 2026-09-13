# APEX HQ - Quick Reference Card

## 🚀 One-Command Start

```bash
git clone https://github.com/xxdjhugoxx/apex-dashboard.git
cd apex-dashboard
npm install
npm run dev
```

**⚠️ First time? Update `src/lib/config.js` with your Supabase credentials!**

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `QUICKSTART.md` | Get running in 5 min |
| `SETUP_GUIDE.md` | Full deployment guide |
| `TEST_PLAN.md` | 28 test cases |
| `README.md` | Complete technical docs |
| `COMPLETION_SUMMARY.md` | Project overview |

---

## 🔑 Supabase Setup (Quick)

1. **Create project** → supabase.com
2. **Run SQL schemas**:
   - `supabase-schema.sql` (agents)
   - `supabase-client-schema.sql` (clients)
3. **Create bucket**: `client-assets` (public)
4. **Get credentials**: Settings → API
5. **Update**: `src/lib/config.js`

---

## 📊 Database Tables

### users
```sql
id, email, company_name, logo_url, bio, tier_id
```

### user_tiers
```sql
id, user_id, tier_name, monthly_price, is_annual, status
```

### work_requests
```sql
id, user_id, job_type, title, description, status, priority
```

---

## 💰 Pricing Tiers

| Tier | Price | Type |
|------|-------|------|
| Builder | $300 | One-time |
| Starter | $149/mo | Monthly |
| Focus | $297/mo | Monthly |
| Growth | $697/mo | Monthly (Popular) |
| Pro | $1,497/mo | Monthly |
| Agency | $2,997/mo | Monthly |

**Annual**: 20% off (price × 0.8)

---

## 🎯 User Flow

```
Visit → Plans → Sign Up → Onboarding → Dashboard → Create Work Request
```

---

## 🧪 Quick Test

```bash
# 1. Sign up
test@example.com / test123456

# 2. Complete onboarding
Company: "Acme Inc"
Bio: "We sell AI automation"

# 3. Create work request
Type: "Social Media Post"
Title: "Instagram launch post"

# 4. Verify in Supabase
Check: users, user_tiers, work_requests tables
```

---

## 🛠 Common Commands

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Preview
npm run preview

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Project Structure

```
src/
├── lib/
│   ├── auth.jsx          # Auth provider
│   ├── supabase.js       # DB client
│   ├── config.js         # ⚠️ UPDATE THIS
│   └── pricing.js        # Tier data
├── pages/
│   ├── AuthPage.jsx      # Sign in/up
│   ├── PlansPage.jsx     # Pricing
│   ├── OnboardingPage.jsx # Onboarding
│   └── ClientDashboard.jsx # Dashboard
├── ClientApp.jsx         # Router
└── main.jsx              # Entry
```

---

## 🔐 RLS Policies

```sql
-- Users can only see their own data
users: auth.uid() = id
user_tiers: auth.uid() = user_id
work_requests: auth.uid() = user_id
```

---

## 🐛 Troubleshooting

### "Failed to fetch"
→ Check `src/lib/config.js` has correct Supabase URL/key

### Auth not working
→ Enable Email provider in Supabase Auth settings

### Build errors
→ `rm -rf node_modules && npm install`

### Logo upload fails
→ Check `client-assets` bucket exists and is public

---

## 🚢 Deploy to GitHub Pages

```bash
# 1. Update config
# 2. Push branch
git push origin cursor/client-mvp-fc0c

# 3. Merge PR #3
# 4. GitHub Actions auto-deploys
# 5. Visit: https://xxdjhugoxx.github.io/apex-dashboard/
```

---

## 📞 Get Help

| Resource | Link |
|----------|------|
| PR | https://github.com/xxdjhugoxx/apex-dashboard/pull/3 |
| Issues | https://github.com/xxdjhugoxx/apex-dashboard/issues |
| Supabase | https://supabase.com/dashboard |

---

## ✅ MVP Scope

**Included:**
- ✅ Auth (email/password)
- ✅ Plans page
- ✅ Onboarding
- ✅ Dashboard
- ✅ Work requests (queued)
- ✅ RLS security
- ✅ Free hosting

**Not Included:**
- ❌ Stripe payments
- ❌ Real job execution
- ❌ AI APIs
- ❌ Email notifications
- ❌ Instagram posting

---

## 💵 Cost

**Monthly:** $0 (100% free tier)

- Supabase Free: 500MB DB, 1GB storage
- GitHub Pages: Free static hosting
- No paid APIs

---

## 📈 Success Checklist

- [ ] Site loads
- [ ] Can sign up
- [ ] Onboarding works
- [ ] Dashboard shows data
- [ ] Work requests create
- [ ] Data in Supabase
- [ ] RLS works

---

**Need more details?** See full docs:
- `QUICKSTART.md` - 5 min setup
- `SETUP_GUIDE.md` - 10 min deployment
- `TEST_PLAN.md` - 28 test cases
- `README.md` - Technical details

---

*APEX HQ - AI Marketing Automation*  
*Built with React + Supabase + ❤️*
