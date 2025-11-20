import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { UserProfile, UserRole } from '../utils/multiTenancy'

interface AuthContextType {
  user: any | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_id, role, location_ids, created_at')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Error fetching profile:', fetchError)
        setError('Failed to load user profile')
        return
      }

      if (data) {
        setProfile(data as UserProfile)
        setError(null)
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      setError('Failed to load user profile')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        throw signInError
      }

      if (data.user) {
        setUser(data.user)
        await fetchUserProfile(data.user.id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        throw signUpError
      }

      if (data.user) {
        setUser(data.user)
        // Create profile for new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              full_name: fullName,
              role: 'manager', // Default role for new users
              location_ids: [],
            },
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
          setError('Failed to create user profile')
        } else {
          await fetchUserProfile(data.user.id)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        setError(signOutError.message)
        throw signOutError
      }

      setUser(null)
      setProfile(null)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
  }

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false
    
    // Import permission checking logic from multiTenancy utils
    const { ROLE_PERMISSIONS } = require('../utils/multiTenancy')
    const permissions = ROLE_PERMISSIONS[profile.role]
    
    return permissions?.[permission] || false
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user && !!profile,
    hasRole,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
