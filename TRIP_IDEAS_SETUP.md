# Setup Instructions for Trip Ideas Feature

## Database Migration

Before using the Trip Ideas feature, you need to create the `trip_ideas` table in your Supabase database.

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `database/setup_trip_ideas.sql`
5. Click **Run** to execute the SQL

### Option 2: Supabase CLI
If you have the Supabase CLI installed:

```bash
# Navigate to project directory
cd "/Users/kevinmazur/Documents/Kevin Personal/Trips_App"

# Run the migration
supabase db push
```

Or manually apply the specific file:

```bash
# Read the file and pipe to psql via Supabase CLI
supabase db execute < database/setup_trip_ideas.sql
```

### Option 3: Direct PostgreSQL Connection
If you have direct database access:

```bash
psql "postgresql://[YOUR_CONNECTION_STRING]" -f database/setup_trip_ideas.sql
```

## Verification

After running the migration, verify the table was created:

```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'trip_ideas';

-- Check RLS policies
SELECT * 
FROM pg_policies 
WHERE tablename = 'trip_ideas';

-- Check the trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'trip_ideas';
```

Expected results:
- Table `trip_ideas` should exist
- 4 RLS policies should be active (SELECT, INSERT, UPDATE, DELETE)
- 1 trigger should exist for `updated_at` auto-update

## Testing the Feature

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to a trip**:
   - Open the app in your browser
   - Go to any trip detail page
   - Click on the **Itinerary** tab

3. **Test adding an idea**:
   - Look for the amber/orange "Trip Ideas" panel at the top
   - Click the **+** button to add a new idea
   - Fill in the form (only title is required)
   - Click "Add Idea"

4. **Test dragging idea to itinerary**:
   - Make sure you have at least one item in your itinerary
   - Click and hold the **≡** (drag handle) on an idea
   - Drag it onto any existing itinerary item
   - Release to drop
   - The idea should be added to that day's schedule
   - The original idea should disappear from the ideas panel

5. **Test editing/deleting**:
   - Click the pencil icon to edit an idea
   - Click the trash icon to delete an idea

## Troubleshooting

### "relation 'trip_ideas' does not exist"
- The migration hasn't been run yet
- Run the SQL script in Supabase SQL Editor

### "permission denied for table trip_ideas"
- RLS policies might not be set up correctly
- Check that your user is authenticated
- Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'trip_ideas'`

### Ideas don't load
- Check browser console for errors
- Verify the `getTripIdeas` function is working
- Check network tab to see if API call is successful

### Drag and drop doesn't work
- Make sure you have at least one itinerary item to drop onto
- The drag handle should be the **≡** icon on the left side of each idea card
- Check browser console for errors

### Build fails
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

## Rollback

If you need to remove the feature:

```sql
-- Drop the table (this will delete all trip ideas data!)
DROP TABLE IF EXISTS trip_ideas CASCADE;
```

**Warning**: This will permanently delete all trip ideas data!

## Next Steps

Once the migration is complete and tested:
1. The feature is ready to use!
2. Share the trip ideas feature with users
3. Consider adding the suggested future enhancements from TRIP_IDEAS_FEATURE.md

## Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all files are saved and the build was successful
4. Review the implementation in:
   - `src/components/TripIdeasPanel.tsx` (UI component)
   - `src/components/TripDetailPage.tsx` (integration)
   - `src/lib/tripService.ts` (API methods)
