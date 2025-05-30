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
      className={`bg-gradient-to-b from-teal-700 to-cyan-500 text-white
      h-full transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'} 
      fixed md:static z-40`}
    >
      <div className="flex justify-between items-center p-4">
        {!isCollapsed && <h1 className="text-xl font-bold">Menu</h1>}
        <button onClick={toggleCollapse} className="text-white text-xl md:hidden">
          ☰
        </button>
      </div>

      <nav className="flex flex-col gap-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 p-2 rounded hover:bg-white hover:text-teal-700 ${
              location.pathname === item.to ? 'bg-white text-teal-700 font-bold' : ''
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <button className="flex items-center gap-2 hover:text-red-300">
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
