export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          title: string
          destination: string
          description: string | null
          start_date: string | null
          end_date: string | null
          status: 'planning' | 'upcoming' | 'completed'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          destination: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'upcoming' | 'completed'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          destination?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'planning' | 'upcoming' | 'completed'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          trip_id: string
          type: 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other'
          title: string
          confirmation_number: string | null
          details: string | null
          date: string | null
          time: string | null
          cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          type: 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other'
          title: string
          confirmation_number?: string | null
          details?: string | null
          date?: string | null
          time?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          type?: 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other'
          title?: string
          confirmation_number?: string | null
          details?: string | null
          date?: string | null
          time?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_items: {
        Row: {
          id: string
          trip_id: string
          day_number: number
          time: string | null
          title: string
          description: string | null
          location: string | null
          cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day_number: number
          time?: string | null
          title: string
          description?: string | null
          location?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day_number?: number
          time?: string | null
          title?: string
          description?: string | null
          location?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          destination: string
          description: string | null
          priority: number
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          destination: string
          description?: string | null
          priority: number
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          destination?: string
          description?: string | null
          priority?: number
          added_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      weather_cache: {
        Row: {
          id: string
          trip_id: string
          forecast_data: Json
          fetched_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          forecast_data: Json
          fetched_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          forecast_data?: Json
          fetched_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          partner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          partner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          partner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      trip_status: 'planning' | 'upcoming' | 'completed'
      booking_type: 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}