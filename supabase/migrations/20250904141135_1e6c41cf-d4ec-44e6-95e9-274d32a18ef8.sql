-- Remove the redundant users table that exposes emails
-- First, update any functions that reference the users table

-- Drop the trigger that populates the users table
DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;

-- Drop the function that handles user signup to users table
DROP FUNCTION IF EXISTS public.handle_user_signup();

-- Update the username availability check function to use profiles instead of users
CREATE OR REPLACE FUNCTION public.check_username_availability(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(username) = LOWER(check_username)
  );
$$;

-- Drop the users table entirely to prevent email exposure
DROP TABLE IF EXISTS public.users CASCADE;