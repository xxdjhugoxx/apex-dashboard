-- ============================================================
-- APEX CLIENT SCHEMA — Users, Tiers, Work Requests
-- ============================================================

-- Users (extends Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  company_name text,
  logo_url text,
  bio text,
  tier_id text default 'starter',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User Tiers (subscription tier data)
create table if not exists public.user_tiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tier_name text not null,
  monthly_price numeric not null,
  is_annual boolean default false,
  status text default 'active',
  started_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Work Requests (client job queue)
create table if not exists public.work_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  job_type text not null,
  title text not null,
  description text,
  status text default 'queued',
  priority text default 'normal',
  result_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.user_tiers enable row level security;
alter table public.work_requests enable row level security;

-- Policies: Users can only see their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can view own tiers" on public.user_tiers
  for select using (auth.uid() = user_id);

create policy "Users can view own work requests" on public.work_requests
  for select using (auth.uid() = user_id);

create policy "Users can create own work requests" on public.work_requests
  for insert with check (auth.uid() = user_id);

create policy "Users can update own work requests" on public.work_requests
  for update using (auth.uid() = user_id);

-- ============================================================
-- WORKER POLICIES — Allow service role to manage work queue
-- ============================================================
-- These policies allow CORTEX workers (using service_role key) to:
-- 1. Read queued work requests across all users
-- 2. Update status (queued → in_progress → completed)
-- 3. Write results back to result_data

-- Service role can read all work requests
create policy "Service role can read all work requests" on public.work_requests
  for select using (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Service role can update work requests (status, result_data)
create policy "Service role can update work requests" on public.work_requests
  for update using (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Function: Create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: Auto-create user profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Job Types by Tier
-- Builder: 'logo', 'landing_page', 'instagram_setup', 'brand_voice'
-- Starter: 'content_post', 'caption_gen', 'basic_report'
-- Focus: all Starter + 'department_audit', 'workflow_build', 'brand_training'
-- Growth: all Focus + 'lead_scoring', 'competitor_report', 'multi_channel'
-- Pro: all Growth + 'custom_voice_training', 'strategy_call', 'full_report'
-- Agency: all Pro + 'white_label', 'api_access', 'dedicated_support'
