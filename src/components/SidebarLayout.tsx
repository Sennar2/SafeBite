import React, { useState } from 'react'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import { Outlet } from 'react-router-dom'

export default function SidebarLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex flex-col flex-1">
        <AppHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}