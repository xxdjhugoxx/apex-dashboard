# APEX HQ Client MVP - Test Plan

## Test Environment Setup

### Prerequisites
1. ✅ Supabase project created (free tier)
2. ✅ Both SQL schemas run:
   - `supabase-schema.sql`
   - `supabase-client-schema.sql`
3. ✅ Storage bucket `client-assets` created (public)
4. ✅ Email auth enabled in Supabase
5. ✅ `src/lib/config.js` updated with your Supabase credentials

### Local Test Environment
```bash
npm install
npm run dev
```

Open: http://localhost:5173

---

## Test Suite

### 1. Plans Page Tests

#### TC-01: Plans Page Loads
**Steps:**
1. Visit site root
2. Verify plans page loads

**Expected:**
- [ ] Page displays 6 pricing tiers
- [ ] Each tier shows name, price, features
- [ ] "Growth" tier has "MOST POPULAR" badge
- [ ] Monthly/Annual toggle visible

#### TC-02: Billing Toggle
**Steps:**
1. On plans page, click "Annual"
2. Verify prices update

**Expected:**
- [ ] Builder stays $300 (one-time)
- [ ] Starter shows $119/mo (was $149)
- [ ] Focus shows $237/mo (was $297)
- [ ] Growth shows $557/mo (was $697)
- [ ] Pro shows $1,197/mo (was $1,497)
- [ ] Agency shows $2,397/mo (was $2,997)
- [ ] Text shows "(annual)" suffix

#### TC-03: Tier Selection (Unauthenticated)
**Steps:**
1. Click any tier's CTA button

**Expected:**
- [ ] Shows "Sign Up to Get Started" text
- [ ] Clicking redirects to auth page

---

### 2. Authentication Tests

#### TC-04: Sign Up - Happy Path
**Steps:**
1. On auth page, ensure "Sign Up" tab is active
2. Enter email: `test@example.com`
3. Enter password: `test123456`
4. Click "Create Account"

**Expected:**
- [ ] No errors shown
- [ ] Redirects to plans page (for tier selection)
- [ ] Supabase Auth dashboard shows new user
- [ ] `users` table has new row with email

#### TC-05: Sign Up - Validation
**Steps:**
1. Try invalid email: `notanemail`
2. Try short password: `12345`

**Expected:**
- [ ] Email validation error shown
- [ ] Password must be 6+ characters

#### TC-06: Sign In - Happy Path
**Steps:**
1. Sign out (if signed in)
2. On auth page, click "Sign In" tab
3. Enter existing credentials
4. Click "Sign In"

**Expected:**
- [ ] No errors
- [ ] Redirects to dashboard (if onboarding complete)
- [ ] Or redirects to plans (if onboarding not complete)

#### TC-07: Sign In - Invalid Credentials
**Steps:**
1. Enter email: `test@example.com`
2. Enter wrong password: `wrongpass`
3. Click "Sign In"

**Expected:**
- [ ] Error message shown: "Invalid login credentials"
- [ ] User remains on auth page

---

### 3. Onboarding Tests

#### TC-08: Onboarding - Step 1 (Company Name)
**Steps:**
1. After signup, select any tier from plans page
2. See onboarding page, step 1
3. Leave company name blank, click "Continue"
4. Enter company name: "Acme Inc"
5. Click "Continue"

**Expected:**
- [ ] "Continue" disabled when blank
- [ ] "Continue" enabled when filled
- [ ] Progress to step 2

#### TC-09: Onboarding - Step 2 (Logo - Builder Tier)
**Steps:**
1. Select "Builder" tier during onboarding
2. Reach step 2

**Expected:**
- [ ] Shows note: "Logo design is included in your Builder package"
- [ ] No file upload input shown
- [ ] Can click "Continue" without upload

#### TC-10: Onboarding - Step 2 (Logo - Other Tiers)
**Steps:**
1. Select "Starter" tier during onboarding
2. Reach step 2
3. Click file input, select image
4. Click "Continue"

**Expected:**
- [ ] File input visible
- [ ] Can select image file
- [ ] File name appears in input
- [ ] Can continue with or without file

#### TC-11: Onboarding - Step 3 (Bio)
**Steps:**
1. Reach step 3
2. Enter bio: "We sell AI-powered marketing automation"
3. Click "Complete Setup"

**Expected:**
- [ ] Bio saved
- [ ] Redirects to dashboard
- [ ] Loading state shown during save

#### TC-12: Onboarding - Database Persistence
**Steps:**
1. Complete onboarding
2. Check Supabase tables

**Expected:**
- [ ] `users` table: `company_name`, `bio`, `tier_id` populated
- [ ] `users` table: `logo_url` populated (if uploaded)
- [ ] `user_tiers` table: New row with tier info

---

### 4. Client Dashboard Tests

#### TC-13: Dashboard Loads
**Steps:**
1. Complete onboarding
2. Verify dashboard loads

**Expected:**
- [ ] Header shows "APEX CLIENT DASHBOARD"
- [ ] Company name in header
- [ ] Three stat cards visible
- [ ] Work requests section visible

#### TC-14: Profile Card
**Steps:**
1. View profile card (top-left)

**Expected:**
- [ ] Shows company logo (if uploaded) or emoji
- [ ] Shows company name
- [ ] Shows tier name
- [ ] Shows bio text

