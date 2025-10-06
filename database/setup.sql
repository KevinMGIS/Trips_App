-- =============================================================================
-- TRIPS APP DATABASE SETUP
-- =============================================================================
-- Run this script in your Supabase SQL Editor to set up all tables and RLS policies
-- for the trip planning application.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TRIPS TABLE
-- =============================================================================

-- Main trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_total DECIMAL(10, 2),
  budget_spent DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'booked', 'in_progress', 'completed', 'cancelled')),
  cover_image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_budget CHECK (budget_total >= 0 AND budget_spent >= 0)
);

-- Enable RLS on trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TRIP PARTICIPANTS TABLE
-- =============================================================================

-- Junction table for trip participants (sharing trips with partners/friends)
CREATE TABLE IF NOT EXISTS trip_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('owner', 'editor', 'viewer', 'participant')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  
  -- Ensure unique participant per trip
  UNIQUE(trip_id, user_id)
);

-- Enable RLS on trip_participants
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ITINERARY ITEMS TABLE
-- =============================================================================

-- Itinerary items (activities, events, reservations)
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'activity' CHECK (category IN ('flight', 'accommodation', 'activity', 'restaurant', 'transport', 'other')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  cost DECIMAL(10, 2),
  confirmation_number TEXT,
  notes TEXT,
  booking_url TEXT,
  contact_info JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_datetime CHECK (end_datetime IS NULL OR end_datetime >= start_datetime),
  CONSTRAINT valid_cost CHECK (cost IS NULL OR cost >= 0)
);

-- Enable RLS on itinerary_items
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- BOOKINGS TABLE
-- =============================================================================

-- Bookings table for tracking reservations and confirmations
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  itinerary_item_id UUID REFERENCES itinerary_items(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'car_rental', 'restaurant', 'activity', 'other')),
  provider TEXT NOT NULL, -- airline, hotel chain, etc.
  confirmation_number TEXT NOT NULL,
  booking_reference TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_cost DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  checkin_date DATE,
  checkout_date DATE,
  passenger_details JSONB, -- names, seat numbers, etc.
  booking_details JSONB, -- additional booking info
  cancellation_policy TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_cost CHECK (total_cost >= 0),
  CONSTRAINT valid_dates CHECK (checkout_date IS NULL OR checkin_date IS NULL OR checkout_date >= checkin_date)
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- WEATHER CACHE TABLE
-- =============================================================================

-- Weather cache to store API responses and reduce external calls
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  date DATE NOT NULL,
  weather_data JSONB NOT NULL, -- Store the full weather API response
  api_provider TEXT DEFAULT 'openweather',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '6 hours'), -- Cache for 6 hours
  
  -- Unique constraint to prevent duplicate cache entries
  UNIQUE(location_lat, location_lng, date, api_provider)
);

-- Enable RLS on weather_cache
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Drop existing policies first to make script idempotent
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view trips they own or participate in" ON trips;
DROP POLICY IF EXISTS "Trip creators can update trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;
DROP POLICY IF EXISTS "Trip creators can delete trips" ON trips;
DROP POLICY IF EXISTS "Users can view participants for their trips" ON trip_participants;
DROP POLICY IF EXISTS "Trip owners can add participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON trip_participants;
DROP POLICY IF EXISTS "Trip owners can remove participants" ON trip_participants;
DROP POLICY IF EXISTS "Users can view itinerary items for their trips" ON itinerary_items;
DROP POLICY IF EXISTS "Users can create itinerary items for their trips" ON itinerary_items;
DROP POLICY IF EXISTS "Users can update their itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can delete their itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can view bookings for their trips" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings for their trips" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view weather cache for their trips" ON weather_cache;
DROP POLICY IF EXISTS "Users can create weather cache for their trips" ON weather_cache;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- TRIPS TABLE POLICIES
-- Users can see trips they own or are participants in
CREATE POLICY "Users can view trips they own or participate in" ON trips
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM trip_participants 
      WHERE trip_id = trips.id 
      AND user_id = auth.uid() 
      AND status = 'accepted'
    )
  );

-- Only trip creators can update trips (or we could allow editors)
CREATE POLICY "Trip creators can update trips" ON trips
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can create trips
CREATE POLICY "Users can create trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only trip creators can delete trips
CREATE POLICY "Trip creators can delete trips" ON trips
  FOR DELETE USING (auth.uid() = created_by);

-- TRIP PARTICIPANTS POLICIES
-- Users can see participants for trips they're involved in
CREATE POLICY "Users can view participants for their trips" ON trip_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_participants.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants tp2 
        WHERE tp2.trip_id = trips.id 
        AND tp2.user_id = auth.uid() 
        AND tp2.status = 'accepted'
      ))
    )
  );

