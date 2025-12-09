import React from 'react'
import { useMultiTenancy } from '../context/MultiTenancyContext'

/**
 * LocationSelector component for switching between locations
 * Respects user role and assigned locations
 */
export const LocationSelector: React.FC = () => {
  const { locations, selectedLocation, setSelectedLocation } = useMultiTenancy()

  // Only show if there are multiple locations
  if (locations.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="location-select" className="text-sm font-medium text-gray-700">
        Location:
      </label>
      <select
        id="location-select"
        value={selectedLocation?.id || ''}
        onChange={(e) => {
          const location = locations.find(l => l.id === e.target.value)
          if (location) {
            setSelectedLocation(location)
          }
        }}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LocationSelector
