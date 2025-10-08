import { motion } from 'framer-motion'
import { Plane, Hotel, Car, Camera, Circle, MapPin, Clock, Monitor } from 'lucide-react'
import type { ItineraryItem, Trip } from '../types/database'

interface TimelineGanttViewProps {
  trip: Trip
  itineraryItems: ItineraryItem[]
  onItemClick?: (item: ItineraryItem) => void
}

export default function TimelineGanttView({ trip, itineraryItems, onItemClick }: TimelineGanttViewProps) {
  // Calculate trip duration and date range
  const tripStartDate = new Date(trip.start_date.split('T')[0])
  const tripEndDate = new Date(trip.end_date.split('T')[0])
  const totalDays = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Generate array of dates for the trip
  const dates = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(tripStartDate)
    date.setDate(tripStartDate.getDate() + i)
    return date
  })

  // Mobile warning component
  const MobileWarning = () => (
    <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
      <Monitor className="w-12 h-12 mx-auto mb-3 text-blue-600" />
      <h4 className="font-semibold text-gray-900 mb-1">Desktop View Recommended</h4>
      <p className="text-sm text-gray-600 mb-3">
        The Timeline/Gantt view is optimized for larger screens. For the best experience on mobile, try the Cards or List view.
      </p>
      <p className="text-xs text-gray-500">
        Switch views using the buttons above.
      </p>
    </div>
  )

  const getIcon = (category: string) => {
    switch (category) {
      case 'flight': return <Plane className="w-3 h-3" />
      case 'accommodation': return <Hotel className="w-3 h-3" />
      case 'transport': return <Car className="w-3 h-3" />
      case 'activity': return <Camera className="w-3 h-3" />
      default: return <Circle className="w-3 h-3" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'flight': return 'bg-blue-500'
      case 'accommodation': return 'bg-green-500'
      case 'transport': return 'bg-purple-500'
      case 'activity': return 'bg-orange-500'
      case 'restaurant': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryLightColor = (category: string) => {
    switch (category) {
      case 'flight': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'accommodation': return 'bg-green-100 text-green-700 border-green-200'
      case 'transport': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'activity': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'restaurant': return 'bg-pink-100 text-pink-700 border-pink-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Calculate item position and width
  const getItemPosition = (item: ItineraryItem) => {
    const itemDate = new Date(item.start_datetime.split('T')[0])
    const dayIndex = Math.floor((itemDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate duration in days
    let durationDays = 1
    if (item.end_datetime) {
      const endDate = new Date(item.end_datetime.split('T')[0])
      durationDays = Math.max(1, Math.ceil((endDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    }

    return { dayIndex, durationDays }
  }

  // Group items by category for rows
  const categories = ['flight', 'accommodation', 'transport', 'activity', 'restaurant', 'other']
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category] = itineraryItems.filter(item => item.category === category)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  const formatTime = (dateTimeString: string) => {
    const time = dateTimeString.split('T')[1]
    if (!time || time.startsWith('12:00')) return ''
    
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 overflow-x-auto">
      {/* Mobile Warning */}
      <MobileWarning />

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline View</h3>
          <p className="text-sm text-gray-600">Visual overview of your trip activities across all days</p>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
        {categories.map(category => {
          const count = itemsByCategory[category]?.length || 0
          if (count === 0) return null
          
          return (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getCategoryColor(category)}`}></div>
              <span className="text-sm text-gray-600 capitalize">{category}</span>
              <span className="text-xs text-gray-400">({count})</span>
            </div>
          )
        })}
      </div>

      <div className="min-w-[800px]">
        {/* Date Headers */}
        <div className="grid gap-0 mb-4" style={{ gridTemplateColumns: `120px repeat(${totalDays}, minmax(120px, 1fr))` }}>
          <div className="pr-4"></div>
          {dates.map((date, index) => (
            <div key={index} className="text-center p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
              <div className="text-xs font-medium text-gray-900">
                Day {index + 1}
              </div>
              <div className="text-xs text-gray-500">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-gray-400">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Rows by Category */}
        <div className="space-y-3">
          {categories.map(category => {
            const categoryItems = itemsByCategory[category] || []
            if (categoryItems.length === 0) return null

            return (
              <div key={category}>
                {/* Category Row */}
                <div className="grid gap-0 items-start" style={{ gridTemplateColumns: `120px repeat(${totalDays}, minmax(120px, 1fr))` }}>
                  {/* Category Label */}
                  <div className="pr-4 pt-2 flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${getCategoryLightColor(category)}`}>
                      {getIcon(category)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                  </div>

                  {/* Timeline Grid */}
                  <div className="relative" style={{ gridColumn: `2 / span ${totalDays}` }}>
                    {/* Grid background */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(120px, 1fr))` }}>
                      {dates.map((_, index) => (
                        <div key={index} className="border-l border-gray-100 min-h-[60px]"></div>
                      ))}
                    </div>

                    {/* Items positioned on the grid */}
                    <div className="relative min-h-[60px] py-2">
                      {categoryItems.map((item, itemIndex) => {
                        const { dayIndex, durationDays } = getItemPosition(item)
                        const time = formatTime(item.start_datetime)
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: itemIndex * 0.05 }}
                            className={`absolute rounded-lg border-2 shadow-sm cursor-pointer overflow-hidden ${getCategoryLightColor(category)}`}
                            style={{
                              left: `${(dayIndex / totalDays) * 100}%`,
                              width: `${(durationDays / totalDays) * 100}%`,
                              top: `${itemIndex * 70}px`,
                              height: '60px',
                            }}
                            onClick={() => onItemClick?.(item)}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="p-2 h-full flex flex-col justify-between">
                              <div className="flex items-start gap-1 min-w-0">
                                {getIcon(item.category)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate">{item.title}</p>
                                  {time && (
                                    <p className="text-xs opacity-75 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {time}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {item.location && (
                                <p className="text-xs opacity-75 truncate flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {item.location}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {itineraryItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No activities added yet</p>
            <p className="text-xs mt-1">Add activities to see them on the timeline</p>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
