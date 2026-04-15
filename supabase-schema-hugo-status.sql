-- Hugo's presence tracking for APEX office UI
-- Tracks whether Hugo is "in_office" (web UI open) or "away" (Telegram/on the go)

create table if not exists public.hugo_status (
  id          text primary key default 'hugo',
  status      text not null check (status in ('in_office', 'away')),
  updated_at  timestamptz default now()
);

-- Default to away
insert into public.hugo_status (id, status) values ('hugo', 'away')
on conflict (id) do nothing;

-- Anyone can read hugo_status (agents need to know)
create policy "Anyone can read hugo_status"
  on public.hugo_status for select using (true);

-- Only authenticated users can update (web UI)
create policy "Authenticated users can update hugo_status"
  on public.hugo_status for update using (true);

-- Enable realtime
alter publication supabase_realtime add table public.hugo_status;
