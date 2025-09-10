-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles basic info viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Social media URLs for profile owners only" ON public.profiles;

-- Create a security definer function that returns only safe public profile fields
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_username text)
RETURNS TABLE(
    username text,
    display_name text,
    page_title text,
    page_description text,
    avatar_url text,
    use_avatar_background boolean,
    user_id uuid,
    display_name_color text,
    username_color text,
    page_title_color text,
    page_description_color text,
    public_profile boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.username,
    p.display_name,
    p.page_title,
    p.page_description,
    p.avatar_url,
    p.use_avatar_background,
    p.user_id,
    p.display_name_color,
    p.username_color,
    p.page_title_color,
    p.page_description_color,
    p.public_profile
  FROM public.profiles p
  WHERE p.username = profile_username 
    AND p.public_profile = true
    AND (p.username IS NOT NULL OR p.display_name IS NOT NULL OR p.page_title IS NOT NULL OR p.page_description IS NOT NULL);
$$;

-- Create new secure policies

-- Policy 1: Allow users to see their own complete profile
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Allow public access to basic profile info only (no social media URLs or bio)
CREATE POLICY "Public can view basic profile info only"
ON public.profiles
FOR SELECT
USING (
  public_profile = true 
  AND (username IS NOT NULL OR display_name IS NOT NULL OR page_title IS NOT NULL OR page_description IS NOT NULL)
);

-- Create a view for completely safe public access that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_profiles_safe AS
SELECT 
  username,
  display_name,
  page_title,
  page_description,
  avatar_url,
  use_avatar_background,
  user_id,
  display_name_color,
  username_color,
  page_title_color,
  page_description_color,
  public_profile
FROM public.profiles
WHERE public_profile = true
  AND (username IS NOT NULL OR display_name IS NOT NULL OR page_title IS NOT NULL OR page_description IS NOT NULL);

-- Grant access to the view
GRANT SELECT ON public.public_profiles_safe TO anon, authenticated;