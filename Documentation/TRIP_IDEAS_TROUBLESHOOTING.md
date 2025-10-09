# Trip Ideas Not Saving - Troubleshooting Guide

## Most Likely Issue: Database Migration Not Run

The `trip_ideas` table probably doesn't exist in your Supabase database yet. Here's how to fix it:

## Step 1: Verify Table Exists

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run this query:

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trip_ideas'
);
```

**Expected Result:** 
- If `true` → Table exists (skip to Step 3)
- If `false` → Table doesn't exist (continue to Step 2)

## Step 2: Create the Table

In Supabase SQL Editor, copy and paste the entire contents of:
```
database/setup_trip_ideas.sql
```

Or use this direct query:

```sql
-- Trip Ideas Table
CREATE TABLE IF NOT EXISTS trip_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('flight', 'accommodation', 'activity', 'restaurant', 'transport', 'other')),
    location TEXT,
    notes TEXT,
    url TEXT,
    estimated_duration TEXT,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_trip_ideas_trip_id ON trip_ideas(trip_id);

-- Enable RLS
ALTER TABLE trip_ideas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view trip ideas for their trips"
    ON trip_ideas FOR SELECT
    USING (
        trip_id IN (
            SELECT trip_id 
            FROM trip_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert trip ideas for their trips"
    ON trip_ideas FOR INSERT
    WITH CHECK (
        trip_id IN (
            SELECT trip_id 
            FROM trip_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update trip ideas for their trips"
    ON trip_ideas FOR UPDATE
    USING (
        trip_id IN (
            SELECT trip_id 
            FROM trip_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete trip ideas for their trips"
    ON trip_ideas FOR DELETE
    USING (
        trip_id IN (
            SELECT trip_id 
            FROM trip_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_trip_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_ideas_updated_at
    BEFORE UPDATE ON trip_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_ideas_updated_at();
```

Click **Run** to execute.

## Step 3: Check Browser Console for Errors

1. Open your app in Chrome/Firefox
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try adding a trip idea
5. Look for red error messages

### Common Errors:

**Error: "relation 'trip_ideas' does not exist"**
- **Fix**: Run the SQL migration (Step 2)

**Error: "new row violates row-level security policy"**
- **Fix**: Your user might not be in `trip_participants` table
- Run this to check:
  ```sql
  SELECT * FROM trip_participants WHERE user_id = auth.uid();
  ```
- If empty, the RLS policies are blocking access

**Error: "permission denied for table trip_ideas"**
- **Fix**: RLS is enabled but policies aren't set up correctly
- Re-run the policy creation queries from Step 2

## Step 4: Verify Data is Saving

After running the migration, try adding an idea again, then run:

```sql
SELECT * FROM trip_ideas ORDER BY created_at DESC LIMIT 10;
```

You should see your ideas!

## Step 5: Check Network Tab

1. Open DevTools → **Network** tab
2. Try adding an idea
3. Look for a request to Supabase
4. Click on it and check:
   - **Status Code**: Should be 200 or 201
   - **Response**: Look for error messages
   - **Payload**: Verify data is being sent correctly

### Example of what you should see:

**Request URL**: `https://your-project.supabase.co/rest/v1/trip_ideas`
**Status**: 201 Created
**Response**: 
```json
{
  "id": "uuid-here",
  "trip_id": "trip-uuid",
  "title": "Your idea title",
  ...
}
```

## Still Not Working?

### Check the Service Method

The `createTripIdea` method in `tripService.ts` should look like this:

```typescript
static async createTripIdea(ideaData: any): Promise<{ data: any | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('trip_ideas')
      .insert([ideaData])
      .select('*')
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error in createTripIdea:', error)
    return { data: null, error }
  }
}
```

### Check the Form Submission

The `handleSubmit` in `TripIdeasPanel.tsx` should include:

```typescript
const newIdea: NewTripIdea = {
  trip_id: tripId,
  ...formData
}
const { error } = await TripService.createTripIdea(newIdea)
```

## Quick Test Query

To manually test if you can insert data:

```sql
-- Replace 'your-trip-id' with an actual trip ID from your trips table
INSERT INTO trip_ideas (trip_id, title, priority)
VALUES ('your-trip-id', 'Test Idea', 'medium')
RETURNING *;
```

If this works → Problem is in the frontend code
If this fails → Problem is with permissions/RLS

## Need the Trip ID?

```sql
SELECT id, title FROM trips WHERE created_by = auth.uid() ORDER BY created_at DESC LIMIT 5;
```

Use one of those IDs for testing.

---

## Most Common Solution

**99% of the time**, the issue is simply that the migration wasn't run. Just:

1. Go to Supabase Dashboard
2. SQL Editor
3. Paste contents of `database/setup_trip_ideas.sql`
4. Run it
5. Try adding an idea again

It should work! 🎉
