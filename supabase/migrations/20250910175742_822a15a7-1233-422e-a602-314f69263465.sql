-- Set use_avatar_background to true by default for new users
ALTER TABLE public.profiles 
ALTER COLUMN use_avatar_background SET DEFAULT true;

-- Update all existing users to have use_avatar_background = true
UPDATE public.profiles 
SET use_avatar_background = true 
WHERE use_avatar_background = false;