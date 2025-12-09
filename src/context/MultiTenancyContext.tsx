import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from './AuthContext'
import { Company } from '../utils/multiTenancy'

interface Location {
  id: string
  company_id: string
  name: string
  address?: string
  phone?: string
  created_at: string
}

interface MultiTenancyContextType {
  companies: Company[]
  selectedCompany: Company | null
  setSelectedCompany: (company: Company) => void
  
  locations: Location[]
  selectedLocation: Location | null
  setSelectedLocation: (location: Location) => void
  
  userCompanies: Company[]
  userLocations: Location[]
  
  loading: boolean
  error: string | null
  
  canAccessCompany: (companyId: string) => boolean
  canAccessLocation: (locationId: string) => boolean
}

const MultiTenancyContext = createContext<MultiTenancyContextType | undefined>(undefined)

export const MultiTenancyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAuthenticated } = useAuth()
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  
  const [userCompanies, setUserCompanies] = useState<Company[]>([])
  const [userLocations, setUserLocations] = useState<Location[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load companies based on user role
  useEffect(() => {
    if (!isAuthenticated || !profile) {
      setLoading(false)
      return
    }

    const loadCompanies = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase.from('companies').select('*')

        // Super users can see all companies
        if (profile.role === 'super_user') {
          // No filter needed
        } else {
          // Other roles can only see their own company
          query = query.eq('company_id', profile.company_id)
        }

        const { data, error: fetchError } = await query.order('name')

        if (fetchError) {
          console.error('Error fetching companies:', fetchError)
          setError('Failed to load companies')
          return
        }

        setCompanies(data || [])
        setUserCompanies(data || [])

        // Set default selected company
        if (data && data.length > 0) {
          const defaultCompany = data[0]
          setSelectedCompany(defaultCompany)
        }
      } catch (err) {
        console.error('Error in loadCompanies:', err)
        setError('Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [isAuthenticated, profile])

  // Load locations based on selected company and user role
  useEffect(() => {
    if (!isAuthenticated || !profile || !selectedCompany) {
      setLocations([])
      setSelectedLocation(null)
      return
    }

    const loadLocations = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('locations')
          .select('*')
          .eq('company_id', selectedCompany.id)

        // Managers can only see their assigned locations
        if (profile.role === 'manager' && profile.location_ids && profile.location_ids.length > 0) {
          query = query.in('id', profile.location_ids)
        }

        const { data, error: fetchError } = await query.order('name')

        if (fetchError) {
          console.error('Error fetching locations:', fetchError)
          setError('Failed to load locations')
          return
        }

        setLocations(data || [])
        setUserLocations(data || [])

        // Set default selected location
        if (data && data.length > 0) {
          const defaultLocation = data[0]
          setSelectedLocation(defaultLocation)
        } else {
          setSelectedLocation(null)
        }
      } catch (err) {
        console.error('Error in loadLocations:', err)
        setError('Failed to load locations')
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [isAuthenticated, profile, selectedCompany])

  const canAccessCompany = (companyId: string): boolean => {
    if (!profile) return false
    if (profile.role === 'super_user') return true
    return profile.company_id === companyId
  }

  const canAccessLocation = (locationId: string): boolean => {
    if (!profile) return false
    if (profile.role === 'super_user') return true
    if (profile.role === 'company_admin' || profile.role === 'ops') {
      // Check if location belongs to their company
      return locations.some(loc => loc.id === locationId && loc.company_id === profile.company_id)
    }
    if (profile.role === 'manager') {
      // Check if location is in their assigned locations
      return profile.location_ids?.includes(locationId) || false
    }
    return false
  }

  const value: MultiTenancyContextType = {
    companies,
    selectedCompany,
    setSelectedCompany,
    locations,
    selectedLocation,
    setSelectedLocation,
    userCompanies,
    userLocations,
    loading,
    error,
    canAccessCompany,
    canAccessLocation,
  }

  return (
    <MultiTenancyContext.Provider value={value}>
      {children}
    </MultiTenancyContext.Provider>
  )
}

export const useMultiTenancy = (): MultiTenancyContextType => {
  const context = useContext(MultiTenancyContext)
  if (context === undefined) {
    throw new Error('useMultiTenancy must be used within a MultiTenancyProvider')
  }
  return context
}
