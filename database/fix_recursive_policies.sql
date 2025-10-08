-- Clean slate: Remove ALL existing policies and create simple non-recursive ones

-- Drop all existing policies by exact name
DROP POLICY IF EXISTS "Allow all bookings access" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings for their trips" ON bookings;
DROP POLICY IF EXISTS "Users can delete their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can manage bookings for own trips" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view bookings for own trips" ON bookings;
DROP POLICY IF EXISTS "Users can view bookings for their trips" ON bookings;

DROP POLICY IF EXISTS "Allow all itinerary items access" ON itinerary_items;
DROP POLICY IF EXISTS "Users can create itinerary items for their trips" ON itinerary_items;
DROP POLICY IF EXISTS "Users can delete their itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can manage itinerary for own trips" ON itinerary_items;
DROP POLICY IF EXISTS "Users can update their itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can view itinerary for own trips" ON itinerary_items;
DROP POLICY IF EXISTS "Users can view itinerary items for their trips" ON itinerary_items;

DROP POLICY IF EXISTS "Allow all trip participants access" ON trip_participants;
DROP POLICY IF EXISTS "Allow participant insertion" ON trip_participants;
DROP POLICY IF EXISTS "Trip owners can add participants" ON trip_participants;
DROP POLICY IF EXISTS "Trip owners can remove participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can delete own participation" ON trip_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON trip_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON trip_participants;
DROP POLICY IF EXISTS "Users can view own participation" ON trip_participants;
DROP POLICY IF EXISTS "Users can view participants for their trips" ON trip_participants;

DROP POLICY IF EXISTS "Allow all trips access" ON trips;
DROP POLICY IF EXISTS "Trip creators can delete trips" ON trips;
DROP POLICY IF EXISTS "Trip creators can update trips" ON trips;
DROP POLICY IF EXISTS "Users can view trips they own or participate in" ON trips;

DROP POLICY IF EXISTS "Allow all user profiles access" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can create weather cache for their trips" ON weather_cache;
DROP POLICY IF EXISTS "Users can view weather cache for their trips" ON weather_cache;

-- Create simple, non-recursive policies

-- TRIPS: Simple ownership-based access
CREATE POLICY "trips_simple_access" ON trips
    FOR ALL USING (auth.role() = 'authenticated');

-- TRIP_PARTICIPANTS: Simple user-based access  
CREATE POLICY "participants_simple_access" ON trip_participants
    FOR ALL USING (auth.role() = 'authenticated');

-- USER_PROFILES: Open access for authenticated users
CREATE POLICY "profiles_simple_access" ON user_profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- ITINERARY_ITEMS: Simple access
CREATE POLICY "itinerary_simple_access" ON itinerary_items
    FOR ALL USING (auth.role() = 'authenticated');

-- BOOKINGS: Simple access
CREATE POLICY "bookings_simple_access" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- WEATHER_CACHE: Simple access (if table exists)
CREATE POLICY "weather_simple_access" ON weather_cache
    FOR ALL USING (auth.role() = 'authenticated');

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';