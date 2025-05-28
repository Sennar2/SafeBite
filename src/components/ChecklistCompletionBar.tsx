import { useEffect, useState } from 'react'
import React from 'react'
import { useLocationContext } from '../context/LocationContext'
import { supabase } from '../supabase/client'

export function ChecklistCompletionBar() {
  const { selectedLocation, user } = useLocationContext()
  const [percent, setPercent] = useState(null)

  useEffect(() => {
    const fetchProgress = async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data: checklists } = await supabase
        .from('checklists')
        .select('id, checklist_tasks(id)')
        .eq('location_id', selectedLocation)
        .eq('frequency', 'daily')

      if (!checklists) return

      const taskIds = checklists.flatMap(cl =>
        cl.checklist_tasks?.map(t => t.id) || []
      )

      if (taskIds.length === 0) return

      const { data: subtasks } = await supabase
        .from('checklist_subtasks')
        .select('id')
        .in('task_id', taskIds)

      const { data: completions } = await supabase
        .from('checklist_subtask_completions')
        .select('subtask_id')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('completed', true)

      const done = completions?.length || 0
      const total = subtasks?.length || 0

      setPercent(total > 0 ? Math.round((done / total) * 100) : 0)
    }

    if (selectedLocation && user?.id) fetchProgress()
  }, [selectedLocation, user?.id])

  return (
    <div className="bg-white rounded-xl p-4 shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">Today's Checklist Completion</h3>
      {percent !== null ? (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-600">{percent}% completed</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
