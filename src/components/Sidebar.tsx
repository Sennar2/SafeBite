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
  isCollapsed,
  toggleCollapse,
}: {
  isCollapsed: boolean
  toggleCollapse: () => void
}) {
  const location = useLocation()

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-gradient-to-b from-teal-700 to-cyan-500 text-white 
        transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-64'}
        h-full flex flex-col
      `}
    >
      <div className="flex items-center justify-between p-4 md:justify-center">
        {!isCollapsed && <h1 className="text-xl font-bold">Menu</h1>}
        <button
          onClick={toggleCollapse}
          className="md:hidden text-white text-xl focus:outline-none"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-2 overflow-y-auto">
        {navItems.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 p-3 rounded hover:bg-white hover:text-teal-700 transition ${
              location.pathname === to ? 'bg-white text-teal-800 font-bold' : ''
            }`}
          >
            <span className="text-lg">{icon}</span>
            {!isCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white">
        <button className="flex items-center gap-2 w-full text-left hover:text-red-300">
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
