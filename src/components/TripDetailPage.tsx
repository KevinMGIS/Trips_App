import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Calendar, MapPin, Clock,
  Plus, Edit, Trash2, Plane, Hotel, Car, Camera,
  CheckCircle, Circle, X, GripVertical
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TripService } from '../lib/tripService'
import type { Trip, ItineraryItem, TripIdea } from '../types/database'
import Header from './Header'
import TimelineGanttView from './TimelineGanttView'
import DayCardView from './DayCardView'
import TripIdeasPanel from './TripIdeasPanel'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Helper function to format time in local timezone
const formatLocalTime = (dateTimeString: string) => {
  // Handle different datetime string formats and ensure local timezone interpretation
  let date: Date
  
  if (dateTimeString.includes('T')) {
    // ISO format: remove timezone indicator to treat as local
    const localDateString = dateTimeString.replace(/[Z]$/, '').replace(/[+-]\d{2}:\d{2}$/, '')
    date = new Date(localDateString)
    
    // Check if this is a flexible time entry (12:00:00) indicating unknown/flexible timing
    const timeString = localDateString.split('T')[1] || '12:00:00'
    if (timeString.startsWith('12:00')) {
      return 'Flexible'
    }
  } else {
    // Simple format, should already be local
    date = new Date(dateTimeString)
  }
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Refined Timeline Item Component
function TimelineItem({ item, onEdit, onDelete }: { 
  item: ItineraryItem
  onEdit: (item: ItineraryItem) => void
  onDelete: (id: string) => void
}) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'flight': return <Plane className="w-4 h-4" />
      case 'accommodation': return <Hotel className="w-4 h-4" />
      case 'transport': return <Car className="w-4 h-4" />
      case 'activity': return <Camera className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'flight': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'accommodation': return 'bg-green-50 text-green-700 border-green-200'
      case 'transport': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'activity': return 'bg-orange-50 text-orange-700 border-orange-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-orange-200 transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-2 rounded-lg border ${getCategoryColor(item.category)}`}>
            {getIcon(item.category)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLocalTime(item.start_datetime)}
              </span>
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Sortable Timeline Item Component with drag handle
function SortableTimelineItem({ item, onEdit, onDelete }: { 
  item: ItineraryItem
  onEdit: (item: ItineraryItem) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'flight': return <Plane className="w-4 h-4" />
      case 'accommodation': return <Hotel className="w-4 h-4" />
      case 'transport': return <Car className="w-4 h-4" />
      case 'activity': return <Camera className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'flight': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'accommodation': return 'bg-green-50 text-green-700 border-green-200'
      case 'transport': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'activity': return 'bg-orange-50 text-orange-700 border-orange-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border transition-all duration-200 group ${
        isDragging 
          ? 'border-orange-300 shadow-lg rotate-1 scale-105' 
          : 'border-gray-200 p-5 hover:shadow-md hover:border-orange-200'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center justify-center p-2 -ml-3 mr-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 ${
            isDragging 
              ? 'text-orange-500 bg-orange-50' 
              : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 opacity-0 group-hover:opacity-100'
          }`}
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className={`flex items-start gap-4 flex-1 ${isDragging ? 'p-5' : ''}`}>
          <div className={`p-2 rounded-lg border ${getCategoryColor(item.category)}`}>
            {getIcon(item.category)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLocalTime(item.start_datetime)}
              </span>
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${isDragging ? 'p-5 pl-0' : ''}`}>
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Refined Accommodation Card Component
function AccommodationCard({ accommodation, onEdit, onDelete }: { 
  accommodation: ItineraryItem
  onEdit: (item: ItineraryItem) => void
  onDelete: (id: string) => void
}) {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const result = formatLocalTime(dateString)
    return result === 'Flexible' ? '—' : result
  }

  const getNumberOfNights = () => {
    if (!accommodation.end_datetime) return null
    const start = new Date(accommodation.start_datetime)
    const end = new Date(accommodation.end_datetime)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-green-200 transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      layout
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
            <Hotel className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{accommodation.title}</h3>
            {accommodation.location && (
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {accommodation.location}
              </p>
            )}
            {accommodation.description && (
              <p className="text-sm text-gray-600 mb-3">{accommodation.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(accommodation)}
            className="p-2 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(accommodation.id)}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Check-in</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(accommodation.start_datetime)}
          </p>
          <p className="text-xs text-gray-500">
            {formatTime(accommodation.start_datetime)}
          </p>
        </div>

        {accommodation.end_datetime && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Check-out</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(accommodation.end_datetime)}
            </p>
            <p className="text-xs text-gray-500">
              {formatTime(accommodation.end_datetime)}
            </p>
          </div>
        )}

        {getNumberOfNights() && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="text-sm font-medium text-gray-900">
              {getNumberOfNights()} {getNumberOfNights() === 1 ? 'night' : 'nights'}
            </p>
          </div>
        )}
      </div>

      {(accommodation.confirmation_number || accommodation.booking_url || accommodation.notes) && (
        <div className="border-t pt-4 space-y-2">
          {accommodation.confirmation_number && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Confirmation:</span>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {accommodation.confirmation_number}
              </span>
            </div>
          )}
          {accommodation.booking_url && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Booking:</span>
              <a 
                href={accommodation.booking_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 underline"
              >
                View Details
              </a>
            </div>
          )}
          {accommodation.notes && (
            <div>
              <span className="text-xs text-gray-500">Notes:</span>
              <p className="text-xs text-gray-600 mt-1">{accommodation.notes}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Refined Quick Stats Component
function QuickStats({ trip, stats, accommodations }: { trip: Trip, stats: any, accommodations: ItineraryItem[] }) {
  const tripDuration = (() => {
    const [startYear, startMonth, startDay] = trip.start_date.split('T')[0].split('-')
    const [endYear, endMonth, endDay] = trip.end_date.split('T')[0].split('-')
    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay))
    const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay))
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  })()

  const itineraryCount = stats.itineraryItems || 0
  const accommodationCount = accommodations.length

  const statsData = [
    {
      icon: Calendar,
      label: 'Trip Duration',
      value: `${tripDuration} days`,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      icon: CheckCircle,
      label: 'Activities',
      value: itineraryCount.toString(),
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-100'
    },
    {
      icon: Hotel,
      label: 'Accommodations',
      value: accommodationCount.toString(),
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="group"
        >
          <div className={`${stat.bgColor} ${stat.borderColor} rounded-xl p-3 md:p-4 border hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className={`p-1.5 md:p-2 ${stat.iconColor} bg-white rounded-lg shadow-sm`}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
            
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [tripIdeas, setTripIdeas] = useState<TripIdea[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [itineraryView, setItineraryView] = useState<'timeline' | 'daycard' | 'gantt'>('daycard')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showItineraryModal, setShowItineraryModal] = useState(false)
  const [showAccommodationModal, setShowAccommodationModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [accommodations, setAccommodations] = useState<ItineraryItem[]>([])
  const [editForm, setEditForm] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: ''
  })
  const [itineraryForm, setItineraryForm] = useState({
    title: '',
    description: '',
    category: 'flight' as ItineraryItem['category'],
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    cost: '',
    confirmation_number: '',
    notes: ''
  })
  const [accommodationForm, setAccommodationForm] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    cost: '',
    confirmation_number: '',
    notes: '',
    booking_url: ''
  })

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end for reordering itinerary items - now supports cross-day dragging and ideas
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      return
    }

    // Check if dragging an idea
    const isIdea = active.data.current?.type === 'idea'
    
    if (isIdea) {
      // Handle idea being dropped onto itinerary
      const idea = active.data.current?.idea as TripIdea
      if (!idea || !trip) return

      // Find the item we're dropping near to determine the date
      const overItem = itineraryItems.find(item => item.id === over.id)
      if (!overItem) return

      // Extract date from the item we're dropping near
      const targetDate = overItem.start_datetime.split('T')[0]
      
      // Create itinerary item from idea
      const newItem = {
        trip_id: trip.id,
        title: idea.title,
        description: idea.description || '',
        category: idea.category || 'activity',
        start_datetime: `${targetDate}T12:00:00`, // Default to midday
        end_datetime: null,
        location: idea.location || '',
        notes: idea.notes || '',
        confirmation_number: '',
        created_by: user?.id
      }

      try {
        // Convert idea to itinerary item (creates item and deletes idea)
        await TripService.convertIdeaToItinerary(idea.id, newItem)
        // Reload data to reflect changes
        await loadTripData()
      } catch (error) {
        console.error('Error converting idea to itinerary:', error)
      }
      
      return
    }

    // Original logic for reordering existing items
    if (active.id === over.id) {
      return
    }

    setItineraryItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      
      if (oldIndex === -1 || newIndex === -1) {
        return items
      }
      
      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      
      // Get the dragged item and the item it was dropped near
      const draggedItem = reorderedItems[newIndex]
      const referenceItem = over.id === draggedItem.id ? 
        (newIndex > 0 ? reorderedItems[newIndex - 1] : null) : 
        reorderedItems.find(item => item.id === over.id)
      
      // If moving to a different day, update the date
      if (referenceItem) {
        const referenceDate = referenceItem.start_datetime.split('T')[0]
        const draggedDate = draggedItem.start_datetime.split('T')[0]
        
        if (referenceDate !== draggedDate) {
          // Update to the same date as reference item, keeping the original time
          const draggedTime = draggedItem.start_datetime.split('T')[1] || '12:00:00'
          draggedItem.start_datetime = `${referenceDate}T${draggedTime}`
          
          // Update end_datetime if it exists
          if (draggedItem.end_datetime) {
            const endTime = draggedItem.end_datetime.split('T')[1] || '12:00:00'
            draggedItem.end_datetime = `${referenceDate}T${endTime}`
          }
        }
      }
      
      // Save the new order and dates to database
      saveItemOrder(reorderedItems)
      
      return reorderedItems
    })
  }

  // Save the new order and times to database
  const saveItemOrder = async (reorderedItems: ItineraryItem[]) => {
    try {
      // Update each item's timing in the database
      const updatePromises = reorderedItems.map(async (item) => {
        return TripService.updateItineraryItem(item.id, {
          start_datetime: item.start_datetime,
          end_datetime: item.end_datetime,
        })
      })

      await Promise.all(updatePromises)
      console.log('Successfully updated item order and times')
    } catch (error) {
      console.error('Error saving item order:', error)
      // Optionally, you could show a toast notification to the user
    }
  }

  const loadTripData = useCallback(async () => {
    if (!id || !user?.id) return
    
    setLoading(true)
    
    // Clear previous trip data to prevent showing stale data from other trips
    setTripIdeas([])
    setItineraryItems([])
    setAccommodations([])
    
    try {
      // Load trip details
      const { data: tripData, error: tripError } = await TripService.getTripById(id)
      if (tripError) throw tripError
      
      // Load trip statistics
      const { data: statsData, error: statsError } = await TripService.getTripStats(id)
      if (statsError) throw statsError
      
      setTrip(tripData)
      setStats(statsData || {})
      
      // Initialize edit form with trip data
      if (tripData) {
        setEditForm({
          title: tripData.title,
          destination: tripData.destination,
          start_date: tripData.start_date.split('T')[0],
          end_date: tripData.end_date.split('T')[0],
          description: tripData.description || ''
        })
      }
      
      // Load itinerary items
      if (tripData) {
        const { data: itineraryData, error: itineraryError } = await TripService.getItineraryItems(tripData.id)
        if (itineraryError) {
          console.error('Error loading itinerary items:', itineraryError)
        } else {
          setItineraryItems(itineraryData || [])
          // Filter accommodations
          const accommodationItems = (itineraryData || []).filter(item => item.category === 'accommodation')
          setAccommodations(accommodationItems)
        }

        // Load trip ideas
        const { data: ideasData, error: ideasError } = await TripService.getTripIdeas(tripData.id)
        if (ideasError) {
          console.error('Error loading trip ideas:', ideasError)
        } else {
          setTripIdeas(ideasData || [])
        }
      }
      
    } catch (error) {
      console.error('Error loading trip data:', error)
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    loadTripData()
  }, [loadTripData])

  const handleEditItem = (item: ItineraryItem) => {
    setEditingItem(item)
    
    // Parse the existing datetime into date and time parts
    const startDate = new Date(item.start_datetime)
    const startDateStr = startDate.toISOString().split('T')[0]
    const startTimeStr = startDate.toTimeString().substring(0, 5)
    
    let endDateStr = ''
    let endTimeStr = ''
    if (item.end_datetime) {
      const endDate = new Date(item.end_datetime)
      endDateStr = endDate.toISOString().split('T')[0]
      endTimeStr = endDate.toTimeString().substring(0, 5)
    }
    
    setItineraryForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      start_date: startDateStr,
      start_time: startTimeStr,
      end_date: endDateStr,
      end_time: endTimeStr,
      location: item.location || '',
      cost: item.cost?.toString() || '',
      confirmation_number: item.confirmation_number || '',
      notes: item.notes || ''
    })
    setShowItineraryModal(true)
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItineraryItem(itemId)
    }
  }

  const handleAddItineraryItem = () => {
    setEditingItem(null)
    setItineraryForm({
      title: '',
      description: '',
      category: 'flight',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: '',
      cost: '',
      confirmation_number: '',
      notes: ''
    })
    setShowItineraryModal(true)
  }

  const saveItineraryItem = async () => {
    if (!trip || !user) return

    try {
      // Combine date and time fields into datetime format
      const createDateTime = (date: string, time: string) => {
        if (!date) return null
        if (!time) {
          // If no time specified, use 12:00 (midday) for better sorting
          // We'll track that this was originally a flexible time
          return `${date}T12:00:00`
        }
        return `${date}T${time}:00`
      }

      const startDateTime = createDateTime(itineraryForm.start_date, itineraryForm.start_time)
      const endDateTime = itineraryForm.end_date ? createDateTime(itineraryForm.end_date, itineraryForm.end_time) : null

      const itemData = {
        trip_id: trip.id,
        title: itineraryForm.title,
        description: itineraryForm.description || null,
        category: itineraryForm.category,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        location: itineraryForm.location || null,
        confirmation_number: itineraryForm.confirmation_number || null,
        notes: itineraryForm.notes || null,
        created_by: user.id
      }

      if (editingItem) {
        // Update existing item
        await TripService.updateItineraryItem(editingItem.id, itemData)
      } else {
        // Create new item
        await TripService.createItineraryItem(itemData)
      }

      // Reload itinerary items
      await loadTripData()
      setShowItineraryModal(false)
    } catch (error) {
      console.error('Error saving itinerary item:', error)
    }
  }

  const deleteItineraryItem = async (itemId: string) => {
    try {
      await TripService.deleteItineraryItem(itemId)
      // Reload itinerary items
      await loadTripData()
    } catch (error) {
      console.error('Error deleting itinerary item:', error)
    }
  }

  // Accommodation management functions
  const handleAddAccommodation = () => {
    setEditingItem(null)
    setAccommodationForm({
      title: '',
      description: '',
      start_datetime: '',
      end_datetime: '',
      location: '',
      cost: '',
      confirmation_number: '',
      notes: '',
      booking_url: ''
    })
    setShowAccommodationModal(true)
  }

  const handleEditAccommodation = (item: ItineraryItem) => {
    setEditingItem(item)
    setAccommodationForm({
      title: item.title,
      description: item.description || '',
      start_datetime: item.start_datetime.split('.')[0],
      end_datetime: item.end_datetime?.split('.')[0] || '',
      location: item.location || '',
      cost: item.cost?.toString() || '',
      confirmation_number: item.confirmation_number || '',
      notes: item.notes || '',
      booking_url: item.booking_url || ''
    })
    setShowAccommodationModal(true)
  }

  const saveAccommodation = async () => {
    if (!trip || !user) return

    try {
      const itemData = {
        trip_id: trip.id,
        title: accommodationForm.title,
        description: accommodationForm.description || null,
        category: 'accommodation' as const,
        start_datetime: accommodationForm.start_datetime,
        end_datetime: accommodationForm.end_datetime || null,
        location: accommodationForm.location || null,
        confirmation_number: accommodationForm.confirmation_number || null,
        notes: accommodationForm.notes || null,
        booking_url: accommodationForm.booking_url || null,
        created_by: user.id
      }

      if (editingItem) {
        await TripService.updateItineraryItem(editingItem.id, itemData)
      } else {
        await TripService.createItineraryItem(itemData)
      }

      // Reload trip data
      await loadTripData()
      setShowAccommodationModal(false)
    } catch (error) {
      console.error('Error saving accommodation:', error)
    }
  }

  const handleEditTrip = () => {
    setShowEditModal(true)
  }

  const handleSaveTrip = async () => {
    if (!trip || !user) return

    try {
      // Convert form data to proper types
      const updateData = {
        title: editForm.title,
        destination: editForm.destination,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        description: editForm.description
      }

      await TripService.updateTrip(trip.id, updateData)
      
      // Reload trip data
      await loadTripData()
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating trip:', error)
    }
  }

  const handleCancelEdit = () => {
    if (trip) {
      setEditForm({
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date.split('T')[0],
        end_date: trip.end_date.split('T')[0],
        description: trip.description || ''
      })
    }
    setShowEditModal(false)
  }

  const formatDateShort = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColorSubtle = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'booked': return 'bg-green-50 text-green-700 border-green-200'
      case 'in_progress': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'completed': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </>
    )
  }

  if (!trip) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    )
  }

  // Group itinerary items by day and render with day headers
  const renderItineraryByDays = () => {
    if (!trip) return null

    // Group items by date
    const itemsByDate = itineraryItems.reduce((acc, item) => {
      const dateKey = item.start_datetime.split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(item)
      return acc
    }, {} as Record<string, ItineraryItem[]>)

    // Sort dates chronologically
    const sortedDates = Object.keys(itemsByDate).sort()

    // Calculate trip start date for day numbering - parse without timezone issues
    const [startYear, startMonth, startDay] = trip.start_date.split('T')[0].split('-').map(Number)
    const tripStartDate = new Date(startYear, startMonth - 1, startDay)

    return (
      <div className="space-y-6">
        {sortedDates.map((dateKey) => {
          const itemsForDate = itemsByDate[dateKey].sort(
            (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
          )
          
          // Calculate day number - parse date without timezone issues
          const [year, month, day] = dateKey.split('-').map(Number)
          const currentDate = new Date(year, month - 1, day)
          const dayNumber = Math.ceil((currentDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          
          // Format date for display
          const displayDate = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })

          return (
            <div key={dateKey} className="space-y-4">
              {/* Day Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 text-orange-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {dayNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {dayNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{displayDate}</p>
                  </div>
                </div>
              </div>
              
              {/* Items for this day */}
              <div className="space-y-4 pl-11">
                {itemsForDate.map((item) => (
                  <SortableTimelineItem
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Refined Trip Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Elegant Header Section */}
            <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-6 border border-orange-100">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColorSubtle(trip.status)}`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{formatDateShort(trip.start_date)} - {formatDateShort(trip.end_date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleEditTrip}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Trip
                  </button>
                </div>
              </div>

              {/* Trip Countdown - More Subtle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 border border-orange-200 inline-block"
              >
                {(() => {
                  const today = new Date()
                  const startDate = new Date(trip.start_date)
                  const endDate = new Date(trip.end_date)
                  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  
                  if (daysUntilStart > 0) {
                    return (
                      <div className="flex items-center gap-3 text-center">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{daysUntilStart}</div>
                          <div className="text-sm text-gray-600">days until departure</div>
                        </div>
                      </div>
                    )
                  } else if (daysUntilEnd > 0) {
                    return (
                      <div className="flex items-center gap-3 text-center">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{daysUntilEnd}</div>
                          <div className="text-sm text-gray-600">days remaining</div>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="flex items-center gap-3 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="text-lg font-bold text-gray-900">Trip Complete!</div>
                          <div className="text-sm text-gray-600">Hope you had a great time</div>
                        </div>
                      </div>
                    )
                  }
                })()}
              </motion.div>
            </div>

            {/* Refined Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <QuickStats trip={trip} stats={stats} accommodations={accommodations} />
            </motion.div>
          </motion.div>

          {/* Refined Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', count: (itineraryItems.length + accommodations.length) },
                  { id: 'itinerary', label: 'Itinerary', count: itineraryItems.length },
                  { id: 'accommodations', label: 'Hotels', count: accommodations.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors flex items-center gap-1.5 md:gap-2 whitespace-nowrap touch-manipulation ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Trip Description */}
                {trip.description && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Trip</h3>
                    <p className="text-gray-600 leading-relaxed">{trip.description}</p>
                  </div>
                )}

                {/* Complete Trip Timeline */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Complete Trip Timeline</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveTab('itinerary')}
                        className="btn-secondary text-sm"
                      >
                        Manage Itinerary
                      </button>
                      <button 
                        onClick={() => setActiveTab('accommodations')}
                        className="btn-secondary text-sm"
                      >
                        Manage Hotels
                      </button>
                    </div>
                  </div>

                  {[...itineraryItems, ...accommodations].length === 0 ? (
                    <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to plan something amazing?</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">Start building your perfect trip by adding flights, hotels, activities, and experiences.</p>
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={handleAddItineraryItem}
                          className="btn-primary"
                        >
                          Add Activity
                        </button>
                        <button 
                          onClick={handleAddAccommodation}
                          className="btn-secondary"
                        >
                          Add Hotel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Accommodations Section */}
                      {accommodations.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Hotel className="w-5 h-5 text-green-600" />
                            Accommodations ({accommodations.length})
                          </h4>
                          <div className="space-y-3">
                            {accommodations
                              .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                              .map((accommodation) => (
                                <AccommodationCard
                                  key={accommodation.id}
                                  accommodation={accommodation}
                                  onEdit={handleEditAccommodation}
                                  onDelete={handleDeleteItem}
                                />
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Itinerary Items Section */}
                      {itineraryItems.filter(item => item.category !== 'accommodation').length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Activities & Transportation ({itineraryItems.filter(item => item.category !== 'accommodation').length})
                          </h4>
                          <div className="space-y-3">
                            {itineraryItems
                              .filter(item => item.category !== 'accommodation')
                              .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                              .map((item) => (
                                <TimelineItem
                                  key={item.id}
                                  item={item}
                                  onEdit={handleEditItem}
                                  onDelete={handleDeleteItem}
                                />
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Combined Timeline View Toggle */}
                      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Want to see everything mixed together?</h4>
                            <p className="text-xs text-gray-600">View all activities and accommodations in chronological order</p>
                          </div>
                          <button 
                            onClick={() => setActiveTab('itinerary')}
                            className="btn-primary text-sm"
                          >
                            View Timeline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {/* Trip Ideas Panel */}
                {trip && (
                  <TripIdeasPanel
                    tripId={trip.id}
                    ideas={tripIdeas}
                    onIdeasChange={loadTripData}
                  />
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">Trip Timeline</h3>
                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    {/* View Toggle Buttons */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 md:p-1">
                      <button
                        onClick={() => setItineraryView('daycard')}
                        className={`px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all flex items-center gap-1 md:gap-1.5 touch-manipulation ${
                          itineraryView === 'daycard'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="Day Card View"
                      >
                        <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="hidden xs:inline">Cards</span>
                      </button>
                      <button
                        onClick={() => setItineraryView('gantt')}
                        className={`px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all flex items-center gap-1 md:gap-1.5 touch-manipulation ${
                          itineraryView === 'gantt'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="Gantt Chart View"
                      >
                        <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="hidden xs:inline">Timeline</span>
                      </button>
                      <button
                        onClick={() => setItineraryView('timeline')}
                        className={`px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all flex items-center gap-1 md:gap-1.5 touch-manipulation ${
                          itineraryView === 'timeline'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="List View"
                      >
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="hidden xs:inline">List</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleAddItineraryItem}
                      className="btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center touch-manipulation"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Activity</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>

                {itineraryItems.length === 0 ? (
                  <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Your timeline awaits</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Create a detailed schedule for your trip with flights, activities, and transportation.</p>
                    <button 
                      onClick={handleAddItineraryItem}
                      className="btn-primary"
                    >
                      Add Your First Activity
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Gantt Chart View */}
                    {itineraryView === 'gantt' && trip && (
                      <TimelineGanttView
                        trip={trip}
                        itineraryItems={itineraryItems}
                        onItemClick={handleEditItem}
                      />
                    )}

                    {/* Day Card View with Drag & Drop */}
                    {itineraryView === 'daycard' && trip && (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={itineraryItems.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <DayCardView
                            trip={trip}
                            itineraryItems={itineraryItems}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                          />
                        </SortableContext>
                      </DndContext>
                    )}

                    {/* Original Timeline View with Drag & Drop */}
                    {itineraryView === 'timeline' && (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={itineraryItems.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {renderItineraryByDays()}
                        </SortableContext>
                      </DndContext>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Accommodations tab */}
            {activeTab === 'accommodations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Accommodations</h3>
                  <button 
                    onClick={handleAddAccommodation}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Hotel
                  </button>
                </div>

                {accommodations.length === 0 ? (
                  <div className="bg-green-50 rounded-2xl p-8 border border-green-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Hotel className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Find your perfect stay</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Add hotel reservations, Airbnb bookings, and other accommodations.</p>
                    <button 
                      onClick={handleAddAccommodation}
                      className="btn-primary"
                    >
                      Add Your First Hotel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accommodations.map((accommodation) => (
                      <AccommodationCard
                        key={accommodation.id}
                        accommodation={accommodation}
                        onEdit={handleEditAccommodation}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Edit Trip Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Trip</h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter trip title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={editForm.destination}
                    onChange={(e) => setEditForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter destination"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter trip description"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTrip}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Itinerary Item Modal */}
        {showItineraryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} Itinerary Item
                </h2>
                <button
                  onClick={() => setShowItineraryModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={itineraryForm.title}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Flight to Paris, Hotel Check-in, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={itineraryForm.category}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, category: e.target.value as ItineraryItem['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="flight">Flight</option>
                      <option value="accommodation">Hotel/Accommodation</option>
                      <option value="activity">Activity</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="transport">Transportation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={itineraryForm.description}
                    onChange={(e) => setItineraryForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Additional details about this item"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={itineraryForm.start_date}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="time"
                      value={itineraryForm.start_time}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Leave empty for all-day event"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={itineraryForm.end_date}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="time"
                      value={itineraryForm.end_time}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={!itineraryForm.end_date}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={itineraryForm.location}
                    onChange={(e) => setItineraryForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Airport, hotel address, venue, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmation Number
                    </label>
                    <input
                      type="text"
                      value={itineraryForm.confirmation_number}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, confirmation_number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="ABC123, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={itineraryForm.notes}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Gate info, special instructions, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowItineraryModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveItineraryItem}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Accommodation Modal */}
        {showAccommodationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} Accommodation
                </h2>
                <button
                  onClick={() => setShowAccommodationModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel/Property Name *
                  </label>
                  <input
                    type="text"
                    value={accommodationForm.title}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Marriott Hotel, Airbnb Downtown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={accommodationForm.description}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Room type, amenities, special notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address/Location
                  </label>
                  <input
                    type="text"
                    value={accommodationForm.location}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Hotel address or area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={accommodationForm.start_datetime}
                      onChange={(e) => setAccommodationForm(prev => ({ ...prev, start_datetime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={accommodationForm.end_datetime}
                      onChange={(e) => setAccommodationForm(prev => ({ ...prev, end_datetime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmation Number
                  </label>
                  <input
                    type="text"
                    value={accommodationForm.confirmation_number}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, confirmation_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Booking confirmation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking URL
                  </label>
                  <input
                    type="url"
                    value={accommodationForm.booking_url}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, booking_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://booking.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={accommodationForm.notes}
                    onChange={(e) => setAccommodationForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Check-in instructions, WiFi password, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAccommodationModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAccommodation}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Add Accommodation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}