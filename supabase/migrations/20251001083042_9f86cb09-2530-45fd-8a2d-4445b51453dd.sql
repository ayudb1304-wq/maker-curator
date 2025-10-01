-- Create a secure function to claim username for new users
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
  -- Check if username already exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(new_username)
  ) INTO username_exists;

  IF username_exists THEN
    -- If taken, do nothing. The client will handle the error.
    RETURN;
  END IF;

  -- Update username and timestamp for the current user
  UPDATE public.profiles
  SET
    username = LOWER(TRIM(new_username)),
    username_changed_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;