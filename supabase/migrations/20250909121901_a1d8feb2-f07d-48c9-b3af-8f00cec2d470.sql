-- Add use_avatar_background column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN use_avatar_background boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.use_avatar_background IS 'When true, the user profile picture will be used as background hero section on public page';