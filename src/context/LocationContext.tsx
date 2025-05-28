import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../supabase/client"

const LocationContext = createContext()

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserAndLocations = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (!user) return

        setUserId(user.id)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, location_id")
          .eq("id", user.id)
          .single()

        console.log("Fetched profile:", profile)

        if (!profile || profileError) {
          console.warn("No profile found for user:", user.email)
          setError("No profile found.")
          return
        }

        setRole(profile.role)

        if (profile.role === "admin") {
          const { data: allLocations } = await supabase.from("locations").select("*")
          setLocations(allLocations || [])
          if (!selectedLocation && allLocations?.length > 0) {
            setSelectedLocation(allLocations[0].id)
          }
        } else {
          const { data: loc } = await supabase
            .from("locations")
            .select("*")
            .eq("id", profile.location_id)
            .single()

          if (loc) {
            setLocations([loc])
            setSelectedLocation(loc.id)
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err)
        setError("Failed to load profile.")
      }
    }

    fetchUserAndLocations()
  }, [])

  return (
    <LocationContext.Provider
      value={{
        locations,
        selectedLocation,
        setSelectedLocation,
        role,
        userId,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocationContext = () => useContext(LocationContext)
