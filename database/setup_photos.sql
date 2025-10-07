-- Trip Photos Database Setup
-- Add photo mapping functionality to the trips app

-- Create trip_photos table
CREATE TABLE IF NOT EXISTS trip_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  photo_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- Optimized small version for map markers
  latitude DECIMAL(10, 8), -- GPS coordinates from EXIF or manual
  longitude DECIMAL(11, 8),
  location_name VARCHAR(255), -- Human readable location "Eiffel Tower, Paris"
  taken_at TIMESTAMP WITH TIME ZONE, -- When photo was taken (from EXIF)
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size INTEGER, -- File size in bytes
  file_type VARCHAR(50), -- MIME type (image/jpeg, etc.)
  camera_make VARCHAR(100), -- Camera manufacturer from EXIF
  camera_model VARCHAR(100), -- Camera model from EXIF
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_photos_location ON trip_photos(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_trip_photos_trip_id ON trip_photos(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_photos_user_id ON trip_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_photos_taken_at ON trip_photos(taken_at);

-- Enable Row Level Security
ALTER TABLE trip_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_photos
-- Users can view their own photos and photos from trips they have access to
CREATE POLICY "Users can view own photos" ON trip_photos
  FOR SELECT USING (
    auth.uid() = user_id OR 
    trip_id IN (
      SELECT id FROM trips WHERE created_by = auth.uid()
      UNION
      SELECT trip_id FROM trip_participants WHERE user_id = auth.uid()
    )
  );

-- Users can insert photos to their own trips or trips they have editor access to
CREATE POLICY "Users can upload photos to accessible trips" ON trip_photos
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      trip_id IN (
        SELECT id FROM trips WHERE created_by = auth.uid()
        UNION
        SELECT trip_id FROM trip_participants 
        WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
      )
    )
  );

-- Users can update their own photos
CREATE POLICY "Users can update own photos" ON trip_photos
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON trip_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_trip_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_photos_updated_at
  BEFORE UPDATE ON trip_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_photos_updated_at();

-- Storage bucket setup (run this in Supabase dashboard or via API)
-- This creates the storage bucket for photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-photos', 'trip-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the trip-photos bucket
-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trip-photos' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to view photos
CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update own photos in storage" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'trip-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos in storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'trip-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add some helpful comments
COMMENT ON TABLE trip_photos IS 'Stores geocoded photos for the Look Back map feature';
COMMENT ON COLUMN trip_photos.latitude IS 'GPS latitude from EXIF data or manual geocoding';
COMMENT ON COLUMN trip_photos.longitude IS 'GPS longitude from EXIF data or manual geocoding';
COMMENT ON COLUMN trip_photos.location_name IS 'Human-readable location name for display';
COMMENT ON COLUMN trip_photos.taken_at IS 'When the photo was actually taken (from EXIF DateTimeOriginal)';