-- Verify Photo Map Setup
-- Run this to check if everything is set up correctly

-- Check if trip_photos table exists
SELECT 
  'trip_photos table' as object,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trip_photos'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check if storage bucket exists
SELECT 
  'trip-photos bucket' as object,
  CASE WHEN EXISTS (
    SELECT FROM storage.buckets 
    WHERE id = 'trip-photos'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- List all RLS policies on trip_photos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'trip_photos'
ORDER BY policyname;

-- List all storage policies for trip-photos bucket
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%photo%'
ORDER BY policyname;

-- Check trip_photos table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'trip_photos'
ORDER BY ordinal_position;

-- Check if there are any photos in the database
SELECT 
  COUNT(*) as total_photos,
  COUNT(latitude) as photos_with_gps,
  COUNT(DISTINCT trip_id) as trips_with_photos,
  COUNT(DISTINCT user_id) as users_with_photos
FROM trip_photos;

-- If photos exist, show a sample
SELECT 
  id,
  trip_id,
  title,
  latitude,
  longitude,
  taken_at,
  camera_make,
  created_at
FROM trip_photos
ORDER BY created_at DESC
LIMIT 5;
