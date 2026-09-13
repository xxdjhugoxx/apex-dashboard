-- ============================================================
-- STRIPE INTEGRATION SCHEMA UPDATES
-- ============================================================
-- Run this migration to add Stripe fields to user_tiers table

-- Add Stripe-related columns to user_tiers if they don't exist
ALTER TABLE public.user_tiers 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS billing_interval text CHECK (billing_interval IN ('monthly', 'annual', 'one_time')),
ADD COLUMN IF NOT EXISTS past_due_at timestamptz;

-- Update status column to include past_due
ALTER TABLE public.user_tiers 
DROP CONSTRAINT IF EXISTS user_tiers_status_check;

ALTER TABLE public.user_tiers 
ADD CONSTRAINT user_tiers_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'trialing', 'past_due'));

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_tiers_stripe_customer 
ON public.user_tiers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_tiers_stripe_subscription 
ON public.user_tiers(stripe_subscription_id);

-- Add helpful comments
COMMENT ON COLUMN public.user_tiers.stripe_customer_id IS 'Stripe customer ID for this user';
COMMENT ON COLUMN public.user_tiers.stripe_subscription_id IS 'Stripe subscription ID (null for one-time payments like Builder)';
COMMENT ON COLUMN public.user_tiers.billing_interval IS 'Billing cycle: monthly, annual, or one_time (for Builder)';
COMMENT ON COLUMN public.user_tiers.past_due_at IS 'Timestamp when subscription became past due';

-- Add unique constraint to prevent duplicate active subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tiers_active_user 
ON public.user_tiers(user_id) 
WHERE status = 'active';

COMMENT ON INDEX idx_user_tiers_active_user IS 'Ensures a user can only have one active subscription at a time';
