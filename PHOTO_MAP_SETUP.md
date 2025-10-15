# Photo Map Feature - Setup & Testing Guide

## ✅ What's Been Implemented

### 1. **EXIF Data Extraction** (photoService.ts)
- Extracts GPS coordinates (latitude/longitude) from photo EXIF data
- Extracts date taken from EXIF DateTimeOriginal
- Extracts camera make and model
- Uses the `exifr` library (already installed)

### 2. **Photo Map Component** (PhotoMap.tsx)
- Interactive Leaflet map showing photos with GPS coordinates
- Markers for each geotagged photo
- Click markers to see photo popup with thumbnail and details
- Auto-zooms to fit all photo markers
- Shows helpful message when no GPS photos exist

### 3. **Look Back Page** (LookBackPage.tsx)
- Trip filter dropdown to view photos from specific trips or all trips
- Photo Map integration with real-time filtering
- Photo sidebar showing recent photos
- Dynamic stats (photos count, countries, trips, GPS locations)
- Photo upload modal integration

### 4. **Photo Upload** (PhotoUpload.tsx)
- Drag and drop or file selection
- Automatic EXIF extraction during upload
- Progress tracking with visual feedback
- Batch upload support
- Trip selection

### 5. **Database Schema** (setup_photos.sql)
Complete `trip_photos` table with:
- GPS coordinates (latitude/longitude)
- EXIF metadata (camera make/model, date taken)
- File information (URL, size, type)
- Location name field for reverse geocoding
- RLS policies for security
- Storage bucket setup

---

## 🔧 Required Setup Steps

### Step 1: Run Database Schema

Run the SQL script to create the photos table and storage bucket:

```sql
-- In Supabase SQL Editor, run:
-- File: database/setup_photos.sql
```

This will:
- Create the `trip_photos` table with all necessary columns
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Create RLS policies for user access
- Create the 'trip-photos' storage bucket
- Set up storage policies

### Step 2: Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Verify the `trip-photos` bucket exists
3. If it doesn't exist, create it manually:
   - Name: `trip-photos`
   - Public: ✅ Yes (for serving images)

### Step 3: Install Dependencies (Already Done)

The following packages are already installed:
- ✅ `leaflet` - Map library
- ✅ `react-leaflet` - React bindings for Leaflet
- ✅ `@types/leaflet` - TypeScript types
- ✅ `exifr` - EXIF data extraction

---

## 🧪 How to Test

### Test 1: Upload a Photo with GPS Data

1. **Navigate to Look Back page** (Map icon in header)
2. **Click "Upload Photos" button**
3. **Select a trip from dropdown**
4. **Upload a photo that has GPS data** (typically photos from smartphones)
   - Note: Most photos from iPhone/Android have GPS data if location was enabled
   - Desktop camera photos often don't have GPS
5. **Watch the upload progress**:
   - Status will show: Pending → Uploading (25%) → Processing (50%) → Success (100%)
6. **Close modal** - photo should appear on map and in sidebar

### Test 2: Verify EXIF Extraction

1. Open browser console (F12)
2. Upload a photo
3. Look for console log: `"Extracted EXIF data:"` followed by the data object
4. Should show:
   ```javascript
   {
     latitude: 40.7128,
     longitude: -74.0060,
     takenAt: "2024-01-15T10:30:00.000Z",
     cameraMake: "Apple",
     cameraModel: "iPhone 14 Pro"
   }
   ```

### Test 3: Map Display

1. After uploading photo(s) with GPS:
   - Map should display with markers at photo locations
   - Map should auto-zoom to fit all markers
2. Click a marker:
   - Popup should appear with photo thumbnail
   - Should show title, location, and date
3. If no GPS photos:
   - Should show message: "No photos with GPS data yet"

### Test 4: Trip Filtering

1. Upload photos to multiple different trips
2. Use the trip filter dropdown at the top
3. Select a specific trip:
   - Map should only show photos from that trip
   - Sidebar should only show photos from that trip
   - Stats should update to reflect that trip only
4. Select "All Trips":
   - Should show all photos again

### Test 5: Stats Verification

The stats cards should show:
- **Photos Uploaded**: Total number of filtered photos
- **Countries Visited**: Unique location names (based on photos with location_name)
- **Trip Memories**: Number of trips (1 if filtered, count if "All Trips")
- **Locations Tagged**: Number of photos with GPS coordinates

---

## 📸 Getting Photos with GPS Data

