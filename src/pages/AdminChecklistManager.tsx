import React, { useEffect, useState } from "react"
import { supabase } from "../supabase/client"
import { useLocationContext } from "../context/LocationContext"

export default function ChecklistAdmin() {
  const [title, setTitle] = useState("")
  const [frequency, setFrequency] = useState("")
  const [checklists, setChecklists] = useState([])
  const { locations, selectedLocation, setSelectedLocation } = useLocationContext()

  const fetchChecklists = async () => {
    const { data } = await supabase
      .from("checklists")
      .select("id, title, frequency")
      .eq("location_id", selectedLocation)
    setChecklists(data || [])
  }

  useEffect(() => {
    if (selectedLocation) fetchChecklists()
  }, [selectedLocation])

  const handleAdd = async () => {
    if (!title || !frequency || !selectedLocation) return
    await supabase.from("checklists").insert({
      title,
      frequency,
      location_id: selectedLocation,
      created_at: new Date().toISOString(),
    })
    setTitle("")
    fetchChecklists()
  }

  const handleDelete = async (id) => {
    await supabase.from("checklists").delete().eq("id", id)
    fetchChecklists()
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Checklist Admin</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Checklist name"
        className="border px-3 py-1 w-full rounded mb-2"
      />
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="border px-3 py-1 w-full mb-2 rounded">
        <option value="">Select frequency</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="border px-3 py-1 w-full mb-2 rounded">
        <option value="">Select location</option>
        {locations.map(loc => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>

      <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">Add Checklist Item</button>

      <ul className="space-y-2">
        {checklists.map((c) => (
          <li key={c.id} className="flex justify-between items-center border-b py-1">
            <span>{c.title} ({c.frequency})</span>
            <button onClick={() => handleDelete(c.id)} className="text-red-500">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}