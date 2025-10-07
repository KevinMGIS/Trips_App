import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, Upload, Camera, MapPin, Calendar, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PhotoService } from '../lib/photoService'
import { TripService } from '../lib/tripService'
import Header from './Header'
import PhotoUpload from './PhotoUpload'
import type { TripPhoto, Trip } from '../types/database'

export default function LookBackPage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<TripPhoto[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load user's trips
      const { data: tripsData, error: tripsError } = await TripService.getUserTrips(user!.id)
      if (tripsError) {
        console.error('Error loading trips:', tripsError)
      } else {
        setTrips(tripsData || [])
      }

      // Load user's photos
      const { data: photosData, error: photosError } = await PhotoService.getUserPhotos(user!.id)
      if (photosError) {
        console.error('Error loading photos:', photosError)
      } else {
        setPhotos(photosData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUploaded = () => {
    // Reload photos after upload
    loadData()
    setShowUploadModal(false)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                    <Map className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Look Back</h1>
                    <p className="text-gray-600">Explore your travel memories on an interactive map</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photos
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by:</span>
                </div>
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Trips</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.title} - {trip.destination}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>All Time</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Photo Map</h2>
                </div>
                
                {/* Placeholder Map Container */}
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map Coming Soon</h3>
                    <p className="text-gray-600 mb-4">Upload photos with GPS data to see them plotted here</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn-primary"
                    >
                      Upload Your First Photo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Photos Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Photos</h2>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg aspect-video mb-2"></div>
                        <div className="bg-gray-200 rounded h-4 mb-1"></div>
                        <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No photos uploaded yet</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                    >
                      Upload photos to get started
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {photos.slice(0, 6).map((photo) => (
                      <div key={photo.id} className="group cursor-pointer">
                        <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100">
                          <img
                            src={photo.thumbnail_url || photo.photo_url}
                            alt={photo.title || 'Trip photo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {photo.title || 'Untitled Photo'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {photo.location_name || 'Unknown location'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {photos.length > 6 && (
                      <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">
                          +{photos.length - 6} more photos
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Photos Uploaded', value: photos.length.toString(), icon: Camera },
                { label: 'Countries Visited', value: new Set(trips.map(t => t.destination.split(',').pop()?.trim())).size.toString(), icon: MapPin },
                { label: 'Trip Memories', value: trips.length.toString(), icon: Map },
                { label: 'Locations Tagged', value: photos.filter(p => p.latitude && p.longitude).length.toString(), icon: Calendar },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 text-center"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 w-fit mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <PhotoUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          trips={trips}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}
    </>
  )
}