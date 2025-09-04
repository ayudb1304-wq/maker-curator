-- Add privacy control to profiles table
ALTER TABLE public.profiles 
ADD COLUMN public_profile boolean NOT NULL DEFAULT false;

-- Update profiles RLS policies to be more secure
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Only allow viewing minimal public profile data for users who opted in
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  public_profile = true AND (
    username IS NOT NULL OR 
    display_name IS NOT NULL OR 
    page_title IS NOT NULL OR 
    page_description IS NOT NULL
  )
);

-- Allow users to view their own full profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update recommendations RLS policies to only show from public profiles
DROP POLICY IF EXISTS "Users can view all recommendations" ON public.recommendations;

CREATE POLICY "Public recommendations are viewable by everyone" 
ON public.recommendations 
FOR SELECT 
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = recommendations.user_id 
    AND profiles.public_profile = true
  )
);

-- Allow users to view their own recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update categories RLS policies to only show from public profiles
DROP POLICY IF EXISTS "Users can view all categories" ON public.categories;

CREATE POLICY "Public categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = categories.user_id 
    AND profiles.public_profile = true
  )
);

-- Allow users to view their own categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);