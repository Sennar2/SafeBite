import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaUsersCog,
  FaClipboardList,
  FaTemperatureLow,
  FaChartLine,
  FaChartBar,
  FaFileExport,
  FaUserCheck,
  FaCogs,
  FaSignOutAlt,
  FaTimes,
} from 'react-icons/fa'

const navItems = [
  { to: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { to: '/admin', icon: <FaUsersCog />, label: 'Admin' },
  { to: '/checklist', icon: <FaClipboardList />, label: 'Checklist' },
  { to: '/temperatures', icon: <FaTemperatureLow />, label: 'Temperatures' },
  { to: '/progress', icon: <FaChartLine />, label: 'Progress' },
  { to: '/temperature-trends', icon: <FaChartBar />, label: 'Trends' },
  { to: '/export', icon: <FaFileExport />, label: 'Export' },
  { to: '/user-activity', icon: <FaUserCheck />, label: 'User Activity' },
  { to: '/checklist-admin', icon: <FaCogs />, label: 'Checklist Admin' },
]

export default function Sidebar({
  collapsed,
  toggleCollapsed,
  isMobileOpen,
  toggleMobileOpen,
}: {
  collapsed: boolean
  toggleCollapsed: () => void
  isMobileOpen: boolean
  toggleMobileOpen: () => void
}) {
  const location = useLocation()
  const width = collapsed ? 'w-16' : 'w-64'

  return (
    <div
      className={`
        transition-all duration-300 h-screen bg-gradient-to-b from-teal-700 to-cyan-500 text-white flex flex-col z-50
        ${width}
        fixed md:static top-0 left-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-xl font-bold">SafeBite</h1>}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              toggleMobileOpen()
            } else {
              toggleCollapsed()
            }
          }}
          className="text-white text-xl"
        >
          {window.innerWidth < 768 ? <FaTimes /> : '☰'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => {
              if (window.innerWidth < 768) toggleMobileOpen()
            }}
            className={`flex items-center gap-3 p-2 rounded hover:bg-white hover:text-teal-700 transition-all ${
              location.pathname === item.to
                ? 'bg-white text-teal-700 font-bold'
                : ''
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto p-4 border-t border-teal-600">
        <button className="flex items-center gap-2 hover:text-red-300">
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
