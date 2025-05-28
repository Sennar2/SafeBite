import React from 'react'
import { Link } from 'react-router-dom'
import {
  FaBars,
  FaSignOutAlt,
  FaTachometerAlt,
  FaClipboardList,
  FaThermometerHalf,
  FaChartLine,
  FaFileExport,
  FaUserAlt,
  FaCogs
} from 'react-icons/fa'
import { supabase } from '../supabase/client'

export default function Sidebar({
  isCollapsed,
  toggleCollapse
}: {
  isCollapsed: boolean
  toggleCollapse: () => void
}) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const menu = [
    { to: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin', icon: <FaUserAlt />, label: 'Admin' },
    { to: '/checklist', icon: <FaClipboardList />, label: 'Checklist' },
    { to: '/temperatures', icon: <FaThermometerHalf />, label: 'Temperatures' },
    { to: '/progress', icon: <FaChartLine />, label: 'Progress' },
    { to: '/temperature-trends', icon: <FaChartLine />, label: 'Trends' },
    { to: '/export', icon: <FaFileExport />, label: 'Export' },
    { to: '/user-activity', icon: <FaUserAlt />, label: 'User Activity' },
    { to: '/checklist-admin', icon: <FaCogs />, label: 'Checklist Admin' },
  ]

  return (
    <aside
      className={`bg-gradient-to-b from-teal-700 to-cyan-500 text-white transition-all duration-300 h-full ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}
    >
      <div className="flex items-center justify-end p-2">
        <button
          onClick={toggleCollapse}
          className="text-white hover:text-gray-200 focus:outline-none"
        >
          <FaBars />
        </button>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 mt-4">
        {menu.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-2 hover:bg-teal-800 transition ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-lg">{icon}</span>
            {!isCollapsed && <span className="text-sm">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full gap-2 text-red-100 hover:text-white hover:bg-red-600 px-2 py-2 rounded transition ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
