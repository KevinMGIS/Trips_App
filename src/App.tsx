import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import CreateTripPage from './components/CreateTripPage'
import TripDetailPage from './components/TripDetailPage'
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
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'booked': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
      {trip.cover_image_url && (
        <div className="aspect-video w-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-t-xl mb-4">
          <img 
            src={trip.cover_image_url} 
            alt={trip.title}
            className="w-full h-full object-cover rounded-t-xl"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{trip.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
            {trip.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{trip.destination}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
          </div>
          

        </div>

        {daysUntil > 0 && trip.status !== 'completed' && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{daysUntil} days to go</span>
          </div>
        )}
        
        {trip.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{trip.description}</p>
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

  // Calculate stats and group trips
  const upcomingTrips = trips.filter(trip => 
    parseDate(trip.start_date) > new Date() && trip.status !== 'cancelled'
  )
  const inProgressTrips = trips.filter(trip => trip.status === 'in_progress')
  const completedTrips = trips.filter(trip => trip.status === 'completed')
  const pastTrips = trips.filter(trip => 
    parseDate(trip.end_date) < new Date() && trip.status !== 'in_progress'
  )

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
              {process.env.NODE_ENV === 'development' && (
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
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
