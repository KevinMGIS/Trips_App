-- Seed Data for Trip Planner App
-- This script provides sample data for testing and development
-- Run this after setting up your initial user accounts

-- ============================================================================
-- SAMPLE WISHLIST ITEMS
-- ============================================================================

INSERT INTO public.wishlist_items (destination, description, estimated_budget_min, estimated_budget_max, priority_level, notes) VALUES
('Napa Valley, CA', 'Wine tasting weekend getaway', 800.00, 1200.00, 5, 'Fall colors would be amazing. Check harvest season dates.'),
('Portland, OR', 'Food tours and breweries', 600.00, 900.00, 4, 'Great food scene, easy flight from most places'),
('Savannah, GA', 'Historic downtown and southern charm', 700.00, 1000.00, 4, 'Beautiful architecture, ghost tours'),
('Charleston, SC', 'Historic district and amazing food', 750.00, 1100.00, 3, 'Similar to Savannah but different vibe'),
('Asheville, NC', 'Blue Ridge Mountains and breweries', 500.00, 800.00, 4, 'Great hiking, brewery scene, and mountain views'),
('Key West, FL', 'Tropical relaxation and sunset views', 900.00, 1300.00, 3, 'Fly into Miami and drive down, or direct flight'),
('Austin, TX', 'Live music and BBQ scene', 600.00, 900.00, 4, 'Keep weird! Great music venues and food trucks'),
('Santa Barbara, CA', 'Wine country meets beach', 1000.00, 1400.00, 2, 'More expensive but combines wine and ocean');

-- ============================================================================
-- SAMPLE TRIP
-- ============================================================================

