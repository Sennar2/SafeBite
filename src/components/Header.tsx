import React from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { useLocationContext } from '../context/LocationContext'

export default function Header() {
  const { profile } = useLocationContext()

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-3">
      <div className="text-xl font-semibold">Welcome to SafeBite</div>
      <div className="flex items-center gap-2 text-gray-700">
        <FaUserCircle className="text-2xl" />
        <span>{profile?.full_name || 'User'}</span>
      </div>
    </header>
  )
}
