-- ============================================================
-- APEX ADMIN REFUND MIGRATION
-- Add admin_notes column to user_tiers for tracking refunds
-- ============================================================

-- Add admin_notes column to user_tiers table
ALTER TABLE public.user_tiers 
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add comment to the column
COMMENT ON COLUMN public.user_tiers.admin_notes IS 'Admin notes for tracking refunds, cancellations, and other admin actions';
