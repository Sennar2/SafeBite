import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useLocationContext } from '../context/LocationContext'
import {
  FaTemperatureLow,
  FaSnowflake,
  FaHamburger,
  FaTruck
} from 'react-icons/fa'

export default function Temperatures() {
  const [temps, setTemps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newEntry, setNewEntry] = useState({ type: 'fridge', value: '', unit_id: '', food_item_id: '', supplier_id: '' })
  const [units, setUnits] = useState<any[]>([])
  const [foodItems, setFoodItems] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const { selectedLocation, userId } = useLocationContext()
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [noteText, setNoteText] = useState('')

  const today = new Date()
  const start = new Date(today)
  if (today.getHours() < 2) start.setDate(start.getDate() - 1)
  start.setHours(2, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const isoStart = start.toISOString()
  const isoEnd = end.toISOString()

  const fetchTemps = async () => {
    if (!selectedLocation) return
    setLoading(true)
    const { data, error } = await supabase
      .from('temperatures')
      .select(`*, units(name), food_items(name), suppliers(name)`)
      .eq('location_id', selectedLocation)
      .gte('timestamp', isoStart)
      .lt('timestamp', isoEnd)
      .order('timestamp', { ascending: false })

    if (!error) setTemps(data || [])
    setLoading(false)
  }

  const fetchDropdownData = async () => {
    if (!selectedLocation) return

    const [unitsRes, foodRes, suppliersRes] = await Promise.all([
      supabase.from('units').select('*').eq('location_id', selectedLocation),
      supabase.from('food_items').select('*'),
      supabase.from('suppliers').select('*').eq('location_id', selectedLocation),
    ])

    if (!unitsRes.error) setUnits(unitsRes.data || [])
    if (!foodRes.error) setFoodItems(foodRes.data || [])
    if (!suppliersRes.error) setSuppliers(suppliersRes.data || [])
  }

  useEffect(() => {
    fetchTemps()
    fetchDropdownData()
  }, [selectedLocation])

  const handleLog = async () => {
    if (!selectedLocation || !newEntry.value || !newEntry.type) return

    const payload: any = {
      value: parseFloat(newEntry.value),
      type: newEntry.type,
      location_id: selectedLocation,
      created_by: userId,
      timestamp: new Date().toISOString(),
    }

    if (newEntry.type === 'fridge' || newEntry.type === 'freezer') {
      payload.unit_id = newEntry.unit_id
    } else if (newEntry.type === 'food') {
      payload.food_item_id = newEntry.food_item_id
    } else if (newEntry.type === 'delivery') {
      payload.supplier_id = newEntry.supplier_id
    }

    const { error } = await supabase.from('temperatures').insert([payload])

    if (error) {
      console.error('Insert error:', error)
      alert('Failed to log temperature')
      return
    }

    // trigger alert
    if (isUnsafe(payload)) {
      alert('⚠️ Temperature outside safe range! Please take corrective action.')
    }

    setNewEntry({ type: 'fridge', value: '', unit_id: '', food_item_id: '', supplier_id: '' })
    fetchTemps()
  }

  const isUnsafe = (t: any) => {
    const val = parseFloat(t.value)
    if (t.type === 'fridge') return val < 0 || val > 5
    if (t.type === 'freezer') return val < -25 || val > -15
    if (t.type === 'food') return val < 75
    if (t.type === 'delivery') return val > 5
    return false
  }

  const getRowClass = (t: any) => isUnsafe(t) ? 'bg-red-100' : ''

  const getLabel = (t: any) => {
    if (t.type === 'fridge') return <><FaTemperatureLow className="inline mr-1" /> {t.units?.name || 'N/A'}</>
    if (t.type === 'freezer') return <><FaSnowflake className="inline mr-1" /> {t.units?.name || 'N/A'}</>
    if (t.type === 'food') return <><FaHamburger className="inline mr-1" /> {t.food_items?.name || 'N/A'}</>
    if (t.type === 'delivery') return <><FaTruck className="inline mr-1" /> {t.suppliers?.name || 'N/A'}</>
    return 'N/A'
  }

  const handleNoteSave = async (id: string) => {
    const { error } = await supabase
      .from('temperatures')
      .update({ corrective_action: noteText })
      .eq('id', id)

    if (!error) {
      setEditingNoteId(null)
      setNoteText('')
      fetchTemps()
    }
  }

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-4">Log Temperature</h1>

      {/* Safety Info Box */}
      <div className="absolute right-0 top-0 bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded w-72 text-sm shadow">
        <p className="font-bold mb-1">Safe Temperature Guidelines:</p>
        <ul className="list-disc pl-5 mb-2">
          <li>Fridge: 0°C - 5°C</li>
          <li>Freezer: -25°C to -15°C</li>
          <li>Food: 75°C and above</li>
          <li>Delivery: ≤ 5°C</li>
        </ul>
        <p className="text-xs">Any safety issue or concern? Contact: <br /><strong>safety@lamiamamma.co.uk</strong></p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 max-w-xl space-y-3">
        <select
          value={newEntry.type}
          onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="fridge">Fridge</option>
          <option value="freezer">Freezer</option>
          <option value="food">Food</option>
          <option value="delivery">Delivery</option>
        </select>

        <input
          type="number"
          value={newEntry.value}
          onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
          placeholder="Temperature °C"
          className="border px-3 py-2 rounded w-full"
        />

        {(newEntry.type === 'fridge' || newEntry.type === 'freezer') && (
          <select
            value={newEntry.unit_id}
            onChange={(e) => setNewEntry({ ...newEntry, unit_id: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select Unit --</option>
            {units.filter((u) => u.type === newEntry.type).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        {newEntry.type === 'food' && (
          <select
            value={newEntry.food_item_id}
            onChange={(e) => setNewEntry({ ...newEntry, food_item_id: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select Food Item --</option>
            {foodItems.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}

        {newEntry.type === 'delivery' && (
          <select
            value={newEntry.supplier_id}
            onChange={(e) => setNewEntry({ ...newEntry, supplier_id: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleLog}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          Log Temperature
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Recent Logs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="text-sm w-full border bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Label</th>
              <th className="text-left px-3 py-2">Value (°C)</th>
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">Corrective?</th>
              <th className="text-left px-3 py-2">Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {temps.map((t, idx) => (
              <tr key={idx} className={`border-t ${getRowClass(t)}`}>
                <td className="px-3 py-2 capitalize">{t.type}</td>
                <td className="px-3 py-2">{getLabel(t)}</td>
                <td className="px-3 py-2">{t.value}</td>
                <td className="px-3 py-2">{new Date(t.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">
                  {t.corrective_action ? (
                    <span className="text-red-600 font-semibold">⚠️ Yes</span>
                  ) : (
                    <span className="text-green-600">No</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {t.corrective_action ? (
                    <>
                      {editingNoteId === t.id ? (
                        <div className="flex flex-col space-y-1">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="border p-1 rounded"
                          />
                          <button
                            onClick={() => handleNoteSave(t.id)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                          >
                            Save Note
                          </button>
                        </div>
                      ) : (
                        <>
                          <p>{t.corrective_action}</p>
                          <button
                            onClick={() => {
                              setEditingNoteId(t.id)
                              setNoteText(t.corrective_action || '')
                            }}
                            className="text-xs text-blue-600 underline"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNoteId(t.id)
                        setNoteText('')
                      }}
                      className="text-xs text-blue-600 underline"
                    >
                      Add Note
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
