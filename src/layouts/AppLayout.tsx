import React, { useState } from 'react'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setIsMobileOpen(prev => !prev)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(prev => !prev)}
        isMobileOpen={isMobileOpen}
        toggleMobileOpen={toggleSidebar}
      />

      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-6 bg-gray-100 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
