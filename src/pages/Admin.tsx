import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useLocationContext } from '../context/LocationContext'
import {
  FaUser,
  FaMapMarkerAlt,
  FaTruck,
  FaThermometerHalf,
  FaUtensils,
  FaTrash,
  FaPlus,
} from 'react-icons/fa'

const tabs = [
  { name: 'Users', icon: FaUser },
  { name: 'Locations', icon: FaMapMarkerAlt },
  { name: 'Suppliers', icon: FaTruck },
  { name: 'Units', icon: FaThermometerHalf },
  { name: 'Food Items', icon: FaUtensils },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Users')
  const [data, setData] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [email, setEmail] = useState('')
  const [unitType, setUnitType] = useState('')
  const [newUnitLocation, setNewUnitLocation] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [message, setMessage] = useState('')
  const { role, locations } = useLocationContext()

  const tableMap: Record<string, string> = {
    Users: 'profiles',
    Locations: 'locations',
    Suppliers: 'suppliers',
    Units: 'units',
    'Food Items': 'food_items',
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    const table = tableMap[activeTab]
    const { data } = await supabase.from(table).select('*')
    setData(data || [])
  }

  const handleAdd = async () => {
    setMessage('')
    if (!input.trim()) return

    if (activeTab === 'Users') {
      if (!email || !selectedRole || !newUnitLocation) {
        alert('Please enter name, email, role, and location.')
        return
      }

      try {
        const res = await fetch('/api/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: input,
            role: selectedRole,
            location_id: newUnitLocation,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        setMessage('✅ User created and invite sent.')
        setInput('')
        setEmail('')
        setSelectedRole('')
        setNewUnitLocation('')
        loadData()
      } catch (err) {
        console.error('User creation failed:', err)
        setMessage('❌ Failed to create user.')
      }
      return
    }

    if (activeTab === 'Units') {
      if (!newUnitLocation || !unitType) {
        alert('Please select a location and type.')
        return
      }

      const payload = {
        name: input,
        type: unitType,
        location_id: newUnitLocation,
      }

      const { error } = await supabase.from('units').insert(payload).select()
      if (error) {
        alert('Failed to create unit.')
        return
      }

      setInput('')
      setUnitType('')
      setNewUnitLocation('')
      loadData()
      return
    }

    if (activeTab === 'Suppliers') {
      if (!newUnitLocation) {
        alert('Please select a location.')
        return
      }

      const { error } = await supabase
        .from('suppliers')
        .insert({ name: input, location_id: newUnitLocation })
        .select()

      if (error) {
        alert('Failed to create supplier.')
        return
      }

      setInput('')
      setNewUnitLocation('')
      loadData()
      return
    }

    const { error } = await supabase
      .from(tableMap[activeTab])
      .insert({ name: input })
      .select()

    if (error) {
      alert('Insert failed.')
      return
    }

    setInput('')
    loadData()
  }

  const handleDelete = async (id: string) => {
    const table = tableMap[activeTab]
    await supabase.from(table).delete().eq('id', id)
    loadData()
  }

  if (role !== 'admin') {
    return <p className="text-red-600 font-bold">Access Denied – Admins Only</p>
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {tabs.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 shadow-sm
              ${
                activeTab === name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
              }`}
          >
            <Icon size={16} />
            <span className="font-medium">{name}</span>
          </button>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded shadow space-y-5 border">
        <h2 className="text-xl font-semibold text-gray-800">Add New {activeTab.slice(0, -1)}</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border px-3 py-2 rounded"
            placeholder={activeTab === 'Users' ? 'Full Name' : 'Name'}
          />

          {activeTab === 'Users' && (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border px-3 py-2 rounded"
                placeholder="Email Address"
              />

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">-- Select Role --</option>
                <option value="admin">Admin</option>
                <option value="site_manager">Site Manager</option>
              </select>

              <select
                value={newUnitLocation}
                onChange={(e) => setNewUnitLocation(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">-- Select Location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === 'Units' && (
            <>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">-- Select Unit Type --</option>
                <option value="fridge">Fridge</option>
                <option value="freezer">Freezer</option>
              </select>

              <select
                value={newUnitLocation}
                onChange={(e) => setNewUnitLocation(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">-- Select Location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === 'Suppliers' && (
            <select
              value={newUnitLocation}
              onChange={(e) => setNewUnitLocation(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">-- Select Location --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white py-2 px-4 mt-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <FaPlus /> Add
        </button>

        {message && <p className="text-sm text-blue-700 mt-2">{message}</p>}
      </div>

      {/* List */}
      <ul className="bg-white mt-6 rounded shadow divide-y border">
        {data.map((item) => (
          <li key={item.id} className="flex justify-between items-center py-3 px-4">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{item.name || item.full_name}</span>
              {item.role && (
                <span className="text-xs text-white px-2 py-0.5 rounded bg-blue-600 w-fit mt-1">
                  {item.role}
                </span>
              )}
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
