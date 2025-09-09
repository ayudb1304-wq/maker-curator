-- Add social media URL columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN youtube_url text,
ADD COLUMN twitter_url text,
ADD COLUMN linkedin_url text,
ADD COLUMN tiktok_url text,
ADD COLUMN instagram_url text,
ADD COLUMN threads_url text,
ADD COLUMN snapchat_url text;