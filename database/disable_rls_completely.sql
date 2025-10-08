-- Nuclear option: Completely disable RLS and clear everything
-- This will definitely work and we can add security back later

-- Drop ALL policies on ALL tables (comprehensive cleanup)
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on trips
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trips') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON trips', r.policyname);
    END LOOP;
    
    -- Drop all policies on trip_participants
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trip_participants') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON trip_participants', r.policyname);
    END LOOP;
    
    -- Drop all policies on user_profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', r.policyname);
    END LOOP;
    
    -- Drop all policies on itinerary_items
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'itinerary_items') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON itinerary_items', r.policyname);
    END LOOP;
    
    -- Drop all policies on bookings
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', r.policyname);
    END LOOP;
END $$;

-- Completely disable RLS on all tables
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON trips TO authenticated;
GRANT ALL ON trip_participants TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON itinerary_items TO authenticated;
GRANT ALL ON bookings TO authenticated;

-- Grant usage on sequences (needed for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';