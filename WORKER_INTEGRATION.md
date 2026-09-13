# CORTEX Worker Integration Guide

This document explains how CORTEX workers integrate with the APEX client system.

---

## 🏗️ System Architecture

```
┌─────────────┐
│   CLIENTS   │ (Many clients, each creating work requests)
└──────┬──────┘
       │
       ├─ Sign up / Onboarding
       ├─ Create work requests
       │  (job_type, title, description)
       │
       ▼
┌──────────────────────────────────────┐
│      work_requests (Queue)           │
│  ┌────────────────────────────────┐  │
│  │ status: 'queued'               │  │
│  │ user_id: client UUID           │  │
│  │ job_type: 'content_post'       │  │
│  │ title: "Instagram launch"      │  │
│  │ description: "..."             │  │
│  │ result_data: {}                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│      CORTEX WORKERS                  │
│  (Automated, server-side)            │
│                                      │
│  1. Poll for queued jobs             │
│  2. Pick up job (update status)      │
│  3. Process (AI generation)          │
│  4. Write results                    │
│  5. Update status to 'completed'     │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Client Dashboard (Views Results)    │
│  - See completed work                │
│  - Approve/request changes           │
│  - Download assets                   │
└──────────────────────────────────────┘
```

---

## 🔑 Worker Authentication

Workers use the **service_role** key (NOT anon key):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← Service role, not anon
)
```

**Get Service Role Key:**
1. Supabase → Settings → API
2. Copy **service_role** key
3. Store in environment variable (NEVER commit!)

---

## 📋 Worker Workflow (Pseudocode)

### Step 1: Poll for Queued Jobs

```javascript
async function pollForJobs() {
  const { data: jobs, error } = await supabase
    .from('work_requests')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(10)
  
  return jobs
}
```

### Step 2: Claim a Job

```javascript
async function claimJob(jobId) {
  const { data, error } = await supabase
    .from('work_requests')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)
    .eq('status', 'queued')  // ← Optimistic locking
    .select()
  
  if (data && data.length > 0) {
    return data[0]  // Successfully claimed
  }
  return null  // Someone else claimed it
}
```

### Step 3: Process the Job

```javascript
async function processJob(job) {
  let result = {}
  
  switch (job.job_type) {
    case 'content_post':
      result = await generateInstagramPost(job)
      break
    case 'caption_gen':
      result = await generateCaption(job)
      break
    case 'logo':
      result = await generateLogo(job)
      break
    // ... more job types
  }
  
  return result
}

