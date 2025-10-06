import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, DollarSign, Image, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import { TripService } from '../lib/tripService'
import AnimatedLogo from './AnimatedLogo'
import { AnimatedButton, FloatingElement } from './PageTransition'

interface TripFormData {
  title: string
  description: string
  destination: string
  startDate: string
  endDate: string
  budgetTotal: number | null
  coverImageUrl: string
  status: 'planning' | 'booked' | 'in_progress' | 'completed' | 'cancelled'
}

const initialFormData: TripFormData = {
  title: '',
  description: '',
  destination: '',
  startDate: '',
  endDate: '',
  budgetTotal: null,
  coverImageUrl: '',
  status: 'planning'
}

export default function CreateTripPage() {
  const [formData, setFormData] = useState<TripFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Trip title is required'
    }
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date'
      }
      
      if (startDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
        newErrors.startDate = 'Start date cannot be in the past'
      }
    }
    
    if (formData.budgetTotal !== null && formData.budgetTotal < 0) {
      newErrors.budgetTotal = 'Budget cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }
    
    if (!user) {
      console.log('No user found')
      setErrors({ title: 'You must be logged in to create a trip' })
      return
    }

    console.log('Starting trip creation...')
    setLoading(true)
    
    try {
      const { data, error } = await TripService.createTrip({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        destination: formData.destination.trim(),
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget_total: formData.budgetTotal ?? undefined,
        cover_image_url: formData.coverImageUrl.trim() || undefined,
        status: formData.status,
        created_by: user.id
      })

      if (error) {
        console.error('Error creating trip:', error)
        setErrors({ title: 'Failed to create trip. Please try again.' })
      } else {
        console.log('Trip created successfully:', data)
        // Navigate to trip details or trips list
        navigate('/trips')
      }
    } catch (err) {
      console.error('Exception creating trip:', err)
      setErrors({ title: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TripFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'budgetTotal' 
      ? (e.target.value === '' ? null : parseFloat(e.target.value))
      : e.target.value

    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="bg-white border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AnimatedButton
                onClick={() => navigate('/')}
                variant="ghost"
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </AnimatedButton>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Trip</h1>
                <p className="text-sm text-gray-600">Plan your next adventure</p>
              </div>
            </div>
            <FloatingElement delay={0.5}>
              <AnimatedLogo size={40} showText={false} />
            </FloatingElement>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <div className="container-mobile py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3
                }
              }
            }}
          >
            {/* Trip Details Card */}
            <motion.div 
              className="card p-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Trip Details</h2>
              </div>

              <div className="space-y-6">
                {/* Trip Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                    Trip Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    className={cn('input', errors.title && 'border-red-500')}
                    placeholder="e.g., Weekend in Paris, Beach Getaway, Mountain Adventure"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-900 mb-2">
                    Destination *
                  </label>
                  <input
                    id="destination"
                    type="text"
                    value={formData.destination}
                    onChange={handleInputChange('destination')}
                    className={cn('input', errors.destination && 'border-red-500')}
                    placeholder="e.g., Paris, France"
                    maxLength={100}
                  />
                  {errors.destination && (
                    <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    className="input resize-none"
                    placeholder="Tell us about your trip plans, what you're excited about, or special occasions you're celebrating..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Dates Card */}
            <motion.div 
              className="card p-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">When are you going?</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange('startDate')}
                    className={cn('input', errors.startDate && 'border-red-500')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-2">
                    End Date *
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange('endDate')}
                    className={cn('input', errors.endDate && 'border-red-500')}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Duration display */}
              {formData.startDate && formData.endDate && (
                <motion.div 
                  className="mt-4 p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-gray-600">
                    Trip duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Budget Card */}
            <motion.div 
              className="card p-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Budget (Optional)</h2>
              </div>

              <div>
                <label htmlFor="budgetTotal" className="block text-sm font-medium text-gray-900 mb-2">
                  Total Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="budgetTotal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budgetTotal ?? ''}
                    onChange={handleInputChange('budgetTotal')}
                    className={cn('input pl-8', errors.budgetTotal && 'border-red-500')}
                    placeholder="0.00"
                  />
                </div>
                {errors.budgetTotal && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgetTotal}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Set a budget to help track your trip expenses
                </p>
              </div>
            </motion.div>

            {/* Additional Options Card */}
            <motion.div 
              className="card p-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Image className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Additional Options</h2>
              </div>

              <div className="space-y-6">
                {/* Cover Image URL */}
                <div>
                  <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-900 mb-2">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    id="coverImageUrl"
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={handleInputChange('coverImageUrl')}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Add a beautiful image to represent your trip
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                    Trip Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    className="input"
                  >
                    <option value="planning">Planning</option>
                    <option value="booked">Booked</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              className="flex justify-end gap-4"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <AnimatedButton
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                type="submit"
                variant="primary"
                disabled={loading}
                className="min-w-32"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Create Trip
                  </div>
                )}
              </AnimatedButton>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}