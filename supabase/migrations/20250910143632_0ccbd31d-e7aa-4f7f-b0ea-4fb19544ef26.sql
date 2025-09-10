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

-- Drop the existing public policy to replace it with more secure ones
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a restricted public policy that only allows basic profile information
CREATE POLICY "Public profiles basic info viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  public_profile = true 
  AND (username IS NOT NULL OR display_name IS NOT NULL OR page_title IS NOT NULL OR page_description IS NOT NULL)
  AND (
    -- Only allow these safe columns to be accessed by non-owners
    auth.uid() = user_id OR 
    current_setting('request.jwt.claims', true)::json->>'sub' IS NULL -- Allow unauthenticated users to see basic info
  )
);

-- Create a function to check if user should have access to social media URLs
CREATE OR REPLACE FUNCTION public.can_view_social_links(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = profile_user_id OR 
         (SELECT public_profile FROM public.profiles WHERE user_id = profile_user_id AND public_profile = true);
$$;

-- Add a policy for social media access that requires explicit permission
CREATE POLICY "Social media URLs for profile owners only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id AND
  (bio IS NOT NULL OR youtube_url IS NOT NULL OR twitter_url IS NOT NULL OR 
   linkedin_url IS NOT NULL OR tiktok_url IS NOT NULL OR instagram_url IS NOT NULL OR 
   threads_url IS NOT NULL OR snapchat_url IS NOT NULL)
);

-- Create a view for safe public access
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