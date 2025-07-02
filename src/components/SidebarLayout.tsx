import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'

export default function SidebarLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <AppHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <main className="flex-1 p-4 bg-gray-100 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
