import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../supabase/client'
import { useLocationContext } from '../context/LocationContext'

function TempTrends() {
  const [data, setData] = useState<any[]>([])
  const { selectedLocation } = useLocationContext()

  useEffect(() => {
    const fetchTemps = async () => {
      if (!selectedLocation) return
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - 6)

      const dateRange = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        return d.toISOString().split('T')[0]
      })

      const records = await Promise.all(
        dateRange.map(async (date) => {
          const { data } = await supabase
            .from('temperature_records')
            .select('temperature')
            .eq('location_id', selectedLocation)
            .gte('recorded_at', `${date}T00:00:00Z`)
            .lte('recorded_at', `${date}T23:59:59Z`)

          const temps = data?.map((d) => d.temperature) || []
          const avgTemp =
            temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 0

          return {
            date,
            'Avg Temp (°C)': parseFloat(avgTemp),
          }
        })
      )

      setData(records)
    }

    fetchTemps()
  }, [selectedLocation])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Temperature Trends</h1>

      {!selectedLocation && <p className="text-red-600">Select a location to view trends.</p>}

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Avg Temp (°C)" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default TempTrends
