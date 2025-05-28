import React, { useState } from 'react'
import { supabase } from '../supabase/client'
import { exportToPDF, exportToExcel } from '../utils/exportUtils'
import { useLocationContext } from '../context/LocationContext'
import { FaFilePdf, FaFileExcel, FaDatabase, FaCalendarAlt } from 'react-icons/fa'

export default function Export() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState('temperature')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const { selectedLocation } = useLocationContext()

  const fetchData = async () => {
    if (!selectedLocation || !startDate || !endDate) {
      alert('Please select a location and date range.')
      return
    }

    setLoading(true)

    if (type === 'temperature') {
      const { data, error } = await supabase
        .from('temperatures')
        .select(`
          id, type, value, timestamp,
          corrective_action, corrective_action_required,
          corrective_action_note, unit_id, food_item_id,
          created_by, units (name), food_items (name)
        `)
        .gte('timestamp', `${startDate}T00:00:00Z`)
        .lte('timestamp', `${endDate}T23:59:59Z`)
        .eq('location_id', selectedLocation)

      if (error) {
        console.error('Temperature export error:', error)
        setRecords([])
      } else {
        const formatted = data.map(entry => ({
          category: entry.type,
          name: entry.type === 'food' ? entry.food_items?.name || 'N/A' : entry.units?.name || 'N/A',
          value: entry.value,
          timestamp: entry.timestamp,
          corrective_action: entry.corrective_action || 'None',
        }))
        setRecords(formatted)
      }
    }

    if (type === 'checklist') {
      const { data, error } = await supabase
        .from('checklist_subtask_completions')
        .select(`
          id, completed, completed_at, location_id, subtask_id,
          checklist_subtasks (
            description,
            task_id,
            checklist_tasks (
              description,
              checklist_id,
              checklists (title)
            )
          )
        `)
        .gte('completed_at', `${startDate}T00:00:00Z`)
        .lte('completed_at', `${endDate}T23:59:59Z`)
        .eq('location_id', selectedLocation)

      if (error) {
        console.error('Checklist export error:', error)
        setRecords([])
      } else {
        const formatted = data.map(entry => ({
          checklist: entry.checklist_subtasks?.checklist_tasks?.checklists?.title || 'N/A',
          task: entry.checklist_subtasks?.checklist_tasks?.description || 'N/A',
          subtask: entry.checklist_subtasks?.description || 'N/A',
          completed: entry.completed ? 'Yes' : 'No',
          completed_at: entry.completed_at,
        }))
        setRecords(formatted)
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
          <FaDatabase /> Export Records
        </h1>
        <p className="text-gray-500 mt-1">Download checklist & temperature logs as PDF or Excel</p>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-1"><FaCalendarAlt /> Start Date</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border px-3 py-2 rounded" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-1"><FaCalendarAlt /> End Date</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border px-3 py-2 rounded" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">Data Type</span>
            <select value={type} onChange={e => setType(e.target.value)} className="border px-3 py-2 rounded">
              <option value="temperature">Temperature Logs</option>
              <option value="checklist">Checklist Completions</option>
            </select>
          </label>
        </div>

        <button
          onClick={fetchData}
          disabled={!startDate || !endDate || !selectedLocation}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Fetch Records
        </button>

        {records.length > 0 && (
          <>
            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={() => exportToPDF(records, type, startDate, endDate)}
                className="bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded hover:bg-red-700 transition"
              >
                <FaFilePdf /> PDF
              </button>
              <button
                onClick={() => exportToExcel(records, type, startDate, endDate)}
                className="bg-green-600 text-white flex items-center gap-2 px-4 py-2 rounded hover:bg-green-700 transition"
              >
                <FaFileExcel /> Excel
              </button>
            </div>

            <div className="overflow-x-auto mt-6 border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(records[0]).map((key) => (
                      <th key={key} className="text-left px-4 py-2 border-b">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(rec).map((val, i) => (
                        <td key={i} className="px-4 py-2 border-b">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {loading && <p className="text-blue-600 font-medium">Loading records...</p>}
        {!loading && records.length === 0 && (
          <p className="text-sm text-gray-500 text-center">No records found for this location and date range.</p>
        )}
      </div>
    </div>
  )
}
