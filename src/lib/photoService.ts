import { supabase } from './supabase'
import type { TripPhoto, NewTripPhoto } from '../types/database'

export class PhotoService {
  // Upload photo to Supabase Storage
  static async uploadPhoto(file: File, userId: string, tripId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${tripId}/${Date.now()}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('trip-photos')
        .upload(fileName, file)

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(fileName)

      return { data: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading photo:', error)
      return { data: null, error }
    }
  }

  // Extract EXIF data from photo (placeholder - will use exifr when available)
  static async extractEXIFData(file: File): Promise<{
    latitude?: number
    longitude?: number
    takenAt?: string
    cameraMake?: string
    cameraModel?: string
  }> {
    try {
      // Dynamically import exifr to extract metadata
      const exifr = await import('exifr')
      
      // Parse EXIF data from the file - pass true to parse all available data
      const data = await exifr.parse(file, true)

      if (!data) {
        console.log('No EXIF data found in image')
        return {}
      }

      const result: {
        latitude?: number
        longitude?: number
        takenAt?: string
        cameraMake?: string
        cameraModel?: string
      } = {}

      // Extract GPS coordinates
      if (data.latitude && data.longitude) {
        result.latitude = data.latitude
        result.longitude = data.longitude
      }

      // Extract date taken
      if (data.DateTimeOriginal) {
        result.takenAt = new Date(data.DateTimeOriginal).toISOString()
      } else if (data.CreateDate) {
        result.takenAt = new Date(data.CreateDate).toISOString()
      }

      // Extract camera information
      if (data.Make) {
        result.cameraMake = data.Make
      }
      if (data.Model) {
        result.cameraModel = data.Model
      }

      console.log('Extracted EXIF data:', result)
      return result
    } catch (error) {
      console.error('Error extracting EXIF data:', error)
      return {}
    }
  }

  // Create photo record in database
  static async createPhoto(photoData: NewTripPhoto): Promise<{ data: TripPhoto | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trip_photos')
        .insert([photoData])
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating photo record:', error)
      return { data: null, error }
    }
  }

  // Get photos for a user
  static async getUserPhotos(userId: string): Promise<{ data: TripPhoto[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trip_photos')
        .select(`
          *,
          trips!inner(id, title, destination)
        `)
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error fetching user photos:', error)
      return { data: null, error }
    }
  }

  // Get photos for a specific trip
  static async getTripPhotos(tripId: string): Promise<{ data: TripPhoto[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trip_photos')
        .select('*')
        .eq('trip_id', tripId)
        .order('taken_at', { ascending: true })

      return { data, error }
    } catch (error) {
      console.error('Error fetching trip photos:', error)
      return { data: null, error }
    }
  }

  // Get photos with coordinates for map display
  static async getPhotosWithCoordinates(userId: string): Promise<{ data: TripPhoto[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trip_photos')
        .select(`
          *,
          trips!inner(id, title, destination)
        `)
        .eq('user_id', userId)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('taken_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error fetching photos with coordinates:', error)
      return { data: null, error }
    }
  }

  // Update photo information
  static async updatePhoto(photoId: string, updates: Partial<TripPhoto>): Promise<{ data: TripPhoto | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('trip_photos')
        .update(updates)
        .eq('id', photoId)
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating photo:', error)
      return { data: null, error }
    }
  }

  // Delete photo
  static async deletePhoto(photoId: string, photoUrl: string): Promise<{ error: any }> {
    try {
      // Delete from storage
      const fileName = photoUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('trip-photos')
          .remove([fileName])
      }

      // Delete from database
      const { error } = await supabase
        .from('trip_photos')
        .delete()
        .eq('id', photoId)

      return { error }
    } catch (error) {
      console.error('Error deleting photo:', error)
      return { error }
    }
  }

  // Generate thumbnail URL (placeholder for now)
  static generateThumbnailUrl(originalUrl: string): string {
    // TODO: Implement thumbnail generation or use Supabase image transformations
    return originalUrl + '?width=300&height=300'
  }

  // Reverse geocoding to get location name from coordinates
  static async getLocationName(latitude: number, longitude: number): Promise<string> {
    try {
      // TODO: Implement with a geocoding service like OpenStreetMap Nominatim
      // For now, return coordinates as string
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    } catch (error) {
      console.error('Error getting location name:', error)
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    }
  }
}