-- ============================================================
-- APEX HQ — User Tiers & Work Requests Schema
-- ============================================================

-- User Tiers (links users to subscription plans)
-- Synced from apexhq.cloud pricing section (live site source of truth)
create table if not exists public.user_tiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- references auth.users(id) when auth is implemented
  tier_id text not null check (tier_id in ('builder', 'starter', 'focus', 'growth', 'pro', 'agency')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'trialing')),
  started_at timestamptz default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  stripe_subscription_id text, -- for future Stripe integration
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Work Requests (job queue for AI agents)
create table if not exists public.work_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- references auth.users(id) when auth is implemented
  job_type text not null check (job_type in ('logo', 'post_image', 'caption', 'dm_reply', 'ad_creative')),
  status text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  
  -- Input data (varies by job type)
  input_data jsonb not null default '{}',
  
  -- Output data (AI-generated results)
  output_data jsonb default '{}',
  
  -- Agent assignment
  assigned_agent_id text, -- references agent_status(agent_id)
  assigned_at timestamptz,
  
  -- Metadata
  error_message text,
  retry_count integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_user_tiers_user_id on public.user_tiers(user_id);
create index if not exists idx_user_tiers_tier_id on public.user_tiers(tier_id);
create index if not exists idx_user_tiers_status on public.user_tiers(status);

create index if not exists idx_work_requests_user_id on public.work_requests(user_id);
create index if not exists idx_work_requests_job_type on public.work_requests(job_type);
create index if not exists idx_work_requests_status on public.work_requests(status);
create index if not exists idx_work_requests_assigned_agent on public.work_requests(assigned_agent_id);
create index if not exists idx_work_requests_created_at on public.work_requests(created_at desc);

-- Row Level Security
alter table public.user_tiers enable row level security;
alter table public.work_requests enable row level security;

-- Policies (wide-open for now; tighten when auth is implemented)
create policy "Anyone can view user tiers" on public.user_tiers for select using (true);
create policy "Auth users manage user tiers" on public.user_tiers for all using (true);

create policy "Anyone can view work requests" on public.work_requests for select using (true);
create policy "Auth users manage work requests" on public.work_requests for all using (true);

-- Seed data (example work requests for demo)
insert into public.work_requests (user_id, job_type, status, input_data, priority) values
  (gen_random_uuid(), 'logo', 'pending', '{"brand_name": "TechFlow", "style": "modern minimalist", "colors": ["#3B82F6", "#1E293B"]}', 'high'),
  (gen_random_uuid(), 'caption', 'in_progress', '{"platform": "instagram", "topic": "AI productivity", "tone": "professional"}', 'normal'),
  (gen_random_uuid(), 'ad_creative', 'pending', '{"product": "Fitness App", "target_audience": "millennials", "goal": "app installs"}', 'urgent')
on conflict do nothing;

-- Comments for documentation
comment on table public.user_tiers is 'Subscription tiers for users (Builder, Starter, Focus, Growth, Pro, Agency) — synced from apexhq.cloud';
comment on table public.work_requests is 'Job queue for AI agent work requests (logo, post_image, caption, dm_reply, ad_creative)';

comment on column public.work_requests.input_data is 'Job-specific input parameters as JSON (e.g., brand_name, style, colors for logo)';
comment on column public.work_requests.output_data is 'AI-generated results as JSON (e.g., image_url, caption_text, variations)';