### Option 1: Use Your Phone
- Take new photos with an iPhone or Android phone (location services enabled)
- AirDrop or email them to your computer
- Upload to the app

### Option 2: Use Sample Photos
If you need test photos with GPS:
1. Download from: https://github.com/ianare/exif-samples/tree/master/jpg
2. Or use: http://www.exif.org/samples.html

### Option 3: Add GPS to Existing Photos
- Use a tool like ExifTool to add GPS data to existing photos
- Or use online services like GeoImgr.com

---

## 🐛 Troubleshooting

### Photos upload but don't appear on map

**Check:**
1. Open browser console - look for errors
2. Verify photo has GPS data (console should log EXIF data)
3. Check Supabase database - is photo record created?
4. Check latitude/longitude fields are not null

**Fix:**
- Upload a different photo that definitely has GPS
- Check browser console for EXIF extraction errors

### "No photos with GPS data yet" even after upload

**Check:**
1. Browser console for: `"Extracted EXIF data:"` log
2. If EXIF data is empty `{}`, the photo has no GPS metadata
3. Try a photo from a smartphone with location enabled

### Map not loading / blank map

**Check:**
1. Browser console for Leaflet errors
2. Check network tab - are map tiles loading from OpenStreetMap?
3. Try refreshing the page

**Fix:**
- Clear browser cache
- Check internet connection (map tiles are downloaded)
- Look for CORS or CSP errors in console

### Upload fails

**Check:**
1. Console errors
2. Supabase Storage bucket exists and is public
3. RLS policies allow authenticated users to upload

**Fix:**
- Run the storage policies from `setup_photos.sql`
- Verify user is authenticated
- Check Supabase logs in dashboard

---

## 🎯 Expected Behavior

### Successful Upload Flow:
1. User selects trip
2. User drops/selects photo(s)
3. Photos appear in preview grid
4. Click "Upload All"
5. Each photo shows progress: Pending → Uploading → Processing → Success
6. EXIF data extracted (logged to console)
7. File uploaded to Supabase Storage (`trip-photos` bucket)
8. Database record created in `trip_photos` table
9. Modal closes
10. Photo appears on map (if has GPS)
11. Photo appears in sidebar
12. Stats update

### With GPS Data:
- ✅ Photo marker appears on map at correct location
- ✅ Clicking marker shows popup with thumbnail
- ✅ "Locations Tagged" stat increments

### Without GPS Data:
- ℹ️ Photo appears in sidebar only
- ℹ️ No marker on map
- ℹ️ "Locations Tagged" stat stays same

---

## 📊 Database Verification

To verify photos are being saved correctly, run in Supabase SQL Editor:

```sql
-- Check all photos
SELECT 
  id,
  trip_id,
  title,
  latitude,
  longitude,
  taken_at,
  camera_make,
  camera_model,
  created_at
FROM trip_photos
ORDER BY created_at DESC;

-- Check only photos with GPS
SELECT 
  id,
  trip_id,
  latitude,
  longitude,
  location_name
FROM trip_photos
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- Check photos per trip
SELECT 
  t.title as trip_name,
  COUNT(tp.id) as photo_count,
  COUNT(tp.latitude) as photos_with_gps
FROM trips t
LEFT JOIN trip_photos tp ON t.id = tp.trip_id
GROUP BY t.id, t.title
ORDER BY photo_count DESC;
```

---

## 🚀 Next Enhancements (Optional)

If you want to enhance this further:

1. **Reverse Geocoding**: Implement `getLocationName()` to convert GPS coordinates to place names
   - Use Nominatim API (free): https://nominatim.org/release-docs/develop/api/Reverse/
   
2. **Photo Clustering**: Group nearby photos into clusters on the map
   - Use `react-leaflet-markercluster`

3. **Photo Gallery Modal**: Click photo in sidebar to view full-size in modal

4. **Photo Editing**: Allow users to edit title, caption, location after upload

5. **Bulk Operations**: Delete multiple photos at once

6. **Timeline View**: Show photos chronologically based on `taken_at` date

7. **Thumbnail Generation**: Use Supabase Image Transformations to generate thumbnails
   - Update `generateThumbnailUrl()` in photoService.ts

---

## ✨ Summary

You now have a fully functional photo map feature:
- ✅ Upload photos with EXIF extraction
- ✅ Interactive map with photo markers
- ✅ Trip filtering
- ✅ Photo sidebar with thumbnails
- ✅ Dynamic stats
- ✅ Secure database with RLS

**Ready to test!** Just need to run the database setup SQL and upload some photos with GPS data.