#### TC-15: Empty Work Requests State
**Steps:**
1. New account, no work requests yet
2. View work requests section

**Expected:**
- [ ] Empty state shown
- [ ] Message: "No work requests yet"
- [ ] CTA: "Create First Request"

#### TC-16: Create Work Request
**Steps:**
1. Click "+ New Request"
2. Modal opens
3. Select job type: "Social Media Post"
4. Title: "Instagram post for product launch"
5. Description: "Need a post announcing our new product"
6. Click "Create Request"

**Expected:**
- [ ] Modal opens with form
- [ ] Job type dropdown shows tier-appropriate types
- [ ] Form validates (title required)
- [ ] Request created successfully
- [ ] Modal closes
- [ ] Request appears in list

#### TC-17: Work Request Display
**Steps:**
1. View created work request in list

**Expected:**
- [ ] Shows title
- [ ] Shows description
- [ ] Shows job type
- [ ] Shows creation date
- [ ] Shows status badge: "queued" (yellow)

#### TC-18: Multiple Work Requests
**Steps:**
1. Create 3 different work requests
2. View list

**Expected:**
- [ ] All 3 requests visible
- [ ] Newest first (desc order)
- [ ] Each has correct data

---

### 5. Tier-Based Job Types Tests

#### TC-19: Builder Tier Job Types
**Steps:**
1. Account with Builder tier
2. Click "+ New Request"
3. Check job type dropdown

**Expected:**
- [ ] Logo Design
- [ ] Landing Page
- [ ] Instagram Setup
- [ ] Brand Voice Document

#### TC-20: Starter Tier Job Types
**Steps:**
1. Account with Starter tier
2. Check job type dropdown

**Expected:**
- [ ] Social Media Post
- [ ] Caption Generation

#### TC-21: Growth Tier Job Types
**Steps:**
1. Account with Growth tier
2. Check job type dropdown

**Expected:**
- [ ] Social Media Post
- [ ] Caption Generation
- [ ] Lead Scoring
- [ ] Competitor Report
- [ ] Multi-Channel Campaign

---

### 6. Security & RLS Tests

#### TC-22: Row Level Security - Users Table
**Steps:**
1. Sign in as User A
2. Open browser console
3. Try to query all users:
```javascript
const { data } = await supabase.from('users').select('*')
console.log(data)
```

**Expected:**
- [ ] Returns only current user's profile
- [ ] Cannot see other users' data

#### TC-23: Row Level Security - Work Requests
**Steps:**
1. Sign in as User A, create work request
2. Sign in as User B (different account)
3. Check work requests list

**Expected:**
- [ ] User B sees only their own requests
- [ ] User A's requests not visible to User B

---

### 7. UI/UX Tests

#### TC-24: Responsive Design
**Steps:**
1. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**Expected:**
- [ ] Plans page grid responds properly
- [ ] Dashboard cards stack on mobile
- [ ] Forms remain usable on small screens
- [ ] No horizontal scroll

#### TC-25: Loading States
**Steps:**
1. Observe loading during:
   - Initial page load
   - Sign up
   - Onboarding completion
   - Creating work request

**Expected:**
- [ ] Loading spinner or text shown
- [ ] Buttons disabled during loading
- [ ] No double-submissions possible

#### TC-26: Error Handling
**Steps:**
1. Disconnect internet
2. Try to sign up

**Expected:**
- [ ] Error message shown
- [ ] User not left in broken state
- [ ] Can retry after reconnecting

---

### 8. Build & Deployment Tests

#### TC-27: Local Build
**Steps:**
```bash
npm run build
npm run preview
```

**Expected:**
- [ ] Build completes without errors
- [ ] `dist/` folder created
- [ ] Preview server runs
- [ ] All features work in production build

#### TC-28: GitHub Pages Deployment
**Steps:**
1. Push to `cursor/client-mvp-fc0c` branch
2. Check GitHub Actions
3. Visit deployed URL

**Expected:**
- [ ] Actions run successfully
- [ ] No build errors
- [ ] Site deployed to gh-pages
- [ ] All features work on live site

---

## Test Results Template

### Tester Info
- **Name:**
- **Date:**
- **Environment:** Local / Deployed
- **Browser:** Chrome / Firefox / Safari / Edge
- **OS:** Windows / macOS / Linux

### Results Summary
- **Total Tests:** 28
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___

### Failed Tests
| Test ID | Description | Error Details |
|---------|-------------|---------------|
|         |             |               |

### Notes & Observations
- 
- 
- 

### Screenshots
Attach screenshots of:
1. Plans page
2. Onboarding flow
3. Client dashboard
4. Work request creation

---

## Acceptance Criteria

The MVP is considered **READY FOR DEPLOYMENT** when:

- [ ] All 28 test cases pass
- [ ] No critical bugs found
- [ ] Data persists correctly to Supabase
- [ ] RLS policies prevent unauthorized access
- [ ] Build deploys to GitHub Pages without errors
- [ ] Hugo approves the UX and functionality

---

## Bug Report Template

**Bug ID:** BUG-XXX  
**Severity:** Critical / High / Medium / Low  
**Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
- 

**Actual Behavior:**
- 

**Screenshots:**
- 

**Environment:**
- Browser:
- OS:
- Account: (test email used)

---

## Contact

Questions about testing? Open a GitHub issue or email hugo@apexhq.cloud
