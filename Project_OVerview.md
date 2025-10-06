# Trip Planner App - Project Description

## Overview
A collaborative iOS Progressive Web App for couples to plan, organize, and execute weekend getaways and short trips. Built for personal use with a focus on simplicity, shared decision-making, and a sophisticated dark aesthetic. Designed to work fully offline for use during travel.

## Project Goals
- Provide a single place to collect and manage trip ideas
- Enable collaborative planning between partners
- Track budgets for cost-conscious travel ($1000 or less per trip)
- Organize bookings and itineraries in one accessible location
- Work seamlessly offline (on planes, in areas with poor connectivity)
- Make trip planning more enjoyable with a beautiful, modern interface
- Feel like a premium native iOS app

## Target Users
- Primary: You and your wife
- Use case: Weekend trips and short getaways (2-4 days typically)
- Budget range: Sub-$1000 per trip (flights + hotel)

## Technical Stack
- **Platform**: Progressive Web App (PWA) - 100% Mobile-Only
- **Target Device**: iPhone (iOS Safari)
- **Frontend**: React
- **Hosting**: Netlify at **trips.4082watson.com**
- **Backend/Database**: Supabase
- **Offline Storage**: IndexedDB with local caching
- **Service Worker**: For offline capability and caching
- **UI Framework**: Custom components or iOS-styled library (Konsta UI for iOS look)
- **Design**: iOS-native aesthetic - Clean, modern, minimal

## Core Features

### 1. Trip Wishlist
- Shared collection of potential destinations
- Each wishlist item includes:
  - Destination name
  - Brief description or notes
  - Estimated budget range
  - Priority/interest level
  - Added by (user attribution)
- Ability to promote wishlist items to planned trips

### 2. Trip Dashboard
- Overview of all trips in various states:
  - Upcoming (confirmed dates)
  - Planning (considering, no dates set)
  - Completed (past trips)
- Visual cards for each trip showing:
  - Destination
  - Dates (if set)
  - Budget status
  - Quick status indicator

### 3. Individual Trip View
Each trip includes dedicated sections for:

#### Weather Card (NEW - MVP Phase 2)
- **5-day forecast** for trip dates
- **Current conditions** (if trip is happening now or within 24 hours)
- **Muted grayscale design** to maintain dark aesthetic
- Data includes:
  - High/low temperatures
  - Weather condition (clear, cloudy, rainy, etc.)
  - Precipitation probability
  - Weather icon (monochrome line-style)
- **Offline capability**: Weather cached when fetched, shows "last updated" timestamp
- **Placement**: Below budget card, above bookings on trip detail screen
- **API**: OpenWeather API or WeatherAPI (free tier)

#### Budget Tracker
- Target budget amount
- Actual spending tracker
- Simple progress indicator (spent vs. budgeted)
- Single total view (not broken down by category initially)

#### Bookings Manager
- Flight information
  - Airline
  - Flight numbers
  - Departure/arrival times
  - Confirmation number
- Hotel/accommodation
  - Property name
  - Check-in/check-out dates
  - Confirmation number
  - Address
- Other reservations
  - Rental cars
  - Restaurant reservations
  - Activity bookings

#### Day-by-Day Itinerary
- Timeline view of the trip
- Each day can contain:
  - Activities (with times)
  - Dining reservations
  - Notes and ideas
- Drag-and-drop reordering capability

#### Activity Ideas & Research
- Freeform notes section
- Links to interesting activities, restaurants, attractions
- Shared research and recommendations

### 4. Collaboration Features
- Real-time updates when either user makes changes
- Simple user attribution ("Added by [name]")
- No complex permissions - both users have full edit access

## Screen Specifications

### Trip List Screen (Home)
**Layout:**
- Large title navigation bar: "Trips" with trip count subtitle
- Scrollable card list showing all trips
- Bottom tab navigation (Trips, Wishlist, Profile)

**Trip Card Contents:**
- Destination name (24px, bold)
- Dates with calendar icon (14px, monospace, gray)
- Budget progress bar (visual + text: $spent / $total)
- Status badge (UPCOMING, PLANNING, COMPLETED)
- Chevron right for navigation affordance
- Entire card is tappable

**Actions:**
- Tap card → Trip Detail Screen
- Pull to refresh → Sync with server
- "Plan New Trip" button at bottom of list

### Trip Detail Screen
**Layout:**
- Navigation bar with back button (orange chevron), destination title, dates
- Scrollable content sections
- Fixed CTA button at bottom

**Content Sections (as cards):**

1. **Budget Card**
   - Section header with dollar icon
   - Two-column layout: "Spent" (left), "Remaining" (right, orange)
   - Large monospace numbers
   - Progress bar showing percentage used
   - Tap card to edit budget

