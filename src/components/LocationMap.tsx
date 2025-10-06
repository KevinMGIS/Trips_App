import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, AlertCircle } from 'lucide-react'

interface LocationMapProps {
  destination: string
  className?: string
  height?: string
}

interface Coordinates {
  lat: number
  lon: number
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  destination, 
  className = '', 
  height = 'h-32' 
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (destination) {
      geocodeLocation(destination)
    }
  }, [destination])

  const geocodeLocation = async (location: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Use Nominatim (OpenStreetMap) free geocoding service
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      
      const response = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'TripPlannerApp/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json()
      
      if (data && data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        })
      } else {
        setError('Location not found')
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      setError('Unable to load map')
    } finally {
      setLoading(false)
    }
  }

  const getStaticMapUrl = (coords: Coordinates): string => {
    // Using OpenStreetMap static map service
    const zoom = 12
    const width = 400
    const height = 200
    
    // Try multiple services for better reliability
    // First option: Wikimedia maps (good quality)
    return `https://maps.wikimedia.org/img/osm-intl,${zoom},${coords.lat},${coords.lon},${width}x${height}.png`
  }

  const getBackupMapUrl = (coords: Coordinates): string => {
    // Backup using a different service
    const zoom = 12
    return `https://api.maptiler.com/maps/streets/static/${coords.lon},${coords.lat},${zoom}/400x200.png?key=get_your_own_OpIi9ZULNHzrESv6T2vL`
  }

  if (loading) {
    return (
      <div className={`${className} ${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <MapPin className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-xs text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error || !coordinates) {
    return (
      <div className={`${className} ${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Map unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`${className} ${height} bg-gray-100 rounded-lg overflow-hidden relative group`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Static Map Image */}
      <img
        src={getStaticMapUrl(coordinates)}
        alt={`Map of ${destination}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Try backup map service first
          const target = e.target as HTMLImageElement
          if (!target.src.includes('maptiler')) {
            target.src = getBackupMapUrl(coordinates)
            return
          }
          
          // Final fallback to a styled placeholder
          target.style.display = 'none'
          target.parentElement!.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-orange-100 flex items-center justify-center relative overflow-hidden">
              <div class="absolute inset-0 opacity-20">
                <div class="absolute top-2 left-2 w-8 h-8 bg-blue-200 rounded-full"></div>
                <div class="absolute bottom-4 right-6 w-6 h-6 bg-green-200 rounded-full"></div>
                <div class="absolute top-8 right-4 w-4 h-4 bg-orange-200 rounded-full"></div>
                <div class="absolute bottom-8 left-8 w-5 h-5 bg-yellow-200 rounded-full"></div>
              </div>
              <div class="text-center z-10">
                <svg class="w-10 h-10 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-gray-700 font-semibold">${destination}</p>
                <p class="text-xs text-gray-500 mt-1">Map Preview</p>
              </div>
            </div>
          `
        }}
      />
      
      {/* Location Pin Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" fill="currentColor" />
        </motion.div>
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
      
      {/* Location Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
        <p className="text-xs text-white font-medium truncate">{destination}</p>
      </div>
    </motion.div>
  )
}

export default LocationMap