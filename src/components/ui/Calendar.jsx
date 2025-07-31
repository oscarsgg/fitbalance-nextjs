"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Calendar({ mode = "single", selected, onSelect, className = "" }) {
  const [currentDate, setCurrentDate] = useState(selected || new Date())

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day)
    if (onSelect) {
      onSelect(clickedDate)
    }
  }

  const isSelected = (day) => {
    if (!selected) return false
    const dateToCheck = new Date(year, month, day)
    return selected.getDate() === day && selected.getMonth() === month && selected.getFullYear() === year
  }

  const isToday = (day) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className={`p-4 bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => handleDateClick(day)}
                className={`
                  w-full h-full flex items-center justify-center text-sm rounded
                  hover:bg-gray-100 transition-colors
                  ${isSelected(day) ? "bg-green-500 text-white hover:bg-green-600" : ""}
                  ${isToday(day) && !isSelected(day) ? "bg-blue-100 text-blue-600" : ""}
                `}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
