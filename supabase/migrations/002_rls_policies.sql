-- Row Level Security (RLS) Policies for Trip Planner App
-- This script sets up RLS policies for collaborative editing between two users (you and your wife)
-- Both users will have full access to read and edit everything

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_ideas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if the current user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user is one of the two allowed users
-- Updated with your actual user ID
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

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Allow users to view all profiles (for partner linking)
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (public.is_authorized_user());

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id AND public.is_authorized_user());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id AND public.is_authorized_user())
    WITH CHECK (auth.uid() = id AND public.is_authorized_user());

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id AND public.is_authorized_user());

-- ============================================================================
-- TRIPS TABLE POLICIES
-- ============================================================================

-- Allow authorized users to view all trips (collaborative access)
CREATE POLICY "Authorized users can view all trips" ON public.trips
    FOR SELECT USING (public.is_authorized_user());

-- Allow authorized users to insert trips
CREATE POLICY "Authorized users can insert trips" ON public.trips
    FOR INSERT WITH CHECK (public.is_authorized_user());

-- Allow authorized users to update all trips (collaborative editing)
CREATE POLICY "Authorized users can update all trips" ON public.trips
    FOR UPDATE USING (public.is_authorized_user())
    WITH CHECK (public.is_authorized_user());

-- Allow authorized users to delete all trips
CREATE POLICY "Authorized users can delete all trips" ON public.trips
    FOR DELETE USING (public.is_authorized_user());

-- ============================================================================
-- WISHLIST ITEMS TABLE POLICIES
-- ============================================================================

-- Allow authorized users to view all wishlist items
CREATE POLICY "Authorized users can view all wishlist items" ON public.wishlist_items
    FOR SELECT USING (public.is_authorized_user());

-- Allow authorized users to insert wishlist items
CREATE POLICY "Authorized users can insert wishlist items" ON public.wishlist_items
    FOR INSERT WITH CHECK (public.is_authorized_user());

-- Allow authorized users to update all wishlist items
CREATE POLICY "Authorized users can update all wishlist items" ON public.wishlist_items
    FOR UPDATE USING (public.is_authorized_user())
    WITH CHECK (public.is_authorized_user());

-- Allow authorized users to delete all wishlist items
CREATE POLICY "Authorized users can delete all wishlist items" ON public.wishlist_items
    FOR DELETE USING (public.is_authorized_user());

-- ============================================================================
-- BOOKINGS TABLE POLICIES
-- ============================================================================

-- Allow authorized users to view all bookings
CREATE POLICY "Authorized users can view all bookings" ON public.bookings
    FOR SELECT USING (public.is_authorized_user());

-- Allow authorized users to insert bookings
CREATE POLICY "Authorized users can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (public.is_authorized_user());

-- Allow authorized users to update all bookings
CREATE POLICY "Authorized users can update all bookings" ON public.bookings
    FOR UPDATE USING (public.is_authorized_user())
    WITH CHECK (public.is_authorized_user());

-- Allow authorized users to delete all bookings
CREATE POLICY "Authorized users can delete all bookings" ON public.bookings
    FOR DELETE USING (public.is_authorized_user());

-- ============================================================================
-- ITINERARY ITEMS TABLE POLICIES
-- ============================================================================

-- Allow authorized users to view all itinerary items
CREATE POLICY "Authorized users can view all itinerary items" ON public.itinerary_items
    FOR SELECT USING (public.is_authorized_user());

-- Allow authorized users to insert itinerary items
CREATE POLICY "Authorized users can insert itinerary items" ON public.itinerary_items
    FOR INSERT WITH CHECK (public.is_authorized_user());

-- Allow authorized users to update all itinerary items
CREATE POLICY "Authorized users can update all itinerary items" ON public.itinerary_items
    FOR UPDATE USING (public.is_authorized_user())
    WITH CHECK (public.is_authorized_user());

-- Allow authorized users to delete all itinerary items
CREATE POLICY "Authorized users can delete all itinerary items" ON public.itinerary_items
    FOR DELETE USING (public.is_authorized_user());

-- ============================================================================
-- WEATHER CACHE TABLE POLICIES
-- ============================================================================

-- Allow authorized users to view all weather cache
CREATE POLICY "Authorized users can view all weather cache" ON public.weather_cache
    FOR SELECT USING (public.is_authorized_user());

-- Allow authorized users to insert weather cache
CREATE POLICY "Authorized users can insert weather cache" ON public.weather_cache
    FOR INSERT WITH CHECK (public.is_authorized_user());

-- Allow authorized users to update all weather cache
CREATE POLICY "Authorized users can update all weather cache" ON public.weather_cache
    FOR UPDATE USING (public.is_authorized_user())
    WITH CHECK (public.is_authorized_user());

-- Allow authorized users to delete all weather cache
CREATE POLICY "Authorized users can delete all weather cache" ON public.weather_cache
    FOR DELETE USING (public.is_authorized_user());

-- ============================================================================
-- ACTIVITY IDEAS TABLE POLICIES
-- ============================================================================

-- Allow authorized users to view all activity ideas
CREATE POLICY "Authorized users can view all activity ideas" ON public.activity_ideas
    FOR SELECT USING (public.is_authorized_user());

-- Allow authorized users to insert activity ideas
CREATE POLICY "Authorized users can insert activity ideas" ON public.activity_ideas
    FOR INSERT WITH CHECK (public.is_authorized_user());

-- Allow authorized users to update all activity ideas
CREATE POLICY "Authorized users can update all activity ideas" ON public.activity_ideas
    FOR UPDATE USING (public.is_authorized_user())
    WITH CHECK (public.is_authorized_user());

-- Allow authorized users to delete all activity ideas
CREATE POLICY "Authorized users can delete all activity ideas" ON public.activity_ideas
    FOR DELETE USING (public.is_authorized_user());

-- ============================================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- CLEANUP FUNCTION for Expired Weather Cache
-- ============================================================================

-- Function to clean up expired weather cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_weather_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.weather_cache 
    WHERE expires_at < timezone('utc'::text, now());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for the public schema functions
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_user() TO authenticated;