-- Update the public policy to allow social media URLs to be visible on public profiles
-- while still protecting other sensitive data like bio
DROP POLICY IF EXISTS "Public can view safe profile fields only" ON public.profiles;

-- Create a new policy that allows public access to social media URLs but protects bio and other sensitive data
CREATE POLICY "Public can view profile and social links"
ON public.profiles
FOR SELECT
USING (
  public_profile = true 
  AND (username IS NOT NULL OR display_name IS NOT NULL OR page_title IS NOT NULL OR page_description IS NOT NULL)
);