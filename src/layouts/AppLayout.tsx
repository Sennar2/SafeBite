import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar flows naturally in flex layout */}
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(prev => !prev)}
      />

      {/* Main content flexes beside the sidebar, no manual ml-64! */}
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <Header />
        <main className="p-6 bg-gray-100 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
