-- Complete Database Setup Script for Trip Planner App
-- This script runs all migrations and sets up the complete database

-- ============================================================================
-- SETUP INSTRUCTIONS
-- ============================================================================

/*
To set up your Supabase database:

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run this script (setup.sql) in the SQL Editor
4. After you and your wife create accounts, update the user authorization
5. Optionally run the sample data script for testing

Post-Setup Steps:
1. Get your user IDs:
   SELECT id, email FROM auth.users;

2. Update the authorization function with your actual user IDs:
   CREATE OR REPLACE FUNCTION auth.is_authorized_user()
   RETURNS BOOLEAN AS $$
   BEGIN
       RETURN auth.uid() IN (
           'your-user-id-uuid-here'::uuid,
           'your-wife-user-id-uuid-here'::uuid
       );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

3. Update your .env file with Supabase credentials:
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
*/

-- ============================================================================
-- RUN MIGRATIONS
-- ============================================================================

-- Migration 001: Initial Schema
\i migrations/001_initial_schema.sql

-- Migration 002: RLS Policies
\i migrations/002_rls_policies.sql

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Trip Planner database setup complete!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create user accounts for you and your wife';
    RAISE NOTICE '2. Update the auth.is_authorized_user() function with your user IDs';
    RAISE NOTICE '3. Run sample_data.sql for test data (optional)';
    RAISE NOTICE '4. Update your .env file with Supabase credentials';
END $$;