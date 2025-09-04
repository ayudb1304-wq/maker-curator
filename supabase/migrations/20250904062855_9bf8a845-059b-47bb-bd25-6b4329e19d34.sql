-- Update the profile creation trigger to use the new metadata fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name,
    bio
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.raw_user_meta_data->>'occupation' IS NOT NULL AND NEW.raw_user_meta_data->>'gender' IS NOT NULL 
      THEN CONCAT(NEW.raw_user_meta_data->>'occupation', ' • ', NEW.raw_user_meta_data->>'gender')
      WHEN NEW.raw_user_meta_data->>'occupation' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'occupation'
      WHEN NEW.raw_user_meta_data->>'gender' IS NOT NULL 
      THEN NEW.raw_user_meta_data->>'gender'
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;