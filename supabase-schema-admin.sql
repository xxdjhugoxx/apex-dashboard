-- ============================================================
-- ADMIN PANEL SCHEMA
-- ============================================================
-- Add admin capabilities to APEX HQ

-- Add is_admin column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin 
ON public.users(is_admin) 
WHERE is_admin = true;

-- Seed owner@apexhq.cloud as admin
-- This will be inserted/updated when the user exists
-- Hugo should run this after creating the owner account
-- UPDATE public.users SET is_admin = true WHERE email = 'owner@apexhq.cloud';

-- Add admin metadata to user_tiers for tracking admin-granted access
ALTER TABLE public.user_tiers 
ADD COLUMN IF NOT EXISTS admin_granted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes text;

COMMENT ON COLUMN public.users.is_admin IS 'True if user has admin access to manage all clients';
COMMENT ON COLUMN public.user_tiers.admin_granted IS 'True if tier was granted by admin without payment (comp access)';
COMMENT ON COLUMN public.user_tiers.admin_notes IS 'Admin notes about this subscription (e.g., why it was comped)';