async function generateInstagramPost(job) {
  // Get client profile for brand voice
  const { data: user } = await supabase
    .from('users')
    .select('company_name, bio')
    .eq('id', job.user_id)
    .single()
  
  // Call AI API (OpenAI, Anthropic, etc.)
  const caption = await callAI({
    prompt: `Create Instagram post for ${user.company_name}. 
             Brand voice: ${user.bio}. 
             Topic: ${job.title}. 
             Details: ${job.description}`,
    max_tokens: 300
  })
  
  // Generate image (DALL-E, Midjourney, etc.)
  const imageUrl = await generateImage(job.title)
  
  return {
    caption,
    imageUrl,
    hashtags: extractHashtags(caption)
  }
}
```

### Step 4: Write Results Back

```javascript
async function completeJob(jobId, result) {
  const { data, error } = await supabase
    .from('work_requests')
    .update({
      status: 'completed',
      result_data: result,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)
  
  return data
}
```

---

## 🔄 Complete Worker Loop

```javascript
// worker.js - Main worker loop

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function workerLoop() {
  console.log('🤖 CORTEX Worker started')
  
  while (true) {
    try {
      // 1. Get queued jobs
      const jobs = await pollForJobs()
      
      if (jobs.length === 0) {
        await sleep(5000)  // Wait 5s before polling again
        continue
      }
      
      console.log(`📋 Found ${jobs.length} queued jobs`)
      
      // 2. Process each job
      for (const job of jobs) {
        // 3. Try to claim it
        const claimed = await claimJob(job.id)
        if (!claimed) {
          console.log(`⚠️  Job ${job.id} claimed by another worker`)
          continue
        }
        
        console.log(`✅ Claimed job ${job.id}: ${job.job_type}`)
        
        try {
          // 4. Process the job
          const result = await processJob(claimed)
          
          // 5. Write results
          await completeJob(job.id, result)
          
          console.log(`🎉 Completed job ${job.id}`)
        } catch (err) {
          console.error(`❌ Job ${job.id} failed:`, err)
          
          // Mark as failed
          await supabase
            .from('work_requests')
            .update({
              status: 'failed',
              result_data: { error: err.message }
            })
            .eq('id', job.id)
        }
      }
    } catch (err) {
      console.error('Worker loop error:', err)
      await sleep(10000)  // Back off on error
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Start the worker
workerLoop()
```

---

## 🚀 Deployment Options

### Option 1: Docker Container
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY worker.js ./
CMD ["node", "worker.js"]
```

Deploy to:
- AWS ECS (free tier)
- Google Cloud Run (free tier)
- Fly.io (free tier)
- Railway (free tier)

### Option 2: Serverless Function (Cron)
```javascript
// Vercel/Netlify function that runs every 5 minutes
export default async function handler(req, res) {
  const jobs = await pollForJobs()
  
  for (const job of jobs) {
    await processJob(job)
  }
  
  res.json({ processed: jobs.length })
}
```

### Option 3: Local Worker (Dev)
```bash
node worker.js
```

---

## 📊 Job Types & Processing

| Job Type | Input | Output (result_data) |
|----------|-------|---------------------|
| `content_post` | title, description | caption, imageUrl, hashtags |
| `caption_gen` | description | caption, hashtags, cta |
| `logo` | company_name, bio | logoUrl (PNG/SVG) |
| `landing_page` | company_name, bio | html, css, assets[] |
| `instagram_setup` | company_name | bio, profilePic, handle |
| `brand_voice` | company_name, bio | voiceDoc (markdown) |

**Add new job types:**
1. Add to `getJobTypesForTier()` in `ClientDashboard.jsx`
2. Add case in `processJob()` in worker
3. Update this table

---

## 🔐 Security Best Practices

### ✅ DO:
- Use service_role key ONLY server-side
- Store keys in environment variables
- Validate job ownership (user_id matches)
- Rate limit API calls
- Handle errors gracefully
- Log all worker actions

### ❌ DON'T:
- Expose service_role key in client code
- Commit keys to git
- Process untrusted input without validation
- Ignore job timeouts (prevent stuck jobs)

---

## 🧪 Testing Workers Locally

### 1. Create Test Job
```javascript
// test-create-job.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function createTestJob() {
  const { data, error } = await supabase.auth.signUp({
    email: 'worker-test@apex.ai',
    password: 'test123456'
  })
  
  const userId = data.user.id
  
  await supabase.from('work_requests').insert({
    user_id: userId,
    job_type: 'content_post',
    title: 'Test post',
    description: 'Generate a test Instagram post',
    status: 'queued'
  })
  
  console.log('✅ Test job created')
}

createTestJob()
```

### 2. Run Worker
```bash
SUPABASE_URL=your-url \
SUPABASE_SERVICE_ROLE_KEY=your-key \
node worker.js
```

### 3. Verify Results
Check Supabase → Table Editor → `work_requests`:
- Status should be `completed`
- `result_data` should have output
- `completed_at` should be set

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Run multiple worker instances
- Optimistic locking prevents duplicate work
- Each worker polls independently

### Job Priority
```sql
-- Add priority column
alter table work_requests add column priority text default 'normal';

-- Workers query high-priority first
select * from work_requests 
where status = 'queued'
order by 
  case priority
    when 'urgent' then 1
    when 'high' then 2
    when 'normal' then 3
    when 'low' then 4
  end,
  created_at asc;
```

### Job Timeout
```javascript
// Mark jobs stuck in 'in_progress' for > 10 min as failed
async function cleanupStuckJobs() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  
  await supabase
    .from('work_requests')
    .update({ status: 'failed', result_data: { error: 'Timeout' } })
    .eq('status', 'in_progress')
    .lt('updated_at', tenMinutesAgo.toISOString())
}
```

---

## 🎯 Next Steps

1. **Build a simple worker** (start with `content_post`)
2. **Test locally** with service_role key
3. **Deploy to free tier** (Railway, Fly.io, etc.)
4. **Monitor via Supabase logs**
5. **Add more job types** as needed
6. **Scale horizontally** when traffic increases

---

## 📞 Questions?

- Check `work_requests` table schema in `supabase-client-schema.sql`
- See client flow in `ClientDashboard.jsx`
- Test with Hugo morning checklist in `HUGO_MORNING_CHECKLIST.md`

---

**This is the bridge between client requests and automated fulfillment.**  
**Build the workers, and APEX becomes a true system, not a studio.**
