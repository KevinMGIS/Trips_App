import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, Plane, Hotel, Car, Camera, 
  Circle, MapPin, Clock, Edit, Trash2, GripVertical 
} from 'lucide-react'
import type { ItineraryItem, Trip } from '../types/database'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DayCardViewProps {
  trip: Trip
  itineraryItems: ItineraryItem[]
  onEdit: (item: ItineraryItem) => void
  onDelete: (id: string) => void
}

// Sortable Item Component for drag and drop
function SortableItem({ 
  item, 
  onEdit, 
  onDelete 
}: { 
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
      case 'restaurant': return 'bg-pink-50 text-pink-700 border-pink-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatLocalTime = (dateTimeString: string) => {
    let date: Date
    
    if (dateTimeString.includes('T')) {
      const localDateString = dateTimeString.replace(/[Z]$/, '').replace(/[+-]\d{2}:\d{2}$/, '')
      date = new Date(localDateString)
      
      const timeString = localDateString.split('T')[1] || '12:00:00'
      if (timeString.startsWith('12:00')) {
        return 'Flexible'
      }
    } else {
      date = new Date(dateTimeString)
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-lg border transition-all duration-200 ${
        isDragging 
          ? 'border-orange-300 shadow-lg' 
          : 'border-gray-200 hover:border-orange-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start p-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center justify-center p-1 mr-2 rounded cursor-grab active:cursor-grabbing transition-all ${
            isDragging 
              ? 'text-orange-500 bg-orange-50' 
              : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 opacity-0 group-hover:opacity-100'
          }`}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Item Icon */}
        <div className={`p-2 rounded-lg border ${getCategoryColor(item.category)} flex-shrink-0`}>
          {getIcon(item.category)}
        </div>

        {/* Item Content */}
        <div className="flex-1 ml-3 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.title}</h4>
          {item.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLocalTime(item.start_datetime)}
            </span>
            {item.location && (
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-orange-500 rounded transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DayCardView({ trip, itineraryItems, onEdit, onDelete }: DayCardViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const tripStartDate = new Date(trip.start_date.split('T')[0])
  const tripEndDate = new Date(trip.end_date.split('T')[0])
  const totalDays = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Generate array of dates
  const dates = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(tripStartDate)
    date.setDate(tripStartDate.getDate() + i)
    return date
  })

  // Group items by date
  const itemsByDate = itineraryItems.reduce((acc, item) => {
    const dateKey = item.start_datetime.split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(item)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  const toggleDay = (dateKey: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allDates = dates.map(d => d.toISOString().split('T')[0])
    setExpandedDays(new Set(allDates))
  }

  const collapseAll = () => {
    setExpandedDays(new Set())
  }

  const calculateDayStats = (items: ItineraryItem[]) => {
    const categories = [...new Set(items.map(item => item.category))]
    return { categories, count: items.length }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Day by Day View</h3>
          <p className="text-xs text-gray-600">Expand or collapse days to focus on what you need</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs px-3 py-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {dates.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0]
          const itemsForDate = (itemsByDate[dateKey] || []).sort(
            (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
          )
          const isExpanded = expandedDays.has(dateKey)
          const stats = calculateDayStats(itemsForDate)
          const dayNumber = index + 1

          const displayDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })

          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Day Header - Clickable */}
              <button
                onClick={() => toggleDay(dateKey)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Day Number Badge */}
                  <div className="bg-orange-100 text-orange-700 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {dayNumber}
                  </div>

                  {/* Day Info */}
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-gray-900">
                      Day {dayNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{displayDate}</p>
                  </div>

                  {/* Quick Stats */}
                  {itemsForDate.length > 0 && (
                    <div className="hidden md:flex items-center gap-4 ml-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500">Activities:</span>
                        <span className="text-sm font-semibold text-gray-900">{stats.count}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Activity Count Badge */}
                  {itemsForDate.length > 0 ? (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      {itemsForDate.length} {itemsForDate.length === 1 ? 'item' : 'items'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                      No activities
                    </span>
                  )}

                  {/* Expand/Collapse Icon */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                      {itemsForDate.length > 0 ? (
                        <div className="space-y-2">
                          {itemsForDate.map((item) => (
                            <SortableItem
                              key={item.id}
                              item={item}
                              onEdit={onEdit}
                              onDelete={onDelete}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">No activities planned for this day</p>
                          <p className="text-xs mt-1">Add activities to build your itinerary</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
