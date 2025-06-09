"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, Settings, AlertCircle } from "lucide-react"

export default function SchedulePreview() {
  const [schedule, setSchedule] = useState(null)
  const [todayAppointments, setTodayAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScheduleData()
  }, [])

  const loadScheduleData = async () => {
    try {
      console.log("🔍 Loading schedule data...")

      // Load schedule configuration
      const scheduleResponse = await fetch("/api/schedule")
      console.log("📡 Schedule API response status:", scheduleResponse.status)

      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json()
        console.log("📅 Schedule data received:", scheduleData)
        setSchedule(scheduleData.schedule)
      } else {
        console.log("❌ Schedule API error:", await scheduleResponse.text())
      }

      // Load today's appointments
      const today = new Date().toISOString().split("T")[0]
      const appointmentsResponse = await fetch(`/api/appointments?date=${today}`)
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setTodayAppointments(appointmentsData.appointments)
      }
    } catch (error) {
      console.error("❌ Error loading schedule data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatWorkingDays = (days) => {
    const dayNames = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    }
    return days.map((day) => dayNames[day]).join(", ")
  }

  const calculateDailyStats = () => {
    if (!schedule) return null

    const workingHours = schedule.working_hours
    const lunchBreak = schedule.lunch_break
    const appointmentDuration = schedule.appointment_duration || 60
    const bufferTime = schedule.buffer_time || 15

    // Calculate total working minutes
    const [startHour, startMinute] = workingHours.start.split(":").map(Number)
    const [endHour, endMinute] = workingHours.end.split(":").map(Number)
    const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)

    // Subtract lunch break if enabled
    let availableMinutes = totalMinutes
    if (lunchBreak.enabled) {
      const [lunchStartHour, lunchStartMinute] = lunchBreak.start.split(":").map(Number)
      const [lunchEndHour, lunchEndMinute] = lunchBreak.end.split(":").map(Number)
      const lunchDuration = lunchEndHour * 60 + lunchEndMinute - (lunchStartHour * 60 + lunchStartMinute)
      availableMinutes -= lunchDuration
    }

    // Calculate max appointments (including buffer time)
    const timePerAppointment = appointmentDuration + bufferTime
    const maxAppointments = Math.floor(availableMinutes / timePerAppointment)

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      availableHours: Math.floor(availableMinutes / 60),
      availableMinutes: availableMinutes % 60,
      maxAppointments,
    }
  }

  const getTodayStatus = () => {
    if (!schedule) return "No schedule configured"

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

    const isWorkingDay = schedule.working_days.includes(today)

    if (!isWorkingDay) {
      return "Not a working day"
    }

    const stats = calculateDailyStats()
    const bookedAppointments = todayAppointments.filter((apt) => apt.status === "scheduled").length

    return `${bookedAppointments}/${stats?.maxAppointments || 0} appointments booked`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading schedule...</span>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Configured</h3>
        <p className="text-gray-500 mb-4">You need to configure your working schedule first.</p>
        <button
          onClick={() => (window.location.href = "/schedule/configure")}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Configure Schedule
        </button>
      </div>
    )
  }

  const stats = calculateDailyStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Working Days */}
      <div className="bg-blue-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h4 className="ml-2 font-medium text-blue-800">Working Days</h4>
        </div>
        <p className="text-sm text-blue-700">{formatWorkingDays(schedule.working_days)}</p>
        <p className="text-xs text-blue-600 mt-1">{schedule.working_days.length} days per week</p>
      </div>

      {/* Working Hours */}
      <div className="bg-green-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Clock className="h-5 w-5 text-green-600" />
          <h4 className="ml-2 font-medium text-green-800">Working Hours</h4>
        </div>
        <p className="text-sm text-green-700">
          {schedule.working_hours.start} - {schedule.working_hours.end}
        </p>
        <p className="text-xs text-green-600 mt-1">
          {stats?.totalHours}h {stats?.totalMinutes}m total
        </p>
      </div>

      {/* Daily Capacity */}
      <div className="bg-purple-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Users className="h-5 w-5 text-purple-600" />
          <h4 className="ml-2 font-medium text-purple-800">Daily Capacity</h4>
        </div>
        <p className="text-sm text-purple-700">Up to {stats?.maxAppointments} appointments</p>
        <p className="text-xs text-purple-600 mt-1">{schedule.appointment_duration}min each</p>
      </div>

      {/* Today's Status */}
      <div className="bg-orange-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Settings className="h-5 w-5 text-orange-600" />
          <h4 className="ml-2 font-medium text-orange-800">Today's Status</h4>
        </div>
        <p className="text-sm text-orange-700">{getTodayStatus()}</p>
        <p className="text-xs text-orange-600 mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long" })}</p>
      </div>
    </div>
  )
}