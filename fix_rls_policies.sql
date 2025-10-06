-- Fix RLS Policies for Trips App
-- This script removes recursive policies and implements proper access control

-- First, drop all existing policies to start fresh
-- Drop trips table policies
DROP POLICY IF EXISTS "trips_policy" ON trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;
DROP POLICY IF EXISTS "Users can view trips they created" ON trips;
DROP POLICY IF EXISTS "Users can view trips they participate in" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;

-- Drop trip_participants table policies
DROP POLICY IF EXISTS "trip_participants_policy" ON trip_participants;
DROP POLICY IF EXISTS "Users can view trip participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can manage trip participants" ON trip_participants;
DROP POLICY IF EXISTS "Trip creators can add participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can update trip participation" ON trip_participants;
DROP POLICY IF EXISTS "Trip creators can remove participants" ON trip_participants;

-- Drop user_profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Drop itinerary_items table policies
DROP POLICY IF EXISTS "Users can view itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Trip members can manage itinerary items" ON itinerary_items;

-- Drop bookings table policies
DROP POLICY IF EXISTS "Users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Trip members can manage bookings" ON bookings;

-- ENABLE RLS with very simple "allow all authenticated users" policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- TRIPS TABLE POLICIES - Allow all authenticated users to do everything
CREATE POLICY "Allow all trips access" ON trips
    FOR ALL USING (auth.role() = 'authenticated');

-- TRIP_PARTICIPANTS TABLE POLICIES - Allow all authenticated users to do everything
CREATE POLICY "Allow all trip participants access" ON trip_participants
    FOR ALL USING (auth.role() = 'authenticated');

-- USER_PROFILES TABLE POLICIES - Allow all authenticated users to do everything
CREATE POLICY "Allow all user profiles access" ON user_profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- ITINERARY_ITEMS TABLE POLICIES - Allow all authenticated users to do everything
CREATE POLICY "Allow all itinerary items access" ON itinerary_items
    FOR ALL USING (auth.role() = 'authenticated');

-- BOOKINGS TABLE POLICIES - Allow all authenticated users to do everything
CREATE POLICY "Allow all bookings access" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON trips TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trip_participants TO authenticated;
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itinerary_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip_id ON trip_participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_user_id ON trip_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);

-- Refresh the schema cache to ensure policies are applied
NOTIFY pgrst, 'reload schema';