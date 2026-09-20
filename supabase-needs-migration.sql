-- ============================================================
-- APEX NEEDS INTAKE MIGRATION
-- Adds needs tracking to users table for plan recommendations
-- ============================================================

-- Add needs_json column to users table to store intake responses
alter table public.users 
  add column if not exists needs_json jsonb default '{}';

-- Add index for faster queries on needs data
create index if not exists idx_users_needs_json 
  on public.users using gin (needs_json);

-- Update comment
comment on column public.users.needs_json is 
  'Stores user needs intake responses: freeText (string) and goals (array of strings). Used for plan recommendations.';
