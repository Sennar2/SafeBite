import React from 'react'
import { FaBars } from 'react-icons/fa'
import logo from '../assets/logo.svg' // Replace this with the actual logo path

export default function AppHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-3 border-b">
      <button className="text-teal-700 text-2xl md:hidden" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <img src={logo} alt="SafeBite Logo" className="h-8 mx-auto" />
      <div className="w-6" /> {/* spacer */}
    </header>
  )
}