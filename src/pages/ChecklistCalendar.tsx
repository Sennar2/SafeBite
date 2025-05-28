import React, { useState } from 'react'
import { useLocationContext } from '../context/LocationContext'
import { supabase } from '../supabase/client'
import ChecklistModal from '../components/ChecklistModal'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getMonthDates(year, month) {
  const date = new Date(year, month, 1)
  const dates = []
  while (date.getMonth() === month) {
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return dates
}

export default function ChecklistCalendar() {
  const { selectedLocation } = useLocationContext()
  const [selectedDate, setSelectedDate] = useState(null)
  const today = getToday()
  const now = new Date()
  const dates = getMonthDates(now.getFullYear(), now.getMonth())

  const handleDateClick = (date) => {
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const closeModal = () => {
    setSelectedDate(null)
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checklist Calendar</h1>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className={`p-2 text-center rounded bg-gray-100 hover:bg-blue-200 cursor-pointer ${
              getToday() === date.toISOString().split('T')[0] ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleDateClick(date)}
          >
            {date.getDate()}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p><span className="inline-block w-4 h-4 bg-green-300 mr-1"></span> All Completed</p>
        <p><span className="inline-block w-4 h-4 bg-yellow-300 mr-1"></span> Partially Completed</p>
        <p><span className="inline-block w-4 h-4 bg-red-300 mr-1"></span> Not Completed</p>
        <p><span className="inline-block w-4 h-4 bg-gray-100 mr-1 border"></span> No Tasks</p>
      </div>

      {selectedDate && <ChecklistModal date={selectedDate} onClose={closeModal} />}
    </div>
  )
}
