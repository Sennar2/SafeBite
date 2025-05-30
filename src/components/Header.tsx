import React from 'react'

export default function AppHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <button onClick={toggleSidebar} className="text-xl md:hidden">
        ☰
      </button>
      <h1 className="text-lg font-semibold mx-auto">SafeBite</h1>
    </header>
  )
}