-- Trip owners can add participants
CREATE POLICY "Trip owners can add participants" ON trip_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_participants.trip_id 
      AND created_by = auth.uid()
    )
  );

-- Users can update their own participation status
CREATE POLICY "Users can update their own participation" ON trip_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Trip owners can remove participants
CREATE POLICY "Trip owners can remove participants" ON trip_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_participants.trip_id 
      AND created_by = auth.uid()
    )
  );

-- ITINERARY ITEMS POLICIES
-- Users can see itinerary items for trips they participate in
CREATE POLICY "Users can view itinerary items for their trips" ON itinerary_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = itinerary_items.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants 
        WHERE trip_id = trips.id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
      ))
    )
  );

-- Users can create itinerary items for trips they participate in
CREATE POLICY "Users can create itinerary items for their trips" ON itinerary_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = itinerary_items.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants 
        WHERE trip_id = trips.id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
        AND role IN ('owner', 'editor', 'participant')
      ))
    )
  );

-- Users can update itinerary items they created or for trips they own
CREATE POLICY "Users can update their itinerary items" ON itinerary_items
  FOR UPDATE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM trips 
      WHERE id = itinerary_items.trip_id 
      AND created_by = auth.uid()
    )
  );

-- Users can delete itinerary items they created or for trips they own
CREATE POLICY "Users can delete their itinerary items" ON itinerary_items
  FOR DELETE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM trips 
      WHERE id = itinerary_items.trip_id 
      AND created_by = auth.uid()
    )
  );

-- BOOKINGS POLICIES
-- Users can see bookings for trips they participate in
CREATE POLICY "Users can view bookings for their trips" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = bookings.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants 
        WHERE trip_id = trips.id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
      ))
    )
  );

-- Users can create bookings for trips they participate in
CREATE POLICY "Users can create bookings for their trips" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = bookings.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants 
        WHERE trip_id = trips.id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
        AND role IN ('owner', 'editor', 'participant')
      ))
    )
  );

-- Users can update bookings they created or for trips they own
CREATE POLICY "Users can update their bookings" ON bookings
  FOR UPDATE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM trips 
      WHERE id = bookings.trip_id 
      AND created_by = auth.uid()
    )
  );

-- Users can delete bookings they created or for trips they own
CREATE POLICY "Users can delete their bookings" ON bookings
  FOR DELETE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM trips 
      WHERE id = bookings.trip_id 
      AND created_by = auth.uid()
    )
  );

-- WEATHER CACHE POLICIES
-- Users can see weather cache for trips they participate in
CREATE POLICY "Users can view weather cache for their trips" ON weather_cache
  FOR SELECT USING (
    trip_id IS NULL OR EXISTS (
      SELECT 1 FROM trips 
      WHERE id = weather_cache.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants 
        WHERE trip_id = trips.id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
      ))
    )
  );

-- Users can create weather cache entries for their trips
CREATE POLICY "Users can create weather cache for their trips" ON weather_cache
  FOR INSERT WITH CHECK (
    trip_id IS NULL OR EXISTS (
      SELECT 1 FROM trips 
      WHERE id = weather_cache.trip_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM trip_participants 
        WHERE trip_id = trips.id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
      ))
    )
  );

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns (drop first if exist)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
DROP TRIGGER IF EXISTS update_itinerary_items_updated_at ON itinerary_items;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itinerary_items_updated_at BEFORE UPDATE ON itinerary_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR AUTOMATIC USER PROFILE CREATION
-- =============================================================================

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip_id ON trip_participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_participants_user_id ON trip_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_datetime ON itinerary_items(start_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_weather_cache_location_date ON weather_cache(location_lat, location_lng, date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

-- =============================================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IN PRODUCTION)
-- =============================================================================

-- Uncomment below to insert sample data for testing
/*
-- Sample trip (replace with actual user ID)
INSERT INTO trips (title, description, destination, start_date, end_date, budget_total, created_by)
VALUES (
  'Weekend in San Francisco',
  'A romantic weekend getaway to explore the city by the bay',
  'San Francisco, CA',
  '2024-12-15',
  '2024-12-17',
  1500.00,
  auth.uid()
);
*/

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Created tables: user_profiles, trips, trip_participants, itinerary_items, bookings, weather_cache';
  RAISE NOTICE 'Configured Row Level Security policies for all tables';
  RAISE NOTICE 'Added triggers for automatic timestamps and user profile creation';
  RAISE NOTICE 'Created performance indexes';
  RAISE NOTICE 'Your trip planning app database is ready to use!';
END $$;