import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, User, Plus, Menu, X, Map } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AnimatedLogo from './AnimatedLogo'

interface HeaderProps {
  showCreateButton?: boolean
}

export default function Header({ showCreateButton = true }: HeaderProps) {
  const { user, signOut, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  if (!user) return null

  return (
    <>
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
                  className={`font-medium transition-colors ${
                    isActive('/') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/look-back" 
                  className={`font-medium transition-colors flex items-center gap-2 ${
                    isActive('/look-back') ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  <Map className="w-4 h-4" />
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

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop user menu */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
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

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 sticky top-[73px] z-40 overflow-hidden"
          >
            <nav className="container py-4 space-y-2">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/look-back"
                onClick={closeMobileMenu}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/look-back') 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Map className="w-5 h-5" />
                Look Back
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {profile?.display_name || user.email}
                </div>
                <button
                  onClick={() => {
                    closeMobileMenu()
                    handleSignOut()
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}