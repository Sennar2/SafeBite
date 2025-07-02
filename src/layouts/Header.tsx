import React from 'react'
import { FaBars } from 'react-icons/fa'

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <button className="md:hidden text-xl" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <h1 className="text-xl font-bold">SafeBite</h1>
    </header>
  )
}
