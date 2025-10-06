import { supabase } from './supabase'
import type { Trip, NewTrip } from '../types/database'

export class TripService {
  // Create a new trip
  static async createTrip(tripData: NewTrip): Promise<{ data: Trip | null; error: any }> {
    try {
      console.log('TripService.createTrip called with:', tripData)
      
      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select('*')
        .single()

      console.log('Supabase response:', { data, error })
      return { data, error }
    } catch (error) {
      console.error('Error in createTrip:', error)
      return { data: null, error }
    }
  }

  // Get trips for a user (trips they own or participate in)
  static async getUserTrips(userId: string): Promise<{ data: Trip[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .or(`created_by.eq.${userId},trip_participants.user_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error in getUserTrips:', error)
      return { data: null, error }
    }
  }

  // Get a single trip by ID
  static async getTripById(tripId: string): Promise<{ data: Trip | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error in getTripById:', error)
      return { data: null, error }
    }
  }

  // Update a trip
  static async updateTrip(tripId: string, updates: Partial<Trip>): Promise<{ data: Trip | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error in updateTrip:', error)
      return { data: null, error }
    }
  }

  // Delete a trip
  static async deleteTrip(tripId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      return { error }
    } catch (error) {
      console.error('Error in deleteTrip:', error)
      return { error }
    }
  }

  // Add a participant to a trip
  static async addParticipant(tripId: string, userId: string, role: 'owner' | 'collaborator' | 'viewer' = 'collaborator'): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('trip_participants')
        .insert([{
          trip_id: tripId,
          user_id: userId,
          role: role,
          status: 'pending'
        }])

      return { error }
    } catch (error) {
      console.error('Error in addParticipant:', error)
      return { error }
    }
  }

  // Update trip budget spent
  static async updateBudgetSpent(tripId: string, newAmount: number): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ budget_spent: newAmount })
        .eq('id', tripId)

      return { error }
    } catch (error) {
      console.error('Error in updateBudgetSpent:', error)
      return { error }
    }
  }

  // Get trip statistics
  static async getTripStats(tripId: string): Promise<{ 
    data: { 
      totalBookings: number; 
      totalSpent: number; 
      itineraryItems: number; 
      participants: number 
    } | null; 
    error: any 
  }> {
    try {
      // Get bookings count and total cost
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('cost')
        .eq('trip_id', tripId)

      if (bookingsError) {
        return { data: null, error: bookingsError }
      }

      // Get itinerary items count
      const { count: itineraryCount, error: itineraryError } = await supabase
        .from('itinerary_items')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)

      if (itineraryError) {
        return { data: null, error: itineraryError }
      }

      // Get participants count
      const { count: participantsCount, error: participantsError } = await supabase
        .from('trip_participants')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)

      if (participantsError) {
        return { data: null, error: participantsError }
      }

      const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.cost || 0), 0) || 0

      return {
        data: {
          totalBookings: bookings?.length || 0,
          totalSpent,
          itineraryItems: itineraryCount || 0,
          participants: (participantsCount || 0) + 1 // +1 for the trip owner
        },
        error: null
      }
    } catch (error) {
      console.error('Error in getTripStats:', error)
      return { data: null, error }
    }
  }
}

// Trip status helpers
export const TripStatus = {
  PLANNING: 'planning' as const,
  BOOKED: 'booked' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case TripStatus.PLANNING:
      return 'bg-blue-100 text-blue-700'
    case TripStatus.BOOKED:
      return 'bg-green-100 text-green-700'
    case TripStatus.IN_PROGRESS:
      return 'bg-orange-100 text-orange-700'
    case TripStatus.COMPLETED:
      return 'bg-gray-100 text-gray-700'
    case TripStatus.CANCELLED:
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case TripStatus.PLANNING:
      return 'Planning'
    case TripStatus.BOOKED:
      return 'Booked'
    case TripStatus.IN_PROGRESS:
      return 'In Progress'
    case TripStatus.COMPLETED:
      return 'Completed'
    case TripStatus.CANCELLED:
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}