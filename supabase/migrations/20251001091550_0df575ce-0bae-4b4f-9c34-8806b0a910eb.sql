-- Add onboarding flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE;

-- Set public_profile default to true for new accounts
ALTER TABLE public.profiles
ALTER COLUMN public_profile SET DEFAULT true;

-- Create secure function for claiming usernames during onboarding
CREATE OR REPLACE FUNCTION public.claim_username(
  new_username TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_exists BOOLEAN;
  user_id_param UUID := auth.uid();
BEGIN
  -- Only allow this action if the user has not completed onboarding
  IF (SELECT has_completed_onboarding FROM public.profiles WHERE user_id = user_id_param) THEN
    RETURN;
  END IF;

  -- Check if username already exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(new_username)
  ) INTO username_exists;

  IF username_exists THEN
    -- If the username is taken, do nothing. Client will handle this.
    RETURN;
  END IF;

  -- If username is available, update the profile
  UPDATE public.profiles
  SET
    username = LOWER(TRIM(new_username)),
    username_changed_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;