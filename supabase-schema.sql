-- ============================================================
-- APEX AI COMPANY — Agent Status & Activity Schema
-- ============================================================

-- Agent Status
create table if not exists public.agent_status (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null unique,
  agent_name text not null,
  agent_emoji text not null,
  department text not null,
  status text not null default 'idle',
  current_task text,
  last_activity timestamptz default now(),
  created_at timestamptz default now()
);

-- Agent Activity Log
create table if not exists public.agent_activity (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  action text not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- Agent Tasks
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  task text not null,
  status text not null default 'pending',
  priority text default 'normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sales Leads
create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text,
  source text,
  interest_level text default 'cold',
  stage text default 'new',
  deal_value numeric default 0,
  notes text,
  assigned_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Content Calendar
create table if not exists public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  content_type text not null,
  caption text,
  scheduled_for timestamptz,
  posted_at timestamptz,
  status text default 'draft',
  metrics jsonb default '{}',
  created_at timestamptz default now()
);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_name text not null,
  amount numeric not null,
  status text default 'sent',
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.agent_status enable row level security;
alter table public.agent_activity enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.sales_leads enable row level security;
alter table public.content_calendar enable row level security;
alter table public.invoices enable row level security;

create policy "Anyone can view agent status" on public.agent_status for select using (true);
create policy "Anyone can view agent activity" on public.agent_activity for select using (true);
create policy "Auth users manage agent tasks" on public.agent_tasks for all using (true);
create policy "Auth users manage sales leads" on public.sales_leads for all using (true);
create policy "Auth users manage content calendar" on public.content_calendar for all using (true);
create policy "Auth users manage invoices" on public.invoices for all using (true);

-- Seed agent status
insert into public.agent_status (agent_id, agent_name, agent_emoji, department, status) values
  ('ceo', 'Leo', 'Lion', 'Leadership', 'idle'),
  ('sales', 'Felix', 'Fox', 'Sales', 'idle'),
  ('marketing', 'Phoenix', 'Peacock', 'Marketing', 'idle'),
  ('ops', 'Axel', 'Badger', 'Operations', 'idle'),
  ('finance', 'Bruno', 'Bear', 'Finance', 'idle')
on conflict (agent_id) do nothing;
