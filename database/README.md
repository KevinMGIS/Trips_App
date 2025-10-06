# Database Setup Instructions

This document explains how to set up the database schema and Row Level Security (RLS) policies for the Trips app in Supabase.

## Quick Setup

1. **Navigate to your Supabase project dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Open your project (`dgghgaenvglychvturtc`)

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Run the setup script**
   - Copy the entire contents of `database/setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify the setup**
   - Go to "Table Editor" to see your new tables
   - Check that RLS is enabled on all tables
   - Verify that the triggers and functions were created

## Database Schema Overview

### Core Tables

1. **`user_profiles`** - Extended user information
   - Links to Supabase auth.users
   - Stores display name, avatar, preferences
   - Auto-created when user signs up

2. **`trips`** - Main trip records
   - Trip details, dates, budget, destination
   - Supports coordinates for mapping
   - Status tracking (planning → completed)

3. **`trip_participants`** - Trip sharing/collaboration
   - Manage who can access each trip
   - Role-based permissions (owner, editor, viewer)
   - Invitation and acceptance workflow

4. **`itinerary_items`** - Trip activities and events
   - Scheduled activities with date/time
   - Location and cost tracking
   - Categories (flight, hotel, activity, etc.)

5. **`bookings`** - Reservation confirmations
   - Links to itinerary items
   - Confirmation numbers and details
   - Cost and status tracking

6. **`weather_cache`** - Weather API cache
   - Reduces external API calls
   - 6-hour expiration for fresh data
   - Supports multiple weather providers

### Security (Row Level Security)

All tables have RLS policies that ensure:
- ✅ Users only see their own data
- ✅ Trip participants can access shared trips
- ✅ Trip owners can manage participants
- ✅ Proper permissions for CRUD operations

### Performance Features

- 📈 **Indexes** on frequently queried columns
- ⚡ **Automatic timestamps** via triggers
- 🔄 **Auto-profile creation** on user signup
- 🗂️ **Efficient queries** with proper relationships

## Testing the Setup

After running the setup script, you can test by:

1. **Creating a user account** in your app
2. **Checking that a profile was auto-created**
3. **Creating a trip** and verifying permissions
4. **Inviting another user** to test collaboration

## Schema Changes

If you need to modify the schema later:

1. Make changes to `database/setup.sql`
2. Create migration scripts for existing data
3. Test in a staging environment first
4. Apply to production via Supabase dashboard

## Environment Variables

Make sure these are set in your `.env` file:

```bash
VITE_SUPABASE_URL=https://dgghgaenvglychvturtc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### Common Issues

**RLS Policy Errors**
- Check that policies allow the action you're trying to perform
- Verify user authentication status
- Test policies with different user roles

**Missing Tables**
- Re-run the setup script
- Check for syntax errors in SQL Editor
- Verify proper permissions in Supabase

**Type Errors**
- Ensure TypeScript types in `src/types/database.ts` match the schema
- Regenerate types if needed: `supabase gen types typescript`

### Getting Help

- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Review RLS policy examples
- Test queries in the SQL Editor

## Next Steps

After database setup is complete:
1. ✅ Test user authentication and profile creation
2. 🏗️ Build trip creation and management UI
3. 🤝 Implement trip sharing and collaboration
4. 📱 Add itinerary management features
5. 🌤️ Integrate weather API
6. 📊 Add budget tracking and reporting