-- Add username_changed_at field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username_changed_at TIMESTAMP WITH TIME ZONE;

-- Set initial value for existing users to allow immediate first change
UPDATE public.profiles 
SET username_changed_at = '2000-01-01 00:00:00+00'::timestamptz 
WHERE username_changed_at IS NULL;

-- Create function to check if username change is allowed (30 days cooldown)
CREATE OR REPLACE FUNCTION public.can_change_username(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT username_changed_at < NOW() - INTERVAL '30 days'
     FROM public.profiles 
     WHERE user_id = user_id_param),
    true
  );
$$;

-- Create function to update username with validation
CREATE OR REPLACE FUNCTION public.update_username(
  user_id_param UUID,
  new_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_change BOOLEAN;
  username_exists BOOLEAN;
  days_remaining INTEGER;
  result JSONB;
BEGIN
  -- Check if user can change username (30 day cooldown)
  SELECT public.can_change_username(user_id_param) INTO can_change;
  
  IF NOT can_change THEN
    -- Calculate days remaining
    SELECT CEIL(EXTRACT(EPOCH FROM (
      (SELECT username_changed_at FROM public.profiles WHERE user_id = user_id_param) 
      + INTERVAL '30 days' - NOW()
    )) / 86400) INTO days_remaining;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'username_cooldown',
      'message', format('You can change your username again in %s days', days_remaining),
      'days_remaining', days_remaining
    );
  END IF;
  
  -- Check if username already exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE LOWER(username) = LOWER(new_username) 
    AND user_id != user_id_param
  ) INTO username_exists;
  
  IF username_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'username_taken',
      'message', 'This username is already taken'
    );
  END IF;
  
  -- Update username and timestamp
  UPDATE public.profiles 
  SET 
    username = LOWER(TRIM(new_username)),
    username_changed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_id_param;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Username updated successfully'
  );
END;
$$;