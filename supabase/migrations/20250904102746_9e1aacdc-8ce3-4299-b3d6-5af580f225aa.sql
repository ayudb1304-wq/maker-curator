-- Maximum security lockdown for users table
-- Apply the most restrictive policies possible

-- First, disable RLS temporarily to clear all policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can only access their own record" ON public.users;
DROP POLICY IF EXISTS "Block all public access" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own user record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own user record" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create the most restrictive policy set possible
-- Only allow users to manage their own records, period.

CREATE POLICY "strict_user_select" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "strict_user_insert" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "strict_user_update" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny ALL access to anonymous/public users
CREATE POLICY "deny_anonymous_access" 
ON public.users 
FOR ALL 
TO anon
USING (false);

-- Explicitly deny DELETE operations for all users for data integrity
CREATE POLICY "deny_all_deletes" 
ON public.users 
FOR DELETE 
USING (false);

-- Add an additional layer: revoke all public permissions on the table
REVOKE ALL ON public.users FROM public;
REVOKE ALL ON public.users FROM anon;

-- Only grant specific permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;