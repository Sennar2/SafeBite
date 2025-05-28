import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useLocationContext } from '../context/LocationContext'

export default function UserActivity() {
  const { selectedLocation, role } = useLocationContext()
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (!selectedLocation || role !== 'admin') return

    const fetchActivity = async () => {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name')

      const records = await Promise.all(
        users.map(async (user) => {
          const [temps, checks] = await Promise.all([
            supabase
              .from('temperature_records')
              .select('*', { count: 'exact', head: true })
              .eq('recorded_by', user.id)
              .eq('location_id', selectedLocation),
            supabase
              .from('checklist_completions')
              .select('*', { count: 'exact', head: true })
              .eq('completed_by', user.id)
              .eq('location_id', selectedLocation),
          ])

          return {
            name: user.full_name,
            'Temp Logs': temps.count || 0,
            'Checklists': checks.count || 0,
          }
        })
      )

      setData(records)
    }

    fetchActivity()
  }, [selectedLocation, role])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Activity Report</h1>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">User</th>
            <th className="text-left p-2">Temp Logs</th>
            <th className="text-left p-2">Checklists</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name} className="border-t">
              <td className="p-2">{row.name}</td>
              <td className="p-2">{row['Temp Logs']}</td>
              <td className="p-2">{row['Checklists']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
