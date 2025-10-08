-- Trip Ideas Table
-- Stores potential activities/ideas that may be added to the itinerary later

CREATE TABLE IF NOT EXISTS trip_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('flight', 'accommodation', 'activity', 'restaurant', 'transport', 'other')),
    location TEXT,
    notes TEXT,
    url TEXT,
    estimated_duration TEXT, -- e.g., "2 hours", "half day", "full day"
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by trip_id
CREATE INDEX IF NOT EXISTS idx_trip_ideas_trip_id ON trip_ideas(trip_id);

-- Enable Row Level Security
ALTER TABLE trip_ideas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view ideas for trips they have access to
CREATE POLICY "Users can view trip ideas for their trips"
    ON trip_ideas FOR SELECT
    USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        )
    );

-- Policy: Users can insert ideas for their trips
CREATE POLICY "Users can insert trip ideas for their trips"
    ON trip_ideas FOR INSERT
    WITH CHECK (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        )
    );

-- Policy: Users can update ideas for their trips
CREATE POLICY "Users can update trip ideas for their trips"
    ON trip_ideas FOR UPDATE
    USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        )
    );

-- Policy: Users can delete ideas for their trips
CREATE POLICY "Users can delete trip ideas for their trips"
    ON trip_ideas FOR DELETE
    USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trip_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_trip_ideas_updated_at
    BEFORE UPDATE ON trip_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_ideas_updated_at();
