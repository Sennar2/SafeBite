import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useLocationContext } from '../context/LocationContext'

export default function ChecklistModal({ date, onClose }) {
  const { selectedLocation, user } = useLocationContext()
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedLocation || !date) return

    const fetchChecklist = async () => {
      setLoading(true)
      const { data: checklists } = await supabase
        .from('checklists')
        .select(`
          id,
          title,
          checklist_tasks (
            id,
            description,
            checklist_subtasks (
              id,
              description
            )
          )
        `)
        .eq('location_id', selectedLocation)
        .eq('frequency', 'daily')

      const { data: completions } = await supabase
        .from('checklist_subtask_completions')
        .select('subtask_id, completed')
        .eq('user_id', user.id)
        .eq('date', date)

      const completedMap = {}
      completions?.forEach(c => { completedMap[c.subtask_id] = c.completed })

      const enriched = checklists.map(cl => ({
        ...cl,
        checklist_tasks: cl.checklist_tasks.map(task => ({
          ...task,
          checklist_subtasks: task.checklist_subtasks.map(st => ({
            ...st,
            completed: completedMap[st.id] || false,
          }))
        }))
      }))

      setChecklists(enriched)
      setLoading(false)
    }

    fetchChecklist()
  }, [selectedLocation, date, user.id])

  const toggleSubtask = async (subtaskId, checked) => {
    await supabase.from('checklist_subtask_completions').upsert({
      subtask_id: subtaskId,
      user_id: user.id,
      date,
      completed: checked,
      completed_at: checked ? new Date().toISOString() : null
    })
    setChecklists(prev => prev.map(cl => ({
      ...cl,
      checklist_tasks: cl.checklist_tasks.map(task => ({
        ...task,
        checklist_subtasks: task.checklist_subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: checked } : st
        )
      }))
    })))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Checklist for {date}</h2>
          <button className="text-gray-500 hover:text-red-500" onClick={onClose}>✕</button>
        </div>

        {loading ? <p>Loading...</p> : (
          checklists.map(cl => (
            <div key={cl.id} className="mb-6">
              <h3 className="font-semibold text-lg">{cl.title}</h3>
              {cl.checklist_tasks.map(task => (
                <div key={task.id} className="mt-2 mb-4">
                  <h4 className="font-medium mb-1">{task.description}</h4>
                  <ul className="space-y-1">
                    {task.checklist_subtasks.map(st => (
                      <li key={st.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={(e) => toggleSubtask(st.id, e.target.checked)}
                        />
                        <span>{st.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
