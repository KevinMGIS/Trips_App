import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { auth, supabase } from '../lib/supabase'
import type { UserProfile } from '../types/database'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Debug logging for state changes
  useEffect(() => {
    console.log('AuthProvider state updated - user:', user?.email, 'loading:', loading)
  }, [user, loading])

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ data: { session }, error }: { data: { session: Session | null }, error: any }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email)
        console.log('Setting user:', session?.user)
        console.log('Setting session:', session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id)
          // Temporarily set loading to false first, then fetch profile in background
          setLoading(false)
          fetchProfile(session.user.id) // Don't await to prevent blocking
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('fetchProfile started for userId:', userId)
      // Fetch the user profile from our user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      console.log('fetchProfile query result - data:', data, 'error:', error)
      
      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, create a basic one from user data
        const fallbackProfile = {
          id: userId,
          display_name: user?.email?.split('@')[0] || 'User',
          avatar_url: undefined,
          phone: undefined,
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        console.log('Setting fallback profile:', fallbackProfile)
        setProfile(fallbackProfile)
      } else {
        console.log('Setting profile from database:', data)
        setProfile(data)
      }
      console.log('fetchProfile completed successfully')
    } catch (error) {
      console.error('fetchProfile exception:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn attempt for:', email)
      setLoading(true)
      const { error } = await auth.signIn(email, password)
      console.log('SignIn result - error:', error)
      if (error) {
        console.log('SignIn failed:', error.message)
        setLoading(false)
      }
      return { error }
    } catch (error) {
      console.log('SignIn exception:', error)
      setLoading(false)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await auth.signUp(email, password)
      if (!error) {
        // Don't set loading to false here, let the auth state change handler do it
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
        setSession(null)
      }
      return { error }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await auth.resetPassword(email)
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}