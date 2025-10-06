import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    return { data, error }
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  getSession: () => {
    return supabase.auth.getSession()
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helpers
export const db = {
  // Trips
  getTrips: async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getTripById: async (id: string) => {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        bookings (*),
        itinerary_items (*),
        weather_cache (*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  createTrip: async (tripData: any) => {
    const { data, error } = await supabase
      .from('trips')
      .insert([tripData])
      .select()
      .single()
    return { data, error }
  },

  updateTrip: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteTrip: async (id: string) => {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Bookings
  getBookings: async (tripId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: true })
    return { data, error }
  },

  createBooking: async (bookingData: any) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()
    return { data, error }
  },

  updateBooking: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  deleteBooking: async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Wishlist
  getWishlist: async () => {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .order('priority', { ascending: false })
    return { data, error }
  },

  createWishlistItem: async (itemData: any) => {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([itemData])
      .select()
      .single()
    return { data, error }
  },

  // Weather
  getWeatherCache: async (tripId: string) => {
    const { data, error } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('trip_id', tripId)
      .single()
    return { data, error }
  },

  updateWeatherCache: async (tripId: string, weatherData: any) => {
    const { data, error } = await supabase
      .from('weather_cache')
      .upsert({
        trip_id: tripId,
        forecast_data: weatherData,
        fetched_at: new Date().toISOString(),
      })
      .select()
      .single()
    return { data, error }
  },
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToTrips: (callback: (payload: any) => void) => {
    return supabase
      .channel('trips-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'trips' 
        }, 
        callback
      )
      .subscribe()
  },

  subscribeToTrip: (tripId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`trip-${tripId}-changes`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`
        },
        callback
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `trip_id=eq.${tripId}`
        },
        callback
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_items',
          filter: `trip_id=eq.${tripId}`
        },
        callback
      )
      .subscribe()
  },

  unsubscribe: (channel: any) => {
    return supabase.removeChannel(channel)
  },
}