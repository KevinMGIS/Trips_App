// Trip status types
export type TripStatus = 'planning' | 'upcoming' | 'completed'

// Base trip interface
export interface Trip {
  id: string
  title: string
  destination: string
  description?: string
  start_date?: string
  end_date?: string
  status: TripStatus
  budget_amount?: number
  budget_spent: number
  created_by: string
  created_at: string
  updated_at: string
}

// Booking types
export type BookingType = 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other'

export interface Booking {
  id: string
  trip_id: string
  type: BookingType
  title: string
  confirmation_number?: string
  details?: string
  date?: string
  time?: string
  cost?: number
  created_at: string
  updated_at: string
}

// Itinerary item
export interface ItineraryItem {
  id: string
  trip_id: string
  day_number: number
  time?: string
  title: string
  description?: string
  location?: string
  cost?: number
  created_at: string
  updated_at: string
}

// Wishlist item
export interface WishlistItem {
  id: string
  destination: string
  description?: string
  budget_estimate?: number
  priority: number
  added_by: string
  created_at: string
  updated_at: string
}

// User profile
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  partner_id?: string
  created_at: string
  updated_at: string
}

// Weather data
export interface WeatherData {
  id: string
  trip_id: string
  forecast_data: {
    current?: {
      temp: number
      condition: string
      icon: string
      humidity: number
      wind_speed: number
    }
    daily: Array<{
      date: string
      temp_high: number
      temp_low: number
      condition: string
      icon: string
      precipitation_probability: number
    }>
  }
  fetched_at: string
}

// Form data types
export interface CreateTripData {
  title: string
  destination: string
  description?: string
  start_date?: string
  end_date?: string
  budget_amount?: number
}

export interface CreateBookingData {
  type: BookingType
  title: string
  confirmation_number?: string
  details?: string
  date?: string
  time?: string
  cost?: number
}

export interface CreateItineraryItemData {
  day_number: number
  time?: string
  title: string
  description?: string
  location?: string
  cost?: number
}

export interface CreateWishlistItemData {
  destination: string
  description?: string
  budget_estimate?: number
  priority: number
}