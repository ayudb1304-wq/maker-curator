-- Delete users from auth.users table using the admin API
-- This will clean up test users so they can re-register

-- First, let's see if we can find the user IDs
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Note: We can't directly query auth.users from a migration
    -- Instead, we'll document the user IDs found in the logs:
    -- ayushbhiogade14@gmail.com: actor_id "ba6fc7a9-b912-4a46-87d1-5d2a471e4eb7"
    -- We'll need to use the Supabase dashboard to delete these users manually

    RAISE NOTICE 'Migration completed. Please delete users manually from Supabase dashboard:';
    RAISE NOTICE 'User ID: ba6fc7a9-b912-4a46-87d1-5d2a471e4eb7 (ayushbhiogade14@gmail.com)';
    RAISE NOTICE 'Check auth logs for oyush21 user ID if it exists';
END $$;