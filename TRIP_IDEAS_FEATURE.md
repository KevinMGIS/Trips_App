# Trip Ideas Feature

## Overview
The Trip Ideas feature allows users to capture and manage potential activities for their trip before committing them to the itinerary. Ideas can be easily dragged and dropped onto specific days in the itinerary when ready.

## Components

### 1. Database Schema (`database/setup_trip_ideas.sql`)
- **Table**: `trip_ideas`
- **Fields**:
  - `id` (UUID, primary key)
  - `trip_id` (UUID, foreign key to trips)
  - `title` (text, required)
  - `description` (text, optional)
  - `category` (enum: flight, accommodation, activity, restaurant, transport, other)
  - `location` (text, optional)
  - `notes` (text, optional)
  - `url` (text, optional)
  - `estimated_duration` (text, optional)
  - `priority` (enum: high, medium, low)
  - `created_by` (UUID, references auth.users)
  - `created_at` (timestamp)
  - `updated_at` (timestamp with auto-update trigger)
- **Security**: Row Level Security (RLS) policies for SELECT, INSERT, UPDATE, DELETE

### 2. TypeScript Types (`src/types/database.ts`)
```typescript
export interface TripIdea {
  id: string
  trip_id: string
  title: string
  description?: string
  category?: 'flight' | 'accommodation' | 'activity' | 'restaurant' | 'transport' | 'other'
  location?: string
  notes?: string
  url?: string
  estimated_duration?: string
  priority: 'high' | 'medium' | 'low'
  created_by?: string
  created_at: string
  updated_at: string
}

export interface NewTripIdea {
  trip_id: string
  title: string
  description?: string
  category?: 'flight' | 'accommodation' | 'activity' | 'restaurant' | 'transport' | 'other'
  location?: string
  notes?: string
  url?: string
  estimated_duration?: string
  priority: 'high' | 'medium' | 'low'
  created_by?: string
}
```

### 3. Service Methods (`src/lib/tripService.ts`)
- `getTripIdeas(tripId)` - Fetch all ideas for a trip
- `createTripIdea(ideaData)` - Create a new idea
- `updateTripIdea(ideaId, updates)` - Update an existing idea
- `deleteTripIdea(ideaId)` - Delete an idea
- `convertIdeaToItinerary(ideaId, itineraryData)` - Convert idea to itinerary item and delete the idea

### 4. UI Component (`src/components/TripIdeasPanel.tsx`)
**Features**:
- Collapsible panel with amber/orange gradient header
- Add/edit/delete ideas functionality
- Drag handles on each idea card
- Priority badges (high/medium/low with color coding)
- Category badges with color coding
- Sort by priority (high → medium → low) then by creation date
- Form validation and error handling
- Empty state with helpful message

**Drag & Drop**:
- Each idea has a drag handle (GripVertical icon)
- Ideas can be dragged onto any itinerary item
- On drop, idea is converted to an itinerary item on that day
- Original idea is automatically deleted after successful conversion

### 5. Integration (`src/components/TripDetailPage.tsx`)
**Changes**:
- Added `tripIdeas` state to store ideas
- Load ideas in `loadTripData()` function
- Enhanced `handleDragEnd()` to detect and handle idea drops:
  - Checks if dragged item is an idea (`active.data.current?.type === 'idea'`)
  - Extracts target date from the item being dropped near
  - Calls `convertIdeaToItinerary()` with new itinerary data
  - Reloads all data to reflect changes
- Rendered `TripIdeasPanel` at top of itinerary tab

## Usage

### Adding an Idea
1. Navigate to the Itinerary tab
2. Click the + button in the Trip Ideas panel header
3. Fill in the form:
   - **Title** (required)
   - **Description** (optional)
   - **Category** (activity, restaurant, accommodation, etc.)
   - **Priority** (high, medium, low)
   - **Location** (optional)
   - **Estimated Duration** (optional, e.g., "2 hours")
4. Click "Add Idea"

### Editing an Idea
1. Click the pencil icon on any idea card
2. Modify the fields
3. Click "Update"

### Deleting an Idea
1. Click the trash icon on any idea card
2. Confirm deletion

### Converting Idea to Itinerary
1. Click and hold the drag handle (≡) on an idea card
2. Drag the idea onto any existing itinerary item
3. Release to drop
4. The idea will be added to that day's itinerary at 12:00 PM (flexible time)
5. The original idea is automatically removed from the ideas list

## UI/UX Highlights
- **Color Scheme**: Amber/orange gradient to distinguish from blue itinerary theme
- **Priority Colors**:
  - High: Red
  - Medium: Yellow
  - Low: Green
- **Category Colors**: Same as itinerary items (blue=flight, purple=accommodation, etc.)
- **Collapsible**: Panel can be collapsed to save space
- **Count Badge**: Shows total number of ideas
- **Sorted Display**: High priority ideas appear first
- **Empty State**: Helpful message when no ideas exist

## Database Migration
To enable this feature in your Supabase instance:

```sql
-- Run the setup_trip_ideas.sql file in Supabase SQL Editor
-- This will create the table, indexes, and RLS policies
```

Or use the Supabase CLI:
```bash
supabase db push --file database/setup_trip_ideas.sql
```

## Technical Notes
- Uses @dnd-kit/core for drag and drop functionality
- Ideas and itinerary items share the same DndContext
- Ideas are identified by `type: 'idea'` in drag data
- Conversion is atomic: creates itinerary item and deletes idea in one operation
- All database operations have proper error handling
- RLS ensures users can only see/manage their own trip ideas

## Future Enhancements
- Bulk actions (convert multiple ideas at once)
- Idea templates/suggestions based on destination
- Import ideas from URLs (parse activity websites)
- Share ideas between trips
- Voting/comments on ideas (for collaborative trips)
- Attach photos/links to ideas
- AI-powered idea suggestions
