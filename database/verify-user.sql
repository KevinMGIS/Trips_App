-- =============================================================================
-- USER SETUP VERIFICATION AND PROFILE CREATION
-- =============================================================================
-- Run this script to verify your user profile exists and create one if needed
-- Replace the UUID with your actual user UUID: 0bb03f82-65b5-42f2-8732-191f454aa59c

-- Check if user profile already exists
SELECT 
  id, 
  display_name, 
  avatar_url, 
  created_at 
FROM user_profiles 
WHERE id = '0bb03f82-65b5-42f2-8732-191f454aa59c';

-- Create your user profile (since it doesn't exist yet)
INSERT INTO user_profiles (id, display_name) 
VALUES (
  '0bb03f82-65b5-42f2-8732-191f454aa59c',
  'Kevin' -- Replace with your preferred display name
)
ON CONFLICT (id) DO NOTHING;

-- Verify the profile was created/exists
SELECT 
  id, 
  display_name, 
  avatar_url, 
  phone,
  preferences,
  created_at,
  updated_at
FROM user_profiles 
WHERE id = '0bb03f82-65b5-42f2-8732-191f454aa59c';

-- Check if user exists in auth.users (should already exist)
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE id = '0bb03f82-65b5-42f2-8732-191f454aa59c';