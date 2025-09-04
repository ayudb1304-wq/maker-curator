-- Fix security issue: Remove public access to users table that exposes email addresses
-- and update RLS policies to be more secure

-- Drop the existing policy that allows public access to all user data
DROP POLICY IF EXISTS "Users can view all usernames for availability check" ON public.users;

-- Create a more secure policy that only allows users to view their own data
CREATE POLICY "Users can view their own user record" 
ON public.users 
FOR SELECT 
USING (auth.uid() = user_id);

-- The username availability check will be handled by the existing edge function
-- which has access to query the database securely without exposing data to clients

-- Also create a function specifically for username checks that doesn't expose email data
CREATE OR REPLACE FUNCTION public.check_username_availability(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE LOWER(username) = LOWER(check_username)
  );
$$;

-- Also check profiles table for username availability since usernames are stored there too
CREATE OR REPLACE FUNCTION public.is_username_available(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(username) = LOWER(check_username)
  );
$$;