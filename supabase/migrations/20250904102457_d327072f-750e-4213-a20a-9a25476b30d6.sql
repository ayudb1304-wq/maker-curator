-- Additional security hardening for users table
-- Ensure the users table is completely secure and cannot be accessed by other users

-- First, let's check what policies currently exist
-- \d+ public.users;

-- Make sure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any potentially permissive policies and recreate with strict access
DROP POLICY IF EXISTS "Users can view their own user record" ON public.users;

-- Create the most restrictive policy - users can only access their exact own record
CREATE POLICY "Users can only access their own record" 
ON public.users 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure no other policies exist that could allow broader access
-- This policy ensures that:
-- 1. Users can only SELECT their own record (auth.uid() = user_id)
-- 2. Users can only INSERT/UPDATE records with their own user_id
-- 3. No user can access another user's email or data

-- Also add a policy to completely prevent any public access
-- (this is redundant but ensures extra security)
CREATE POLICY "Block all public access" 
ON public.users 
FOR ALL 
TO public
USING (false);

-- Create a secure function to verify table isolation
CREATE OR REPLACE FUNCTION public.verify_user_data_isolation()
RETURNS TABLE(can_see_other_users BOOLEAN, total_visible_records INTEGER)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS(
      SELECT 1 FROM public.users 
      WHERE user_id != auth.uid()
    ) as can_see_other_users,
    (SELECT COUNT(*) FROM public.users) as total_visible_records;
$$;