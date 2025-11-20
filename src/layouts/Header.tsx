import React from 'react'
import { FaBars, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useMultiTenancy } from '../context/MultiTenancyContext'
import { getRoleDisplayName, getRoleIcon } from '../utils/multiTenancy'
import CompanySelector from '../components/CompanySelector'
import LocationSelector from '../components/LocationSelector'

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { profile, signOut } = useAuth()
  const { selectedCompany, selectedLocation } = useMultiTenancy()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-xl" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1 className="text-xl font-bold text-green-600">🛡️ Easy Bites</h1>
      </div>

      {/* Company and Location Selectors */}
      <div className="hidden md:flex items-center gap-6">
        <CompanySelector />
        <LocationSelector />
      </div>

      {/* User Info and Actions */}
      <div className="flex items-center gap-4">
        {/* Current Location Info */}
        {selectedLocation && (
          <div className="hidden lg:block text-sm text-gray-600">
            <p className="font-medium">{selectedLocation.name}</p>
            {selectedCompany && (
              <p className="text-xs text-gray-500">{selectedCompany.name}</p>
            )}
          </div>
        )}

        {/* User Role Badge */}
        {profile && (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-lg">{getRoleIcon(profile.role)}</span>
            <span className="text-xs font-medium text-gray-700 hidden sm:inline">
              {getRoleDisplayName(profile.role)}
            </span>
          </div>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
          <button
            title={profile?.full_name || 'User'}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaUser className="text-gray-600" />
          </button>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  )
}