2. **Weather Card** (NEW - Phase 2)
   - Section header with cloud icon (#8E8E93)
   - "5-Day Forecast" label
   - Horizontal scrolling day cards (5 cards, 80px each)
   - Each day card contains:
     - Day label (TODAY, MON, TUE, etc.) - uppercase, gray
     - Monochrome weather icon (24px, line-style, gray)
     - High temp (white, 18px, medium)
     - Low temp (gray, 16px, regular)
     - Condition text (gray, 13px) - "Partly Cloudy", "Rainy", etc.
     - Precipitation % if >30% (gray text, orange if >70%)
   - "Last updated" timestamp below scroll (11px, italic, gray)
   - Current conditions (if trip starts within 24 hours):
     - Larger display above 5-day forecast
     - Current temp (32px, white)
     - "Feels like" (14px, gray)
     - Current condition with icon
   - Tap card to refresh weather data (if online)
   - Offline: Shows cached data with age indicator

3. **Bookings Card**
   - Section header with plane icon
   - List of bookings (Flight, Hotel, Car, etc.)
   - Each booking shows: type label, name, details, confirmation number
   - Swipe left to edit/delete
   - "+ Add Booking" button at bottom

4. **Itinerary Card**
   - Section header with calendar icon
   - Day-by-day breakdown
   - Each day: bold day label + activity description
   - Weather icon per day (from forecast, small, inline)
   - Tap to expand/edit day
   - "+ Add Day" button at bottom

5. **Activity Ideas Card** (Phase 4)
   - Section header with lightbulb icon
   - Freeform notes and links
   - Research and recommendations
   - Collaborative editing

**Bottom CTA:**
- "Edit Trip Details" button (orange, full-width)
- Or contextual actions based on trip status

### Wishlist Screen
**Layout:**
- Large title navigation bar: "Wishlist"
- Scrollable list of destination cards
- Bottom tab navigation

**Wishlist Card Contents:**
- Destination name
- Brief notes/description
- Estimated budget range
- Added by attribution
- Heart icon (filled for current user's additions)

**Actions:**
- Swipe right → "Plan This Trip" (promotes to Trips)
- Tap card → Edit wishlist item
- Long press → Options menu (edit, delete)
- "+ Add Destination" button at bottom

### Profile Screen (Simple)
**Layout:**
- Large title navigation bar: "Profile"
- Settings and account info
- Bottom tab navigation

**Contents:**
- User names (both partners)
- Sync status indicator
- Dark mode toggle (if light mode added)
- Sign out button
- App version info

## Design Principles
- **iOS-Native Feel**: Mimics native iOS interactions and gestures
- **Mobile-Only**: Designed exclusively for iPhone, no desktop considerations
- **Offline-Capable**: Full functionality without internet connection
- **Dark Premium Minimalist**: Sophisticated, modern aesthetic with high contrast
- **Touch-Optimized**: iOS gestures - swipe to go back, pull to refresh, long press
- **Fast**: Instant interactions, smooth 60fps animations
- **Intuitive**: Follows iOS conventions with unique visual personality

## Visual Design System

### Design Aesthetic: Dark Premium Minimalist + Modern
A sophisticated blend of minimalism and bold modern design - dark, dramatic, and elegant with purposeful use of color.

### Color Palette - FINALIZED
- **Background**: Deep charcoal (#0A0A0A) - rich, not harsh
- **Surface/Cards**: Elevated dark gray (#1C1C1E)
- **Borders**: Subtle gray (#2C2C2E) - barely visible, just enough separation
- **Text Primary**: Pure white (#FFFFFF) - maximum contrast
- **Text Secondary**: Light gray (#8E8E93) - for labels and supporting text
- **Accent/Highlight**: Vibrant orange (#FF6B35) - "sunset orange"
  - Primary CTAs and buttons
  - Active/selected states
  - Progress bars and budget highlights
  - Navigation active states
  - Represents energy, adventure, sunsets, excitement
- **Success**: Muted green (#34C759) for confirmations
- **Warning/Alert**: Muted red (#FF453A) for destructive actions

### Typography
- **Headings**: SF Pro Display (Bold, 24-32px) - Dramatic, geometric
- **Subheadings**: SF Pro Display (Semibold, 18-20px)
- **Body**: SF Pro Text (Regular, 16-17px) - Clean, readable
- **Captions**: SF Pro Text (Regular, 13-14px) - Secondary info
- **Data/Numbers**: SF Mono (Medium) - Dates, prices, times
- **Spacing**: Generous line height (1.5-1.6) for readability

### Component Styling - DETAILED SPECIFICATIONS
- **Cards**: 
  - Background: #1C1C1E
  - Border: 1px solid #2C2C2E
  - Border radius: 12px
  - Padding: 20px
  - Margin bottom: 16px
  - No shadow (border provides separation)
  
- **Buttons**: 
  - Primary: Orange fill (#FF6B35), white text, 12px radius, 16px vertical padding
  - Secondary: Orange border (1px), orange text, 12px radius, 16px vertical padding
  - Tertiary: No border, orange text, tap feedback only
  - All buttons: Font weight 600 (semibold)
  - Active state: scale(0.98) transform
  
- **Inputs**: 
  - Dark background (#1C1C1E)
  - Bottom border only (1px solid #2C2C2E)
  - Orange border on focus (#FF6B35)
  - No heavy containers or rounded backgrounds
  - Padding: 12px 0
  
- **Navigation Bar**:
  - Large title: 34px, bold, white
  - Subtitle: 13px, #8E8E93, SF Pro Text
  - Padding: 64px top (accounts for status bar), 24px horizontal
  - Background: #0A0A0A
  
- **Tab Bar**:
  - Background: #1C1C1E
  - Border top: 1px solid #2C2C2E
  - Padding: 12px vertical + safe area inset bottom
  - Icons: 24px
  - Labels: 10px, medium weight
  - Active color: #FF6B35
  - Inactive color: #8E8E93
  
- **Lists**: 
  - Dividers: 1px solid #2C2C2E (only between items, not after last)
  - Padding: 16-20px vertical per item
  - Swipe actions reveal: destructive (red), edit (gray)
  
- **Progress Bars**:
  - Height: 8px
  - Background: #2C2C2E
  - Fill: #FF6B35
  - Border radius: 4px (fully rounded)
  - Smooth animation on value change
  
- **Status Badges**:
  - Background: rgba(255, 107, 53, 0.15) for orange
  - Text: #FF6B35
  - Border radius: 999px (pill shape)
  - Padding: 4px 12px
  - Font: 11px, bold, uppercase, letter-spacing: 0.5px
  
- **Icons**: 
  - Line-style icons from Lucide React
  - Consistent 18-20px size in content
  - 24px size in navigation
  - Primary color for active, #8E8E93 for inactive

- **Weather Components** (NEW):
  - **Weather Icons**: Monochrome line-style, 24px, color #8E8E93 (muted gray)
  - **Temperatures**: 
    - High temp: White (#FFFFFF), 18px, medium weight
    - Low temp: Gray (#8E8E93), 16px, regular weight
    - NO color coding (no reds/blues)
  - **Condition Text**: #8E8E93, 13px, regular
  - **Precipitation**: 
    - Percentage in #8E8E93
    - Only use orange (#FF6B35) if >70% (warrants attention)
    - Small drop icon in gray
  - **Day Labels**: 
    - "Today" or weekday abbreviation (Mon, Tue, etc.)
    - 12px, uppercase, #8E8E93, letter-spacing: 0.5px
  - **Layout**: Horizontal scroll with 5 day cards
    - Each day card: 80px wide, 100px tall
    - Gap between cards: 12px
    - Card background: #1C1C1E (same as other cards)
    - Subtle border: #2C2C2E
  - **Last Updated Timestamp**: 
    - Small text below forecast: "Updated 2 hours ago"
    - 11px, #8E8E93, italic
    - Shows data freshness for offline use

### Visual Principles
- **High Contrast**: Pure white text on deep black backgrounds
- **Generous Spacing**: Every element has room to breathe (16-24-32px scale)
- **Minimal Ornamentation**: No unnecessary decorative elements
- **Purpose-Driven Color**: Orange only where it matters (CTAs, active states, highlights)
- **Geometric Clarity**: Clean lines, consistent corner radii, aligned elements
- **Dramatic but Elegant**: Bold choices that still feel refined

## iOS-Native Design Patterns

### Navigation
- **Tab Bar**: Bottom navigation with icons (iOS standard)
  - Trips (house or suitcase icon)
  - Wishlist (heart or bookmark icon)
  - Profile (person icon)
- **Navigation Bar**: Top bar with large title that collapses on scroll
- **Swipe Back**: Standard iOS swipe-from-left to go back
- **Pull to Refresh**: Native iOS pull-to-refresh on lists

### Visual Design
- **Typography**: San Francisco font (system default)
- **Colors**: iOS system colors with light/dark mode support
- **Spacing**: iOS standard spacing (8, 16, 24, 32px)
- **Cards**: Rounded corners (12-16px radius), subtle shadows
- **Lists**: iOS-style grouped lists with separators
- **Buttons**: Rounded, iOS-style primary/secondary/tertiary buttons

### Interactions
- **Haptic Feedback**: Subtle vibrations for actions
- **Animations**: Smooth, physics-based (spring animations)
- **Modals**: Sheet-style modals that slide up from bottom
- **Action Sheets**: iOS bottom sheets for options/actions
- **Swipe Actions**: Swipe left on list items for delete/edit
- **Long Press**: Contextual menus on long press

### Gestures
- Swipe left to delete
- Swipe right on edges to go back
- Pull down to dismiss modals
- Pull to refresh lists
- Pinch to zoom (if images added later)

### Status Bar & Safe Areas
- Respect iOS safe areas (notch, home indicator)
- Status bar styling (light/dark based on background)
- Full-screen modals account for safe area insets

### No Desktop Support
- Viewport locked to mobile widths
- No responsive breakpoints needed
- Single, focused mobile experience
- Desktop users see mobile view (or a message to use iPhone)

## Future Considerations (Out of Scope for V1)
- Photo attachments for trips and destinations
- Expense breakdown by category (food, activities, transport)
- Integration with flight/hotel booking sites
- Shared packing lists with checkboxes
- **Interactive mapping** - Show destinations and activity locations on map (Phase 3+)
- Trip timeline/calendar view across all trips
- Export trip details to PDF or shareable format
- Push notifications for trip reminders
- Travel document storage (boarding passes, etc.)
- Collaborative chat/comments per trip
- Budget alerts when approaching limit
- Currency conversion for international trips

## Success Metrics
Since this is a personal tool, success means:
- Both partners actively use it
- Reduces planning friction and scattered information
- Makes trip planning more collaborative and fun
- All trip details accessible in one place

## Development Phases

### Phase 1: PWA Foundation & iOS Setup
- Set up React app with PWA template
- Configure iOS-specific meta tags and manifest
- Implement safe area handling
- Configure service worker for offline capability
- Set up IndexedDB for local storage
- Basic authentication (2 users) via Supabase
- Database schema in Supabase
- iOS-style bottom tab navigation
- Create/edit/delete trips (offline-capable)
- Basic sync mechanism

### Phase 2: Trip Details & Offline Sync
- Budget tracker with iOS-native inputs
- Bookings manager with swipe actions
- Basic itinerary builder
- **Weather integration (5-day forecast + current conditions)**
- Robust offline/online sync
- Conflict resolution for simultaneous edits
- Loading states and sync indicators (iOS style)
- Pull to refresh implementation

### Phase 3: Collaboration & Polish
- Wishlist feature with swipe to plan
- Real-time updates when both online
- iOS animation polish (spring animations)
- Haptic feedback for actions
- Dark mode support
- PWA install prompts (Add to Home Screen)

### Phase 4: Enhancement
- Activity ideas section
- Trip status workflow with iOS transitions
- Search with iOS-style search bar
- Background sync improvements
- Performance optimization for 60fps
- Long press contextual menus

## Technical Considerations
- **Authentication**: Simple email/password through Supabase Auth
- **Database**: PostgreSQL via Supabase
- **Real-time**: Supabase real-time subscriptions for live collaboration when online
- **Offline Architecture**:
  - IndexedDB for local data storage
  - Service Worker for asset caching and offline routing
  - Background sync for queuing changes made offline
  - Conflict resolution strategy for simultaneous offline edits
- **PWA Requirements for iOS**:
  - Web app manifest with `display: "standalone"`
  - Apple-specific meta tags for status bar and splash screens
  - Service worker registration
  - HTTPS (automatic with Netlify)
  - Touch icons for home screen (180x180px minimum)
  - Viewport meta tag with viewport-fit=cover for safe areas
  - No URL bar when installed
- **iOS-Specific Optimizations**:
  - CSS safe area insets (env() variables)
  - `-webkit-tap-highlight-color` disabled
  - `-webkit-touch-callout` disabled for better native feel
  - Momentum scrolling enabled
  - Fixed position elements respect safe areas
  - Prevent zoom on form inputs
- **Sync Strategy**:
  - Optimistic UI updates (instant feedback)
  - Local-first: all reads from IndexedDB
  - Writes go to local DB immediately, queue for Supabase sync
  - Background sync when connection restored
  - Last-write-wins for conflict resolution (acceptable for 2-user app)
- **Deployment**: Continuous deployment via Netlify + GitHub
- **Data Model**: 
  - Tables: Users, Trips, Bookings, Itinerary Items, Wishlist Items, Weather Cache
  - Weather Cache stores: trip_id, forecast_data (JSON), current_conditions (JSON), fetched_at timestamp
- **Weather API Integration**:
  - OpenWeather API or WeatherAPI (free tier, 1000 calls/day sufficient)
  - Fetch on: trip creation (if dates set), trip detail view (if >4 hours since last fetch), manual refresh
  - Cache strategy: Store in Supabase + IndexedDB for offline
  - Rate limiting: Max 1 fetch per trip per 4 hours
  - Fallback: If API fails, show cached data with clear timestamp
- **Mobile Optimization**:
  - Lazy loading for images (if added)
  - Code splitting for faster initial load
  - Compressed assets
  - Minimal bundle size (<200kb)
  - Smooth 60fps animations using CSS transforms
  - Haptic feedback via Vibration API