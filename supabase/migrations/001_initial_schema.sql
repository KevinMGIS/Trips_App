-- Trip Planner App Database Schema
-- This script creates all tables and initial setup for the collaborative trip planning app
-- Designed for two users (you and your wife) with full collaborative editing access

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- Create custom types
CREATE TYPE trip_status AS ENUM ('planning', 'upcoming', 'completed');
CREATE TYPE booking_type AS ENUM ('flight', 'hotel', 'car', 'restaurant', 'activity', 'other');
CREATE TYPE weather_condition AS ENUM ('clear', 'partly_cloudy', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy');

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    partner_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- TRIPS TABLE
-- ============================================================================
CREATE TABLE public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status trip_status DEFAULT 'planning' NOT NULL,
    budget_amount DECIMAL(10,2),
    budget_spent DECIMAL(10,2) DEFAULT 0.00,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT positive_budget CHECK (budget_amount IS NULL OR budget_amount >= 0),
    CONSTRAINT positive_spent CHECK (budget_spent >= 0)
);

-- ============================================================================
-- WISHLIST TABLE
-- ============================================================================
CREATE TABLE public.wishlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    destination TEXT NOT NULL,
    description TEXT,
    estimated_budget_min DECIMAL(10,2),
    estimated_budget_max DECIMAL(10,2),
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    notes TEXT,
    added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_budget_range CHECK (
        estimated_budget_min IS NULL OR 
        estimated_budget_max IS NULL OR 
        estimated_budget_max >= estimated_budget_min
    )
);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    type booking_type NOT NULL,
    title TEXT NOT NULL,
    confirmation_number TEXT,
    cost DECIMAL(10,2),
    
    -- Flight specific fields
    airline TEXT,
    flight_number TEXT,
    departure_airport TEXT,
    arrival_airport TEXT,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    
    -- Hotel specific fields
    hotel_name TEXT,
    check_in_date DATE,
    check_out_date DATE,
    address TEXT,
    
    -- General fields
    start_datetime TIMESTAMP WITH TIME ZONE,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location TEXT,
    notes TEXT,
    url TEXT,
    
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT positive_cost CHECK (cost IS NULL OR cost >= 0),
    CONSTRAINT valid_datetime_range CHECK (
        end_datetime IS NULL OR 
        start_datetime IS NULL OR 
        end_datetime >= start_datetime
    )
);

-- ============================================================================
-- ITINERARY TABLE
-- ============================================================================
CREATE TABLE public.itinerary_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    cost DECIMAL(10,2),
    url TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT positive_cost CHECK (cost IS NULL OR cost >= 0),
    CONSTRAINT valid_time_range CHECK (
        end_time IS NULL OR 
        start_time IS NULL OR 
        end_time >= start_time
    )
);

-- ============================================================================
-- WEATHER CACHE TABLE (for offline capability)
-- ============================================================================
CREATE TABLE public.weather_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    location TEXT NOT NULL,
    forecast_date DATE NOT NULL,
    
    -- Weather data (stored as JSONB for flexibility)
    current_conditions JSONB,
    daily_forecast JSONB, -- 5-day forecast array
    
    -- Cache metadata
    api_source TEXT DEFAULT 'openweather',
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '4 hours') NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one weather cache per trip per date
    UNIQUE(trip_id, forecast_date)
);

-- ============================================================================
-- ACTIVITY IDEAS TABLE (Phase 4 feature)
-- ============================================================================
CREATE TABLE public.activity_ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    url TEXT,
    estimated_cost DECIMAL(10,2),
    estimated_duration_hours DECIMAL(4,2),
    location TEXT,
    notes TEXT,
    is_favorited BOOLEAN DEFAULT FALSE,
    
    added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT positive_cost CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    CONSTRAINT positive_duration CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours > 0)
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Trips indexes
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_dates ON public.trips(start_date, end_date);
CREATE INDEX idx_trips_created_by ON public.trips(created_by);
CREATE INDEX idx_trips_updated_at ON public.trips(updated_at);

-- Bookings indexes
CREATE INDEX idx_bookings_trip_id ON public.bookings(trip_id);
CREATE INDEX idx_bookings_type ON public.bookings(type);
CREATE INDEX idx_bookings_dates ON public.bookings(start_datetime, end_datetime);

-- Itinerary indexes
CREATE INDEX idx_itinerary_trip_date ON public.itinerary_items(trip_id, date);
CREATE INDEX idx_itinerary_sort_order ON public.itinerary_items(trip_id, date, sort_order);

-- Weather cache indexes
CREATE INDEX idx_weather_cache_trip_id ON public.weather_cache(trip_id);
CREATE INDEX idx_weather_cache_expires ON public.weather_cache(expires_at);

-- Wishlist indexes
CREATE INDEX idx_wishlist_priority ON public.wishlist_items(priority_level);
CREATE INDEX idx_wishlist_added_by ON public.wishlist_items(added_by);

-- Activity ideas indexes
CREATE INDEX idx_activity_ideas_trip_id ON public.activity_ideas(trip_id);
CREATE INDEX idx_activity_ideas_category ON public.activity_ideas(category);
CREATE INDEX idx_activity_ideas_favorited ON public.activity_ideas(is_favorited);

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON public.wishlist_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_items_updated_at BEFORE UPDATE ON public.itinerary_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_cache_updated_at BEFORE UPDATE ON public.weather_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_ideas_updated_at BEFORE UPDATE ON public.activity_ideas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();