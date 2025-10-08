import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import type { TripIdea, NewTripIdea } from '../types/database'
import { TripService } from '../lib/tripService'
import { useDraggable } from '@dnd-kit/core'

interface TripIdeasPanelProps {
  tripId: string
  ideas: TripIdea[]
  onIdeasChange: () => void
}

interface IdeaFormData {
  title: string
  description: string
  category: 'flight' | 'accommodation' | 'activity' | 'restaurant' | 'transport' | 'other'
  location: string
  notes: string
  url: string
  estimated_duration: string
  priority: 'high' | 'medium' | 'low'
}

const emptyForm: IdeaFormData = {
  title: '',
  description: '',
  category: 'activity',
  location: '',
  notes: '',
  url: '',
  estimated_duration: '',
  priority: 'medium'
}

function DraggableIdea({ idea, onEdit, onDelete }: { 
  idea: TripIdea
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `idea-${idea.id}`,
    data: {
      type: 'idea',
      idea
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'flight': return 'bg-blue-100 text-blue-800'
      case 'accommodation': return 'bg-purple-100 text-purple-800'
      case 'activity': return 'bg-green-100 text-green-800'
      case 'restaurant': return 'bg-orange-100 text-orange-800'
      case 'transport': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...listeners}
          {...attributes}
          className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          aria-label="Drag to add to itinerary"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-gray-900 text-sm truncate">{idea.title}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Edit idea"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Delete idea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {idea.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{idea.description}</p>
          )}

          {idea.url && (
            <a
              href={idea.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{idea.url}</span>
            </a>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {idea.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(idea.category)}`}>
                {idea.category}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(idea.priority)}`}>
              {idea.priority}
            </span>
            {idea.location && (
              <span className="text-xs text-gray-500">{idea.location}</span>
            )}
            {idea.estimated_duration && (
              <span className="text-xs text-gray-500">~{idea.estimated_duration}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TripIdeasPanel({ tripId, ideas, onIdeasChange }: TripIdeasPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingIdea, setEditingIdea] = useState<TripIdea | null>(null)
  const [formData, setFormData] = useState<IdeaFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingIdea) {
        // Update existing idea
        const { error } = await TripService.updateTripIdea(editingIdea.id, formData)
        if (error) throw error
      } else {
        // Create new idea
        const newIdea: NewTripIdea = {
          trip_id: tripId,
          ...formData
        }
        const { error } = await TripService.createTripIdea(newIdea)
        if (error) throw error
      }

      // Reset form and refresh ideas
      setFormData(emptyForm)
      setShowForm(false)
      setEditingIdea(null)
      onIdeasChange()
    } catch (err: any) {
      console.error('Error saving idea:', err)
      setError(err.message || 'Failed to save idea')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (idea: TripIdea) => {
    setEditingIdea(idea)
    setFormData({
      title: idea.title,
      description: idea.description || '',
      category: idea.category || 'activity',
      location: idea.location || '',
      notes: idea.notes || '',
      url: idea.url || '',
      estimated_duration: idea.estimated_duration || '',
      priority: idea.priority
    })
    setShowForm(true)
  }

  const handleDelete = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return

    try {
      const { error } = await TripService.deleteTripIdea(ideaId)
      if (error) throw error
      onIdeasChange()
    } catch (err: any) {
      console.error('Error deleting idea:', err)
      setError(err.message || 'Failed to delete idea')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingIdea(null)
    setFormData(emptyForm)
    setError(null)
  }

  // Sort ideas by priority (high -> medium -> low) then by created date
  const sortedIdeas = [...ideas].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-semibold">Trip Ideas</h3>
            <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
              {ideas.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              aria-label="Add new idea"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-white" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Form */}
              {showForm && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <h4 className="font-medium text-gray-900 text-sm">
                    {editingIdea ? 'Edit Idea' : 'New Idea'}
                  </h4>

                  <div>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Idea title *"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="activity">Activity</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="flight">Flight</option>
                      <option value="transport">Transport</option>
                      <option value="other">Other</option>
                    </select>

                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                      placeholder="Duration (e.g., 2 hours)"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="URL (website, booking link, etc.)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : editingIdea ? 'Update' : 'Add Idea'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Ideas List */}
              {sortedIdeas.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 px-1">
                    Drag ideas onto the itinerary to schedule them
                  </p>
                  <AnimatePresence>
                    {sortedIdeas.map((idea) => (
                      <DraggableIdea
                        key={idea.id}
                        idea={idea}
                        onEdit={() => handleEdit(idea)}
                        onDelete={() => handleDelete(idea.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-1">No ideas yet</p>
                  <p className="text-xs">Add ideas that you might want to add to your trip</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
