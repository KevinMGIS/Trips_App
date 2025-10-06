import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import './index.css'

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

// Main Dashboard (placeholder)
function Dashboard() {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container-mobile py-8">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Trips! 🎉
          </h1>
          <p className="text-base text-gray-600 mb-6">
            Hello {user?.email}! Your beautiful trip planning app is ready.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <h3 className="font-semibold text-orange-700 mb-2">What's Next?</h3>
              <ul className="text-sm text-orange-600 space-y-1">
                <li>• Set up your Supabase database</li>
                <li>• Create your first trip</li>
                <li>• Invite your partner</li>
                <li>• Start planning adventures!</li>
              </ul>
            </div>
            <button
              onClick={() => signOut()}
              className="btn-secondary"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
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
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