-- Insert a sample trip (you'll need to update created_by with actual user ID after signup)
INSERT INTO public.trips (title, destination, description, start_date, end_date, status, budget_amount, budget_spent) VALUES
('Weekend in Portland', 'Portland, OR', 'Food tour weekend with brewery visits', '2025-11-15', '2025-11-17', 'planning', 850.00, 0.00);

-- Get the trip ID for related data (this will work in a transaction)
-- Note: In practice, you'll need to get the actual trip ID after insertion

-- ============================================================================
-- SAMPLE BOOKINGS (update trip_id after creating actual trip)
-- ============================================================================

-- Sample flight booking
-- INSERT INTO public.bookings (trip_id, type, title, confirmation_number, cost, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time) VALUES
-- ('your-trip-id-here', 'flight', 'Outbound Flight to Portland', 'ABC123', 320.00, 'Alaska Airlines', 'AS1234', 'SFO', 'PDX', '2025-11-15 08:00:00-08', '2025-11-15 10:30:00-08');

-- Sample hotel booking
-- INSERT INTO public.bookings (trip_id, type, title, confirmation_number, cost, hotel_name, check_in_date, check_out_date, address) VALUES
-- ('your-trip-id-here', 'hotel', 'Hotel Eastlund', 'HTL456789', 280.00, 'Hotel Eastlund', '2025-11-15', '2025-11-17', '1021 NE Grand Ave, Portland, OR 97232');

-- ============================================================================
-- SAMPLE ITINERARY ITEMS (update trip_id after creating actual trip)
-- ============================================================================

-- Day 1 activities
-- INSERT INTO public.itinerary_items (trip_id, date, start_time, title, description, location, cost) VALUES
-- ('your-trip-id-here', '2025-11-15', '12:00:00', 'Arrival & Check-in', 'Land in Portland, pick up rental car, check into hotel', 'Hotel Eastlund', 0.00),
-- ('your-trip-id-here', '2025-11-15', '14:00:00', 'Powell''s Books', 'Browse the famous independent bookstore', '1005 W Burnside St', 30.00),
-- ('your-trip-id-here', '2025-11-15', '16:00:00', 'Coffee at Stumptown', 'Try the original Stumptown location', '128 SW 3rd Ave', 12.00),
-- ('your-trip-id-here', '2025-11-15', '19:00:00', 'Dinner at Le Pigeon', 'French-inspired Pacific Northwest cuisine', '738 E Burnside St', 150.00);

-- Day 2 activities
-- INSERT INTO public.itinerary_items (trip_id, date, start_time, title, description, location, cost) VALUES
-- ('your-trip-id-here', '2025-11-16', '09:00:00', 'Portland Saturday Market', 'Local crafts and food vendors', 'Waterfront Park', 25.00),
-- ('your-trip-id-here', '2025-11-16', '11:30:00', 'Food Cart Pods Tour', 'Sample different food trucks', 'Various locations', 40.00),
-- ('your-trip-id-here', '2025-11-16', '15:00:00', 'Brewery Tour - Deschutes', 'Brewery tour and tasting', '210 NW 11th Ave', 25.00),
-- ('your-trip-id-here', '2025-11-16', '17:30:00', 'Happy Hour at Tasty n Alder', 'Pre-dinner drinks and small plates', '580 SW 12th Ave', 45.00),
-- ('your-trip-id-here', '2025-11-16', '20:00:00', 'Dinner at Ox Restaurant', 'Argentine-inspired steakhouse', '2225 NE Martin Luther King Jr Blvd', 120.00);

-- Day 3 activities
-- INSERT INTO public.itinerary_items (trip_id, date, start_time, title, description, location, cost) VALUES
-- ('your-trip-id-here', '2025-11-17', '09:00:00', 'Brunch at Screen Door', 'Famous southern-style brunch', '2337 E Burnside St', 35.00),
-- ('your-trip-id-here', '2025-11-17', '11:30:00', 'Washington Park & Rose Garden', 'Stroll through the beautiful gardens', 'Washington Park', 0.00),
-- ('your-trip-id-here', '2025-11-17', '14:00:00', 'Last-minute shopping', 'Pick up Portland souvenirs', 'Pearl District', 50.00),
-- ('your-trip-id-here', '2025-11-17', '16:00:00', 'Departure', 'Head to airport for return flight', 'PDX Airport', 0.00);

-- ============================================================================
-- SAMPLE ACTIVITY IDEAS (update trip_id after creating actual trip)
-- ============================================================================

-- INSERT INTO public.activity_ideas (trip_id, title, description, category, estimated_cost, estimated_duration_hours, location, notes) VALUES
-- ('your-trip-id-here', 'Portland Streetcar Tour', 'Hop-on hop-off tour of the city', 'sightseeing', 15.00, 2.0, 'Various stops', 'Good way to get oriented'),
-- ('your-trip-id-here', 'Multnomah Falls', 'Beautiful waterfall hike', 'outdoor', 0.00, 3.0, 'Columbia River Gorge', '30-minute drive from downtown'),
-- ('your-trip-id-here', 'Portland Art Museum', 'Local and international art collections', 'culture', 20.00, 2.5, '1219 SW Park Ave', 'Check for special exhibitions'),
-- ('your-trip-id-here', 'Ghost Tour', 'Spooky evening walking tour', 'entertainment', 25.00, 1.5, 'Downtown Portland', 'Fun nighttime activity'),
-- ('your-trip-id-here', 'Lan Su Chinese Garden', 'Authentic Ming Dynasty-style garden', 'culture', 12.00, 1.0, '239 NW Everett St', 'Peaceful escape in the city'),
-- ('your-trip-id-here', 'Portland Farmers Market', 'Local produce and artisan goods', 'food', 20.00, 1.5, 'PSU Park Blocks', 'Saturday mornings only');

-- ============================================================================
-- NOTES
-- ============================================================================

-- After you create your Supabase project and set up user accounts:
-- 1. Update the auth.is_authorized_user() function with your actual user UUIDs
-- 2. Uncomment and update the sample bookings/itinerary items with real trip IDs
-- 3. Update the created_by fields with your actual user IDs

-- To get your user ID after signup, you can run:
-- SELECT auth.uid();

-- To update the authorization function with your specific user IDs:
-- CREATE OR REPLACE FUNCTION auth.is_authorized_user()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--     RETURN auth.uid() IN (
--         'your-user-id-uuid'::uuid,
--         'your-wife-user-id-uuid'::uuid
--     );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;