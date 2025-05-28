import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { exportToPDF, exportToExcel } from '../utils/exportUtils'
import { useLocationContext } from '../context/LocationContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function Progress() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { selectedLocation } = useLocationContext()

  useEffect(() => {
    const fetchProgress = async () => {
      if (!selectedLocation && selectedLocation !== '') return
      setLoading(true)

      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 6)

      const dateRange = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        return d.toISOString().split('T')[0]
      })

      const records = await Promise.all(
        dateRange.map(async (date) => {
          const tempQuery = supabase
            .from('temperature_records')
            .select('*', { count: 'exact', head: true })
            .gte('recorded_at', `${date}T00:00:00Z`)
            .lte('recorded_at', `${date}T23:59:59Z`)

          const checklistQuery = supabase
            .from('checklist_completions')
            .select('*', { count: 'exact', head: true })
            .gte('completed_at', `${date}T00:00:00Z`)
            .lte('completed_at', `${date}T23:59:59Z`)

          if (selectedLocation) {
            tempQuery.eq('location_id', selectedLocation)
            checklistQuery.eq('location_id', selectedLocation)
          }

          const [{ count: tempCount }, { count: checklistCount }] = await Promise.all([
            tempQuery,
            checklistQuery,
          ])

          return {
            date,
            'Temperature Logs': tempCount || 0,
            'Checklists Completed': checklistCount || 0,
          }
        })
      )

      setData(records)
      setLoading(false)
    }

    fetchProgress()
  }, [selectedLocation])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Progress Overview</h1>

      {loading && <p>Loading progress...</p>}

      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Temperature Logs" fill="#8884d8" />
            <Bar dataKey="Checklists Completed" fill="#82ca9d" />
          </BarChart>
          <div className="flex space-x-4 mt-4">
  <button
    onClick={() => exportToPDF(data, 'progress', data[0]?.date, data.at(-1)?.date)}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Export PDF
  </button>
  <button
    onClick={() => exportToExcel(data, 'progress', data[0]?.date, data.at(-1)?.date)}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Export Excel
  </button>
</div>
        </ResponsiveContainer>
      )}
    </div>
  )
}
