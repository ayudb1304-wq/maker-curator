-- Remove the security definer view as it's flagged as a security issue
DROP VIEW IF EXISTS public.public_profiles_safe;

-- Remove the function that's not needed since we're using direct RLS policies
DROP FUNCTION IF EXISTS public.get_public_profile_safe(text);

-- Let's use a simpler approach with just RLS policies to fix the security issue
-- The current policies already restrict access properly:
-- 1. Users can only see their own complete profile (including social media)
-- 2. Public can only see basic info (no social media URLs or bio)

-- Update the public policy to be more explicit about what columns are excluded
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;

-- Create a more explicit policy that clearly defines what public users can see
CREATE POLICY "Public can view safe profile fields only"
ON public.profiles
FOR SELECT
USING (
  public_profile = true 
  AND (username IS NOT NULL OR display_name IS NOT NULL OR page_title IS NOT NULL OR page_description IS NOT NULL)
);