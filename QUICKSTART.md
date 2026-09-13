# APEX HQ - Quickstart (5 Minutes)

Get APEX HQ running locally in 5 minutes.

## Step 1: Clone & Install (1 min)

```bash
git clone https://github.com/xxdjhugoxx/apex-dashboard.git
cd apex-dashboard
npm install
```

## Step 2: Setup Supabase (3 min)

### 2.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Click "New Project"
4. Fill in name, password, region
5. Wait ~2 min for project creation

### 2.2 Run Database Setup
1. Go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy/paste contents of `supabase-schema.sql`
4. Click "Run"
5. Create another query
6. Copy/paste contents of `supabase-client-schema.sql`
7. Click "Run"

### 2.3 Create Storage Bucket
1. Go to **Storage** (left sidebar)
2. Click "New Bucket"
3. Name: `client-assets`
4. Make it **public** ✅
5. Click "Create"

### 2.4 Get API Credentials
1. Go to **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (long string)

### 2.5 Update Config
Edit `src/lib/config.js`:

```javascript
export const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE'
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'
```

## Step 3: Run Locally (1 min)

```bash
npm run dev
```

Open: http://localhost:5173

## Test the Flow

1. **Plans Page** - Select any tier
2. **Sign Up** - Email + password
3. **Onboarding** - Company name → Logo → Bio
4. **Dashboard** - Create a work request
5. **Verify** - Check Supabase tables for data

## That's It! 🎉

You now have APEX HQ running locally with:
- ✅ Authentication
- ✅ Client onboarding
- ✅ Work request management
- ✅ Database persistence

## Next Steps

- **Test thoroughly** - See `TEST_PLAN.md`
- **Deploy to production** - See `SETUP_GUIDE.md`
- **Read docs** - See `README.md`

## Troubleshooting

### "Failed to fetch" errors
- Check Supabase URL and key are correct
- Make sure SQL schemas were run
- Check browser console for details

### Auth not working
- Verify Email auth is enabled in Supabase
- Check credentials have no extra spaces
- Try a real email address

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Need Help?

- 📖 Full docs: `README.md`
- 🧪 Test plan: `TEST_PLAN.md`
- 🚀 Deploy guide: `SETUP_GUIDE.md`
- 🐛 GitHub Issues: https://github.com/xxdjhugoxx/apex-dashboard/issues

---

**Time to run:** 5 minutes  
**Cost:** $0 (free tier)
