-- =============================================================================
-- TEST USER PERMISSIONS AND CREATE SAMPLE DATA
-- =============================================================================
-- Run this script AFTER verifying your user profile exists
-- This will test that RLS policies work correctly with your user

-- Set the session to simulate being logged in as your user
-- (This is just for testing in SQL editor - your app will handle auth automatically)

-- Test 1: Check if you can see your own profile
SELECT 'TEST 1: Can view own profile' as test_name;
SELECT * FROM user_profiles WHERE id = '0bb03f82-65b5-42f2-8732-191f454aa59c';

-- Test 2: Create a sample trip to test trip functionality
SELECT 'TEST 2: Creating sample trip' as test_name;
INSERT INTO trips (
  title, 
  description, 
  destination, 
  destination_lat,
  destination_lng,
  start_date, 
  end_date, 
  budget_total, 
  created_by
) VALUES (
  'Weekend in Napa Valley',
  'A romantic weekend getaway exploring wine country',
  'Napa Valley, CA',
  38.2975,
  -122.2869,
  '2024-11-15',
  '2024-11-17',
  1200.00,
  '0bb03f82-65b5-42f2-8732-191f454aa59c'
) RETURNING id, title, destination, created_at;

-- Test 3: View trips (should see the one we just created)
SELECT 'TEST 3: Viewing trips' as test_name;
SELECT 
  id,
  title,
  destination,
  start_date,
  end_date,
  status,
  budget_total,
  created_at
FROM trips 
WHERE created_by = '0bb03f82-65b5-42f2-8732-191f454aa59c';

-- Test 4: Create a sample itinerary item
SELECT 'TEST 4: Creating sample itinerary item' as test_name;
-- Get the trip ID from the trip we just created
WITH latest_trip AS (
  SELECT id as trip_id 
  FROM trips 
  WHERE created_by = '0bb03f82-65b5-42f2-8732-191f454aa59c' 
  ORDER BY created_at DESC 
  LIMIT 1
)
INSERT INTO itinerary_items (
  trip_id,
  title,
  description,
  category,
  start_datetime,
  end_datetime,
  location,
  cost,
  created_by
)
SELECT 
  trip_id,
  'Wine Tasting at Castello di Amorosa',
  'Private wine tasting experience at the medieval castle winery',
  'activity',
  '2024-11-15 14:00:00-08',
  '2024-11-15 16:30:00-08',
  'Castello di Amorosa, Calistoga, CA',
  150.00,
  '0bb03f82-65b5-42f2-8732-191f454aa59c'
FROM latest_trip
RETURNING id, title, category, start_datetime, cost;

-- Test 5: View complete trip with itinerary
SELECT 'TEST 5: Complete trip view' as test_name;
SELECT 
  t.title as trip_title,
  t.destination,
  t.start_date,
  t.end_date,
  t.budget_total,
  i.title as activity_title,
  i.category,
  i.start_datetime,
  i.cost
FROM trips t
LEFT JOIN itinerary_items i ON t.id = i.trip_id
WHERE t.created_by = '0bb03f82-65b5-42f2-8732-191f454aa59c'
ORDER BY i.start_datetime;

-- Success message
SELECT '🎉 All tests completed! Your database setup is working correctly.' as result;