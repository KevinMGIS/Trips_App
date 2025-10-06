// Database type definitions for Trip Planner App
// These types match the Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      activity_ideas: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          description: string | null;
          category: string | null;
          url: string | null;
          estimated_cost: number | null;
          estimated_duration_hours: number | null;
          location: string | null;
          notes: string | null;
          is_favorited: boolean | null;
          added_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          url?: string | null;
          estimated_cost?: number | null;
          estimated_duration_hours?: number | null;
          location?: string | null;
          notes?: string | null;
          is_favorited?: boolean | null;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          url?: string | null;
          estimated_cost?: number | null;
          estimated_duration_hours?: number | null;
          location?: string | null;
          notes?: string | null;
          is_favorited?: boolean | null;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_ideas_added_by_fkey';
            columns: ['added_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_ideas_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          trip_id: string;
          type:
            | 'flight'
            | 'hotel'
            | 'car'
            | 'restaurant'
            | 'activity'
            | 'other';
          title: string;
          confirmation_number: string | null;
          cost: number | null;
          airline: string | null;
          flight_number: string | null;
          departure_airport: string | null;
          arrival_airport: string | null;
          departure_time: string | null;
          arrival_time: string | null;
          hotel_name: string | null;
          check_in_date: string | null;
          check_out_date: string | null;
          address: string | null;
          start_datetime: string | null;
          end_datetime: string | null;
          location: string | null;
          notes: string | null;
          url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          type:
            | 'flight'
            | 'hotel'
            | 'car'
            | 'restaurant'
            | 'activity'
            | 'other';
          title: string;
          confirmation_number?: string | null;
          cost?: number | null;
          airline?: string | null;
          flight_number?: string | null;
          departure_airport?: string | null;
          arrival_airport?: string | null;
          departure_time?: string | null;
          arrival_time?: string | null;
          hotel_name?: string | null;
          check_in_date?: string | null;
          check_out_date?: string | null;
          address?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          location?: string | null;
          notes?: string | null;
          url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          type?:
            | 'flight'
            | 'hotel'
            | 'car'
            | 'restaurant'
            | 'activity'
            | 'other';
          title?: string;
          confirmation_number?: string | null;
          cost?: number | null;
          airline?: string | null;
          flight_number?: string | null;
          departure_airport?: string | null;
          arrival_airport?: string | null;
          departure_time?: string | null;
          arrival_time?: string | null;
          hotel_name?: string | null;
          check_in_date?: string | null;
          check_out_date?: string | null;
          address?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          location?: string | null;
          notes?: string | null;
          url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      itinerary_items: {
        Row: {
          id: string;
          trip_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          title: string;
          description: string | null;
          location: string | null;
          cost: number | null;
          url: string | null;
          notes: string | null;
          sort_order: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          cost?: number | null;
          url?: string | null;
          notes?: string | null;
          sort_order?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          title?: string;
          description?: string | null;
          location?: string | null;
          cost?: number | null;
          url?: string | null;
          notes?: string | null;
          sort_order?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_items_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_items_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          partner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          partner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          partner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_partner_id_fkey';
            columns: ['partner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      trips: {
        Row: {
          id: string;
          title: string;
          destination: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          status: 'planning' | 'upcoming' | 'completed';
          budget_amount: number | null;
          budget_spent: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          destination: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'planning' | 'upcoming' | 'completed';
          budget_amount?: number | null;
          budget_spent?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          destination?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'planning' | 'upcoming' | 'completed';
          budget_amount?: number | null;
          budget_spent?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      weather_cache: {
        Row: {
          id: string;
          trip_id: string;
          location: string;
          forecast_date: string;
          current_conditions: Json | null;
          daily_forecast: Json | null;
          api_source: string | null;
          fetched_at: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          location: string;
          forecast_date: string;
          current_conditions?: Json | null;
          daily_forecast?: Json | null;
          api_source?: string | null;
          fetched_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          location?: string;
          forecast_date?: string;
          current_conditions?: Json | null;
          daily_forecast?: Json | null;
          api_source?: string | null;
          fetched_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'weather_cache_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          destination: string;
          description: string | null;
          estimated_budget_min: number | null;
          estimated_budget_max: number | null;
          priority_level: number | null;
          notes: string | null;
          added_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          destination: string;
          description?: string | null;
          estimated_budget_min?: number | null;
          estimated_budget_max?: number | null;
          priority_level?: number | null;
          notes?: string | null;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          destination?: string;
          description?: string | null;
          estimated_budget_min?: number | null;
          estimated_budget_max?: number | null;
          priority_level?: number | null;
          notes?: string | null;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishlist_items_added_by_fkey';
            columns: ['added_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_expired_weather_cache: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      is_authenticated: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_authorized_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      booking_type:
        | 'flight'
        | 'hotel'
        | 'car'
        | 'restaurant'
        | 'activity'
        | 'other';
      trip_status: 'planning' | 'upcoming' | 'completed';
      weather_condition:
        | 'clear'
        | 'partly_cloudy'
        | 'cloudy'
        | 'rainy'
        | 'snowy'
        | 'stormy'
        | 'foggy';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Trip = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type TripUpdate = Database['public']['Tables']['trips']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type ItineraryItem =
  Database['public']['Tables']['itinerary_items']['Row'];
export type ItineraryItemInsert =
  Database['public']['Tables']['itinerary_items']['Insert'];
export type ItineraryItemUpdate =
  Database['public']['Tables']['itinerary_items']['Update'];

export type WishlistItem =
  Database['public']['Tables']['wishlist_items']['Row'];
export type WishlistItemInsert =
  Database['public']['Tables']['wishlist_items']['Insert'];
export type WishlistItemUpdate =
  Database['public']['Tables']['wishlist_items']['Update'];

export type ActivityIdea =
  Database['public']['Tables']['activity_ideas']['Row'];
export type ActivityIdeaInsert =
  Database['public']['Tables']['activity_ideas']['Insert'];
export type ActivityIdeaUpdate =
  Database['public']['Tables']['activity_ideas']['Update'];

export type WeatherCache = Database['public']['Tables']['weather_cache']['Row'];
export type WeatherCacheInsert =
  Database['public']['Tables']['weather_cache']['Insert'];
export type WeatherCacheUpdate =
  Database['public']['Tables']['weather_cache']['Update'];

// Enum types for easier usage
export type TripStatus = Database['public']['Enums']['trip_status'];
export type BookingType = Database['public']['Enums']['booking_type'];
export type WeatherCondition = Database['public']['Enums']['weather_condition'];
