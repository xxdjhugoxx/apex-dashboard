-- ============================================================
-- STRIPE INTEGRATION MIGRATION
-- Run this if you already have the client schema installed
-- ============================================================

-- Add Stripe fields to users table
alter table public.users
add column if not exists stripe_customer_id text unique;

-- Add Stripe fields to user_tiers table
alter table public.user_tiers
add column if not exists stripe_subscription_id text unique,
add column if not exists stripe_price_id text;

-- Note: Existing user_tiers entries will need to be updated
-- with proper Stripe IDs after users complete payment flow
