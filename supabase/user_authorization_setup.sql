-- User Authorization Setup Script
-- Run this script after creating your user accounts to secure the app to only you and your wife

-- ============================================================================
-- STEP 1: Get Your User IDs
-- ============================================================================

-- Run this query to see all users and their IDs
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
ORDER BY created_at;

-- ============================================================================
-- STEP 2: Update Authorization Function
-- ============================================================================

-- After you get your user IDs from the query above, replace the UUIDs below
-- with your actual user IDs and run this updated function:

/*
CREATE OR REPLACE FUNCTION public.is_authorized_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IN (
        'your-user-id-uuid-here'::uuid,
        'your-wife-user-id-uuid-here'::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================================================
-- STEP 3: Verify Authorization
-- ============================================================================

-- Test that the authorization function works
-- This should return true if you're logged in and authorized
SELECT public.is_authorized_user() as am_i_authorized;

-- Get your current user ID
SELECT auth.uid() as my_user_id;

-- ============================================================================
-- STEP 4: Test RLS Policies
-- ============================================================================

-- Try inserting a test trip (should work if you're authorized)
/*
INSERT INTO public.trips (title, destination, description, budget_amount) 
VALUES ('Test Trip', 'Test Destination', 'Testing database access', 100.00);
*/

-- Try viewing trips (should work if you're authorized)
/*
SELECT id, title, destination, created_by FROM public.trips;
*/

-- ============================================================================
-- NOTES
-- ============================================================================

/*
After updating the authorization function:

1. Only you and your wife will be able to access the app data
2. Any other users who try to sign up won't be able to see or edit anything
3. Both authorized users can view and edit everything (full collaboration)
4. If you need to add more users later, just add their UUIDs to the function

For production security, you might also want to:
- Disable public user registration in Supabase Auth settings
- Set up email domain restrictions if needed
- Monitor the auth.users table for unexpected signups
*/