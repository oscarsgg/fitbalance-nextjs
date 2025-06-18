"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarView({ appointments, selectedDate, onDateChange, onAppointmentClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentMonth])

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {}
    appointments.forEach((appointment) => {
      // Convertimos appointment_date a Date y luego a string ISO (solo fecha)
      const dateObj = new Date(appointment.appointment_date)
      const dateKey = dateObj.toISOString().split("T")[0] // "2025-06-17"
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(appointment)
    })
    return grouped
  }, [appointments])


  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (date) => {
    onDateChange(date.toISOString().split("T")[0])
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return date.toISOString().split("T")[0] === selectedDate
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointmentsByDate[dateStr] || []
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDay = isToday(date)
            const isSelectedDay = isSelected(date)

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-[120px] p-2 border border-gray-100 cursor-pointer transition-colors
                  ${isCurrentMonthDay ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"}
                  ${isTodayDay ? "ring-2 ring-blue-500" : ""}
                  ${isSelectedDay ? "bg-blue-50 border-blue-200" : ""}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                    text-sm font-medium
                    ${isTodayDay ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}
                    ${isSelectedDay && !isTodayDay ? "text-blue-600" : ""}
                  `}
                  >
                    {date.getDate()}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">{dayAppointments.length}</span>
                  )}
                </div>

                {/* Appointment indicators */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment, aptIndex) => (
                    <div
                      key={aptIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentClick(appointment)
                      }}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" : ""}
                        ${appointment.status === "completed" ? "bg-green-100 text-green-800" : ""}
                        ${appointment.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                        ${appointment.status === "no_show" ? "bg-orange-100 text-orange-800" : ""}
                      `}
                    >
                      {appointment.appointment_time} - {appointment.patient_name}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}