import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { PhotoService } from '../lib/photoService'
import { useAuth } from '../contexts/AuthContext'
import type { Trip } from '../types/database'

interface PhotoUploadProps {
  isOpen: boolean
  onClose: () => void
  trips: Trip[]
  onPhotoUploaded?: () => void
}

interface UploadingPhoto {
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error'
  error?: string
}

export default function PhotoUpload({ isOpen, onClose, trips, onPhotoUploaded }: PhotoUploadProps) {
  const { user } = useAuth()
  const [selectedTrip, setSelectedTrip] = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newPhotos: UploadingPhoto[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending'
    }))

    setUploadingPhotos(prev => [...prev, ...newPhotos])
  }

  const uploadPhoto = async (photo: UploadingPhoto, index: number) => {
    if (!user || !selectedTrip) return

    try {
      // Update status to uploading
      setUploadingPhotos(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'uploading', progress: 25 } : p
      ))

      // Extract EXIF data
      const exifData = await PhotoService.extractEXIFData(photo.file)
      
      setUploadingPhotos(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'processing', progress: 50 } : p
      ))

      // Upload to storage
      const { data: photoUrl, error: uploadError } = await PhotoService.uploadPhoto(
        photo.file,
        user.id,
        selectedTrip
      )

      if (uploadError || !photoUrl) {
        throw new Error(uploadError?.message || 'Upload failed')
      }

      setUploadingPhotos(prev => prev.map((p, i) => 
        i === index ? { ...p, progress: 75 } : p
      ))

      // Create database record
      const photoData = {
        trip_id: selectedTrip,
        user_id: user.id,
        photo_url: photoUrl,
        file_size: photo.file.size,
        file_type: photo.file.type,
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        taken_at: exifData.takenAt,
        camera_make: exifData.cameraMake,
        camera_model: exifData.cameraModel,
      }

      const { error: createError } = await PhotoService.createPhoto(photoData)

      if (createError) {
        throw new Error(createError.message)
      }

      // Success
      setUploadingPhotos(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'success', progress: 100 } : p
      ))

      onPhotoUploaded?.()

    } catch (error) {
      console.error('Error uploading photo:', error)
      setUploadingPhotos(prev => prev.map((p, i) => 
        i === index ? { 
          ...p, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : p
      ))
    }
  }

  const startUpload = async () => {
    if (!selectedTrip) {
      alert('Please select a trip first')
      return
    }
    
    for (let i = 0; i < uploadingPhotos.length; i++) {
      if (uploadingPhotos[i].status === 'pending') {
        await uploadPhoto(uploadingPhotos[i], i)
      }
    }
  }

  const removePhoto = (index: number) => {
    setUploadingPhotos(prev => {
      const photo = prev[index]
      URL.revokeObjectURL(photo.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearAll = () => {
    uploadingPhotos.forEach(photo => URL.revokeObjectURL(photo.preview))
    setUploadingPhotos([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Camera className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Photos</h2>
                <p className="text-gray-600">Add photos to your trip memories</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Trip Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Trip
            </label>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Choose a trip...</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title} - {trip.destination}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragOver
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop photos here or click to upload
            </h3>
            <p className="text-gray-600 mb-4">
              Supports JPG, PNG, and other image formats
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="btn-primary cursor-pointer inline-block"
            >
              Choose Photos
            </label>
          </div>

          {/* Photo Preview Grid */}
          {uploadingPhotos.length > 0 && (
            <div className="mt-6">
              {/* Trip selection reminder */}
              {!selectedTrip && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Select a trip above</strong> to enable uploading
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Photos ({uploadingPhotos.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={clearAll}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={startUpload}
                    disabled={!selectedTrip || uploadingPhotos.some(p => p.status === 'uploading')}
                    className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!selectedTrip ? "Please select a trip first" : "Upload all photos"}
                  >
                    Upload All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadingPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Status Overlay */}
                      {photo.status !== 'pending' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          {photo.status === 'uploading' || photo.status === 'processing' ? (
                            <div className="text-center text-white">
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2 mx-auto" />
                              <div className="text-xs">{photo.progress}%</div>
                            </div>
                          ) : photo.status === 'success' ? (
                            <div className="text-center text-white">
                              <CheckCircle className="w-8 h-8 mx-auto mb-1" />
                              <div className="text-xs">Uploaded</div>
                            </div>
                          ) : photo.status === 'error' ? (
                            <div className="text-center text-white">
                              <AlertCircle className="w-8 h-8 mx-auto mb-1" />
                              <div className="text-xs">Error</div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Error Message */}
                    {photo.error && (
                      <div className="mt-1 text-xs text-red-600">
                        {photo.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}