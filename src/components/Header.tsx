import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AnimatedLogo from './AnimatedLogo'

interface HeaderProps {
  showCreateButton?: boolean
}

export default function Header({ showCreateButton = true }: HeaderProps) {
  const { user, signOut, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) return null

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo and nav */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <AnimatedLogo size={80} showText={false} />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Trips
              </span>
            </Link>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/look-back" 
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                Look Back
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {showCreateButton && (
              <motion.button
                onClick={() => navigate('/create-trip')}
                className="btn-primary flex items-center gap-2 text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Trip</span>
                <span className="sm:hidden">New</span>
              </motion.button>
            )}

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{profile?.display_name || user.email}</span>
              </div>
              
              <motion.button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}