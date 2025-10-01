-- Add onboarding flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE;