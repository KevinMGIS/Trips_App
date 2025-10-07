import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import CreateTripPage from './components/CreateTripPage'
import TripDetailPage from './components/TripDetailPage'
import LookBackPage from './components/LookBackPage'
import Header from './components/Header'
import AnimatedLogo from './components/AnimatedLogo'
import './index.css'
import { useState, useEffect } from 'react'
import { TripService } from './lib/tripService'
import type { Trip } from './types/database'
import { MapPin, Calendar, Clock } from 'lucide-react'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  // Debug logging
  console.log('ProtectedRoute - user:', user?.email, 'loading:', loading)

  if (loading) {
    console.log('ProtectedRoute - showing loading state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - user authenticated, showing dashboard')
  return <>{children}</>
}

// Trip Card Component
function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  
  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/90 text-white border-blue-300'
      case 'booked': return 'bg-green-500/90 text-white border-green-300'
      case 'in_progress': return 'bg-orange-500/90 text-white border-orange-300'
      case 'completed': return 'bg-gray-500/90 text-white border-gray-300'
      case 'cancelled': return 'bg-red-500/90 text-white border-red-300'
      default: return 'bg-gray-500/90 text-white border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('T')[0].split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('T')[0].split('-')
    const tripDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const diffTime = tripDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntil = getDaysUntil(trip.start_date)
  
  return (
    <motion.div
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      {trip.cover_image_url ? (
        <div className="aspect-video w-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-400 rounded-t-xl mb-4 relative overflow-hidden">
          <img 
            src={trip.cover_image_url} 
            alt={trip.title}
            className="w-full h-full object-cover rounded-t-xl"
          />
          {/* Status badge overlay */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getStatusColor(trip.status)}`}>
              {trip.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-t-xl mb-4 relative flex items-center justify-center overflow-hidden">
          {/* Dynamic background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 right-8 w-6 h-6 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-8 right-6 w-4 h-4 bg-white rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-4 left-8 w-5 h-5 bg-white rounded-full animate-pulse delay-700"></div>
          </div>
          
          {/* Center content */}
          <div className="text-center text-white z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MapPin className="w-12 h-12 mx-auto mb-2 drop-shadow-lg" />
              <p className="text-lg font-bold drop-shadow-md">{trip.destination}</p>
              <p className="text-sm opacity-90">{trip.title}</p>
            </motion.div>
          </div>
          
          {/* Status badge overlay */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getStatusColor(trip.status)}`}>
              {trip.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">{trip.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="line-clamp-1">{trip.destination}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
          </div>
          
          {daysUntil > 0 && trip.status !== 'completed' && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600 font-medium">
                {daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days to go`}
              </span>
            </div>
          )}
          
          {trip.status === 'completed' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Trip completed</span>
            </div>
          )}
        </div>

        {trip.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{trip.description}</p>
        )}
      </div>
    </motion.div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color = 'text-gray-700', bgColor = 'bg-white' }: {
  title: string
  value: string | number
  icon: any
  color?: string
  bgColor?: string
}) {
  return (
    <motion.div 
      className={`${bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 mb-4">
          <Icon className="w-8 h-8 text-orange-500" />
        </div>
        <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
    </motion.div>
  )
}

// Main Dashboard
function Dashboard() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.id) {
      loadTrips()
    }
  }, [user])

  const loadTrips = async () => {
    if (!user || !user.id) {
      return
    }
    
    setLoading(true)
    const { data, error } = await TripService.getUserTrips(user.id)
    
    if (error) {
      console.error('Error loading trips:', error)
    } else {
      setTrips(data || [])
    }
    setLoading(false)
  }

  // Helper function to parse date safely
  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  // Helper function to get days until trip
  const getDaysUntilTrip = (startDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tripDate = parseDate(startDate)
    const diffTime = tripDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calculate stats and group trips - sorted by closest date first
  const upcomingTrips = trips
    .filter(trip => parseDate(trip.start_date) > new Date() && trip.status !== 'cancelled')
    .sort((a, b) => getDaysUntilTrip(a.start_date) - getDaysUntilTrip(b.start_date))
    
  const inProgressTrips = trips
    .filter(trip => trip.status === 'in_progress')
    .sort((a, b) => parseDate(a.start_date).getTime() - parseDate(b.start_date).getTime())
    
  const completedTrips = trips
    .filter(trip => trip.status === 'completed')
    .sort((a, b) => parseDate(b.end_date).getTime() - parseDate(a.end_date).getTime()) // Most recent first
    
  const pastTrips = trips
    .filter(trip => parseDate(trip.end_date) < new Date() && trip.status !== 'in_progress')
    .sort((a, b) => parseDate(b.end_date).getTime() - parseDate(a.end_date).getTime()) // Most recent first

  return (
    <>
      <Header />
      <motion.div 
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container py-8 md:py-12">


          {loading ? (
            <motion.div 
              className="flex items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </motion.div>
          ) : trips.length === 0 ? (
            /* Empty State */
            <motion.div
              className="card p-8 md:p-12 text-center max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatedLogo size={100} />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Your Journey
              </h2>
              <p className="text-gray-600 mb-6">
                No trips found. Create your first trip using the "Create Trip" button in the header above!
              </p>
              
              {/* Debug info for development */}
              {import.meta.env.DEV && (
                <div className="text-xs text-gray-400 mb-4 font-mono p-2 bg-gray-50 rounded">
                  Debug Info:<br />
                  User ID: {user?.id || 'No ID'}<br />
                  Email: {user?.email || 'No email'}<br />
                  Trips count: {trips.length}<br />
                  Loading: {loading.toString()}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Stats Section */}
              <motion.div 
                className="grid grid-cols-3 gap-6 mb-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <StatsCard
                  title="Total Trips"
                  value={trips.length}
                  icon={MapPin}
                  color="text-orange-600"
                />
                <StatsCard
                  title="Upcoming"
                  value={upcomingTrips.length}
                  icon={Calendar}
                  color="text-blue-600"
                />
                <StatsCard
                  title="Completed"
                  value={completedTrips.length}
                  icon={Clock}
                  color="text-green-600"
                />
              </motion.div>

              {/* Upcoming Trips */}
              {upcomingTrips.length > 0 && (
                <motion.section
                  className="mb-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Upcoming Trips</h2>
                      <p className="text-sm text-gray-500">{upcomingTrips.length} trip{upcomingTrips.length !== 1 ? 's' : ''} planned</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                      >
                        <TripCard trip={trip} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* In Progress Trips */}
              {inProgressTrips.length > 0 && (
                <motion.section
                  className="mb-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">In Progress</h2>
                      <p className="text-sm text-gray-500">{inProgressTrips.length} active trip{inProgressTrips.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                      >
                        <TripCard trip={trip} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Past Trips */}
              {pastTrips.length > 0 && (
                <motion.section
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Past Trips</h2>
                      <p className="text-sm text-gray-500">{pastTrips.length} completed adventure{pastTrips.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                      >
                        <TripCard trip={trip} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-trip"
            element={
              <ProtectedRoute>
                <CreateTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/look-back"
            element={
              <ProtectedRoute>
                <LookBackPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
