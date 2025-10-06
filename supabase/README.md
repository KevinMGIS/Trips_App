# Supabase Database Setup for Trip Planner App

This folder contains all the database schema, security policies, and setup scripts for your collaborative trip planning app.

## 📁 Folder Structure

```
supabase/
├── setup.sql                      # Main setup script - run this first
├── migrations/
│   ├── 001_initial_schema.sql     # Database tables and schema
│   └── 002_rls_policies.sql       # Row Level Security policies
└── seed/
    └── sample_data.sql            # Optional test data
```

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Run Database Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `setup.sql`
4. Click **Run** to execute the script

### 3. Create User Accounts

1. You and your wife need to sign up through your app's authentication
2. Or manually create accounts in Supabase Auth section

### 4. Update User Authorization

After both accounts are created:

1. Get your user IDs by running this query in SQL Editor:

```sql
SELECT id, email FROM auth.users ORDER BY created_at;
```

2. Update the authorization function with your actual user IDs:

```sql
CREATE OR REPLACE FUNCTION auth.is_authorized_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IN (
        'your-user-id-uuid-here'::uuid,
        'your-wife-user-id-uuid-here'::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Update Environment Variables

Update your `.env` file with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📊 Database Schema

### Core Tables

| Table               | Purpose                            | Key Features                                  |
| ------------------- | ---------------------------------- | --------------------------------------------- |
| **profiles**        | User profiles (extends auth.users) | Partner linking, automatic creation           |
| **trips**           | Main trip entities                 | Status tracking, budget management            |
| **wishlist_items**  | Destination wishlist               | Priority levels, budget estimates             |
| **bookings**        | Flight, hotel, etc. reservations   | Multiple booking types, confirmation tracking |
| **itinerary_items** | Day-by-day activity planning       | Time-based sorting, cost tracking             |
| **weather_cache**   | Cached weather data                | Offline capability, auto-expiration           |
| **activity_ideas**  | Research and recommendations       | Categorized, favoriting system                |

### Key Features

- **Full Collaborative Access**: Both users can read/write everything
- **Automatic Timestamps**: `created_at` and `updated_at` managed automatically
- **Data Validation**: Constraints for budgets, dates, and logical relationships
- **Optimized Indexes**: Performance optimized for common queries
- **Weather Caching**: Offline-capable weather data with expiration
- **Flexible Booking Types**: Supports flights, hotels, cars, restaurants, activities

## 🔒 Security Model

### Row Level Security (RLS)

- **Enabled on all tables** for security
- **Collaborative access** - both users can access everything
- **Authentication required** - no anonymous access
- **Future-proof** - easily restrictable to specific users

### Key Security Features

- All tables protected by RLS
- Automatic profile creation on user signup
- Helper functions for clean policy management
- Proper permission grants for authenticated users

## 🧪 Test Data (Optional)

To add sample data for testing:

1. First complete the main setup above
2. Create a test trip in your app or run:

```sql
INSERT INTO public.trips (title, destination, description, start_date, end_date, status, budget_amount)
VALUES ('Test Trip', 'Portland, OR', 'Sample trip for testing', '2025-12-01', '2025-12-03', 'planning', 800.00);
```

3. Get the trip ID and update `sample_data.sql` accordingly
4. Run the sample data script

## 🔧 Maintenance

### Cleaning Expired Weather Data

Run this periodically to clean up old weather cache:

```sql
SELECT public.cleanup_expired_weather_cache();
```

### Adding New Users (if needed later)

To add additional authorized users, update the authorization function:

```sql
CREATE OR REPLACE FUNCTION auth.is_authorized_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IN (
        'user-1-uuid'::uuid,
        'user-2-uuid'::uuid,
        'user-3-uuid'::uuid  -- Add new user here
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📝 Schema Changes

When you need to modify the database:

1. Create a new migration file: `003_your_change_name.sql`
2. Add your changes to the migration
3. Update this README with any new features
4. Test the migration on a copy of your data first

## ❓ Troubleshooting

### Common Issues

**RLS blocking queries:**

- Ensure you're authenticated in your app
- Verify user IDs are correctly set in `auth.is_authorized_user()`
- Check that RLS policies are properly applied

**Missing permissions:**

- Re-run the permissions section of `002_rls_policies.sql`
- Verify your user has the `authenticated` role

**Weather cache not working:**

- Ensure the weather API integration is properly configured
- Check that the cache expiration logic is working

### Useful Debug Queries

Check your current user ID:

```sql
SELECT auth.uid();
```

Check if you're authorized:

```sql
SELECT auth.is_authorized_user();
```

List all RLS policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## 🔄 Backup and Migration

### Backup Your Data

Use Supabase's backup features or:

```sql
-- Export your data
COPY public.trips TO '/path/to/trips_backup.csv' DELIMITER ',' CSV HEADER;
-- Repeat for other tables...
```

### Migration Between Projects

1. Export schema: Use the migration files in this folder
2. Export data: Use the backup method above
3. Import to new project: Run setup.sql then restore data

---

**Need Help?** Check the Supabase documentation or open an issue in your project repository.
