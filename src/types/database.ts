// Database types for the trip planning application
// These should match the Supabase database schema

export interface UserProfile {
  id: string
  display_name?: string
  avatar_url?: string
  phone?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  title: string
  description?: string
  destination: string
  destination_lat?: number
  destination_lng?: number
  start_date: string
  end_date: string
  status: 'planning' | 'booked' | 'in_progress' | 'completed' | 'cancelled'
  cover_image_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Type for creating a new trip (without id, created_at, updated_at)
export interface NewTrip {
  title: string
  description?: string
  destination: string
  destination_lat?: number
  destination_lng?: number
  start_date: string
  end_date: string
  status: 'planning' | 'booked' | 'in_progress' | 'completed' | 'cancelled'
  cover_image_url?: string
  created_by: string
}

export interface TripParticipant {
  id: string
  trip_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer' | 'participant'
  invited_by?: string
  invited_at: string
  accepted_at?: string
  status: 'pending' | 'accepted' | 'declined'
}

export interface ItineraryItem {
  id: string
  trip_id: string
  title: string
  description?: string
  category: 'flight' | 'accommodation' | 'activity' | 'restaurant' | 'transport' | 'other'
  start_datetime: string
  end_datetime?: string
  location?: string
  location_lat?: number
  location_lng?: number
  cost?: number
  confirmation_number?: string
  notes?: string
  booking_url?: string
  contact_info?: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
}

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
  priority?: 'high' | 'medium' | 'low'
  created_by?: string
}

export interface Booking {
  id: string
  trip_id: string
  itinerary_item_id?: string
  type: 'flight' | 'hotel' | 'car_rental' | 'restaurant' | 'activity' | 'other'
  provider: string
  confirmation_number: string
  booking_reference?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_cost: number
  currency: string
  booking_date: string
  checkin_date?: string
  checkout_date?: string
  passenger_details?: Record<string, any>
  booking_details?: Record<string, any>
  cancellation_policy?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface WeatherCache {
  id: string
  trip_id?: string
  location: string
  location_lat?: number
  location_lng?: number
  date: string
  weather_data: Record<string, any>
  api_provider: string
  created_at: string
  expires_at: string
}

// Enhanced types with relationships
export interface TripWithParticipants extends Trip {
  trip_participants?: TripParticipant[]
  itinerary_items?: ItineraryItem[]
  bookings?: Booking[]
  weather_cache?: WeatherCache[]
}

export interface ItineraryItemWithBooking extends ItineraryItem {
  booking?: Booking
}

export interface TripPhoto {
  id: string
  trip_id: string
  user_id: string
  title?: string
  description?: string
  photo_url: string
  thumbnail_url?: string
  latitude?: number
  longitude?: number
  location_name?: string
  taken_at?: string
  uploaded_at: string
  file_size?: number
  file_type?: string
  camera_make?: string
  camera_model?: string
  created_at: string
  updated_at: string
}

export interface NewTripPhoto {
  trip_id: string
  user_id: string
  title?: string
  description?: string
  photo_url: string
  thumbnail_url?: string
  latitude?: number
  longitude?: number
  location_name?: string
  taken_at?: string
  file_size?: number
  file_type?: string
  camera_make?: string
  camera_model?: string
}

export interface CreateTripData {
  title: string
  description?: string
  destination: string
  destination_lat?: number
  destination_lng?: number
  start_date: string
  end_date: string
  cover_image_url?: string
}

export interface CreateItineraryItemData {
  trip_id: string
  title: string
  description?: string
  category: ItineraryItem['category']
  start_datetime: string
  end_datetime?: string
  location?: string
  location_lat?: number
  location_lng?: number
  cost?: number
  confirmation_number?: string
  notes?: string
  booking_url?: string
  contact_info?: Record<string, any>
}

export interface CreateBookingData {
  trip_id: string
  itinerary_item_id?: string
  type: Booking['type']
  provider: string
  confirmation_number: string
  booking_reference?: string
  total_cost: number
  currency?: string
  checkin_date?: string
  checkout_date?: string
  passenger_details?: Record<string, any>
  booking_details?: Record<string, any>
  cancellation_policy?: string
}

// Legacy types for backward compatibility (will be removed)
export type TripStatus = Trip['status']
export type BookingType = Booking['type']