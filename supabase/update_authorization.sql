-- Update Authorization Function with Kevin's User ID
-- Run this script in your Supabase SQL Editor to secure the app to only authorized users

CREATE OR REPLACE FUNCTION public.is_authorized_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Restrict access to only authorized users (you and your wife)
    RETURN auth.uid() IN (
        '0bb03f82-65b5-42f2-8732-191f454aa59c'::uuid  -- kevin.m.mazur@gmail.com
        -- Add your wife's user ID here when she creates her account:
        -- ,'your-wife-user-id-uuid-here'::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: auth.uid() will be null in SQL Editor since you're not authenticated there
-- This is normal - the function will work properly when called from your app

-- Test that the function exists
SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_authorized_user' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
) as function_exists;

-- Verify your user exists in the auth table
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '0bb03f82-65b5-42f2-8732-191f454aa59c';