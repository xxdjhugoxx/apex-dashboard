-- ============================================================
-- APEX AI COMPANY — Agent Status & Activity Schema
-- ============================================================

-- Agent Status (current state of each agent)
create table if not exists public.agent_status (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null unique,
  agent_name text not null,
  agent_emoji text not null,
  department text not null,
  status text not null default 'idle', -- idle, working, waiting_approval
  current_task text,
  last_activity timestamptz default now(),
  created_at timestamptz default now()
);

-- Agent Activity Log (what each agent did)
create table if not exists public.agent_activity (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  action text not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- Agent Tasks (tasks assigned to each agent)
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  task text not null,
  status text not null default 'pending', -- pending, in_progress, done, blocked
  priority text default 'normal', -- low, normal, high, urgent
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sales Leads (Felix tracks these)
create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text,
  source text,
  interest_level text default 'cold', -- cold, warm, hot, qualified
  stage text default 'new', -- new, contacted, proposal, negotiation, closed_won, closed_lost
  deal_value numeric default 0,
  notes text,
  assigned_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Content Calendar (Phoenix's posts)
create table if not exists public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- instagram, tiktok, twitter, facebook
  content_type text not null, -- post, story, reel, video
  caption text,
  scheduled_for timestamptz,
  posted_at timestamptz,
  status text default 'draft', -- draft, scheduled, posted, failed
  metrics jsonb default '{}', -- likes, comments, shares, reach
  created_at timestamptz default now()
);

-- Invoices (Bruno tracks these)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_name text not null,
  amount numeric not null,
  status text default 'sent', -- draft, sent, viewed, paid, overdue
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.agent_status enable row level security;
alter table public.agent_activity enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.sales_leads enable row level security;
alter table public.content_calendar enable row level security;
alter table public.invoices enable row level security;

-- Anyone can read agent status (for dashboard)
create policy "Anyone can view agent status" on public.agent_status for select using (true);
create policy "Anyone can view agent activity" on public.agent_activity for select using (true);

-- Authenticated users can manage their own records
create policy "Auth users manage agent tasks" on public.agent_tasks for all using (true);
create policy "Auth users manage sales leads" on public.sales_leads for all using (true);
create policy "Auth users manage content calendar" on public.content_calendar for all using (true);
create policy "Auth users manage invoices" on public.invoices for all using (true);

-- ============================================================
-- SEED: Initial Agent Status
-- ============================================================

insert into public.agent_status (agent_id, agent_name, agent_emoji, department, status) values
  ('ceo', 'Leo', '🦁', 'Leadership', 'idle'),
  ('sales', 'Felix', '🦊', 'Sales', 'idle'),
  ('marketing', 'Phoenix', '🦚', 'Marketing', 'idle'),
  ('ops', 'Axel', '🦡', 'Operations', 'idle'),
  ('finance', 'Bruno', '🐻', 'Finance', 'idle')
on conflict (agent_id) do nothing;
