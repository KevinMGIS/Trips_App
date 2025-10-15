import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import type { TripPhoto } from '../types/database'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface PhotoMapProps {
  photos: TripPhoto[]
  onPhotoClick?: (photo: TripPhoto) => void
}

export default function PhotoMap({ photos, onPhotoClick }: PhotoMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Filter photos that have GPS coordinates
  const photosWithCoords = photos.filter(
    (photo) => photo.latitude && photo.longitude
  )

  // Calculate center of map based on photos
  const center: [number, number] = photosWithCoords.length > 0
    ? [
        photosWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / photosWithCoords.length,
        photosWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / photosWithCoords.length,
      ]
    : [0, 0] // Default to equator if no photos

  // Fit map to show all markers when photos change
  useEffect(() => {
    if (mapRef.current && photosWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        photosWithCoords.map((photo) => [photo.latitude!, photo.longitude!])
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [photosWithCoords])

  if (photosWithCoords.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">No photos with GPS data yet</p>
          <p className="text-sm mt-1">Upload photos with location data to see them on the map</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={4}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {photosWithCoords.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.latitude!, photo.longitude!]}
            eventHandlers={{
              click: () => onPhotoClick?.(photo),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <img
                  src={photo.photo_url}
                  alt={photo.title || 'Photo'}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                {photo.title && (
                  <p className="font-medium text-gray-900 mb-1">{photo.title}</p>
                )}
                {photo.location_name && (
                  <p className="text-sm text-gray-600 mb-1">{photo.location_name}</p>
                )}
                {photo.taken_at && (
                  <p className="text-xs text-gray-500">
                    {new Date(photo.taken_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
