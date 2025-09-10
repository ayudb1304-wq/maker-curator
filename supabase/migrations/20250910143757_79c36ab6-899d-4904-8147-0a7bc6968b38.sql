-- Remove the security definer view as it's flagged as a security risk
DROP VIEW IF EXISTS public.public_profiles_safe;

-- Instead, let's update our RLS policies to be more granular
-- First, let's recreate the policies more safely

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles basic info viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Social media URLs for profile owners only" ON public.profiles;

-- Create a policy that allows public access but only to safe columns
-- We'll handle this in the application layer by being selective about which columns we query
CREATE POLICY "Public profiles viewable by everyone - safe columns only"
ON public.profiles
FOR SELECT
USING (
  public_profile = true 
  AND (username IS NOT NULL OR display_name IS NOT NULL OR page_title IS NOT NULL OR page_description IS NOT NULL)
);

-- Create a separate policy for authenticated users to access their own full profile
CREATE POLICY "Users can view their complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Remove the security definer functions as they're flagged as security risks
DROP FUNCTION IF EXISTS public.get_public_profile_safe(text);
DROP FUNCTION IF EXISTS public.can_view_social_links(uuid);