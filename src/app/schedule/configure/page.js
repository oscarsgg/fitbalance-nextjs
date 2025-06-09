"use client"

import { useState, useEffect } from "react"
import { Save, Clock, Calendar, Coffee, Settings, CheckCircle, AlertCircle } from "lucide-react"
import Sidebar from "../../../components/layout/Sidebar"

export default function ConfigureSchedulePage() {
  const [formData, setFormData] = useState({
    working_days: [],
    working_hours: {
      start: "09:00",
      end: "17:00",
    },
    lunch_break: {
      enabled: true,
      start: "13:00",
      end: "14:00",
    },
    appointment_duration: 60,
    buffer_time: 15,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const daysOfWeek = [
    { key: "monday", label: "Monday", short: "Mon" },
    { key: "tuesday", label: "Tuesday", short: "Tue" },
    { key: "wednesday", label: "Wednesday", short: "Wed" },
    { key: "thursday", label: "Thursday", short: "Thu" },
    { key: "friday", label: "Friday", short: "Fri" },
    { key: "saturday", label: "Saturday", short: "Sat" },
    { key: "sunday", label: "Sunday", short: "Sun" },
  ]

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    try {
      const response = await fetch("/api/schedule")
      if (response.ok) {
        const data = await response.json()
        if (data.schedule) {
          setFormData(data.schedule)
        }
      }
    } catch (error) {
      console.error("Error loading schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }))
  }

  const handleWorkingHoursChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [field]: value,
      },
    }))
  }

  const handleLunchBreakChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      lunch_break: {
        ...prev.lunch_break,
        [field]: value,
      },
    }))
  }

  const validateForm = () => {
    if (formData.working_days.length === 0) {
      return "Please select at least one working day"
    }

    if (formData.working_hours.start >= formData.working_hours.end) {
      return "End time must be after start time"
    }

    if (formData.lunch_break.enabled) {
      if (formData.lunch_break.start >= formData.lunch_break.end) {
        return "Lunch break end time must be after start time"
      }

      if (
        formData.lunch_break.start < formData.working_hours.start ||
        formData.lunch_break.end > formData.working_hours.end
      ) {
        return "Lunch break must be within working hours"
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setMessage(validationError)
      setMessageType("error")
      return
    }

    setSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Schedule updated successfully!")
        setMessageType("success")
      } else {
        setMessage(data.error || "Failed to update schedule")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
      setMessageType("error")
    } finally {
      setSaving(false)
    }
  }

  const calculatePreview = () => {
    const [startHour, startMinute] = formData.working_hours.start.split(":").map(Number)
    const [endHour, endMinute] = formData.working_hours.end.split(":").map(Number)
    const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)

    let availableMinutes = totalMinutes
    if (formData.lunch_break.enabled) {
      const [lunchStartHour, lunchStartMinute] = formData.lunch_break.start.split(":").map(Number)
      const [lunchEndHour, lunchEndMinute] = formData.lunch_break.end.split(":").map(Number)
      const lunchDuration = lunchEndHour * 60 + lunchEndMinute - (lunchStartHour * 60 + lunchStartMinute)
      availableMinutes -= lunchDuration
    }

    const timePerAppointment = formData.appointment_duration + formData.buffer_time
    const maxAppointments = Math.floor(availableMinutes / timePerAppointment)

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      availableHours: Math.floor(availableMinutes / 60),
      availableMinutes: availableMinutes % 60,
      maxAppointments,
    }
  }

  const preview = calculatePreview()

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedule configuration...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 rounded-xl min-h-screen">
          {/* Header */}
          <header className="px-7 pt-7 pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center">
                {/* <Settings className="h-8 w-8 text-green-600 mr-3" /> */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">
                    Configure Schedule
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700">
                    Set up your working hours and appointment settings
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Message */}
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center ${messageType === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Working Days */}
                <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Calendar className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Working Days</h2>
                      <p className="text-gray-600">Select the days you work</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {daysOfWeek.map((day) => (
                      <label
                        key={day.key}
                        className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.working_days.includes(day.key)
                            ? "border-green-500 bg-white text-green-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.working_days.includes(day.key)}
                          onChange={() => handleDayToggle(day.key)}
                          className="sr-only"
                        />
                        <span className="font-medium">{day.short}</span>
                        <span className="text-xs mt-1">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Clock className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Working Hours</h2>
                      <p className="text-gray-600">Set your daily working hours</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <select
                        value={formData.working_hours.start}
                        onChange={(e) => handleWorkingHoursChange("start", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {Array.from({ length: 29 }, (_, i) => {
                          const hour = Math.floor(i / 2) + 6
                          const minute = i % 2 === 0 ? "00" : "30"
                          const time = `${hour.toString().padStart(2, "0")}:${minute}`
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <select
                        value={formData.working_hours.end}
                        onChange={(e) => handleWorkingHoursChange("end", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {Array.from({ length: 29 }, (_, i) => {
                          const hour = Math.floor(i / 2) + 6
                          const minute = i % 2 === 0 ? "00" : "30"
                          const time = `${hour.toString().padStart(2, "0")}:${minute}`
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lunch Break */}
                <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Coffee className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Lunch Break</h2>
                      <p className="text-gray-600">Configure your lunch break (optional)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.lunch_break.enabled}
                        onChange={(e) => handleLunchBreakChange("enabled", e.target.checked)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">Enable lunch break</span>
                    </label>

                    {formData.lunch_break.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lunch Start</label>
                          <select
                            value={formData.lunch_break.start}
                            onChange={(e) => handleLunchBreakChange("start", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            {Array.from({ length: 17 }, (_, i) => {
                              const hour = Math.floor(i / 2) + 11
                              const minute = i % 2 === 0 ? "00" : "30"
                              const time = `${hour.toString().padStart(2, "0")}:${minute}`
                              return (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              )
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lunch End</label>
                          <select
                            value={formData.lunch_break.end}
                            onChange={(e) => handleLunchBreakChange("end", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            {Array.from({ length: 17 }, (_, i) => {
                              const hour = Math.floor(i / 2) + 11
                              const minute = i % 2 === 0 ? "00" : "30"
                              const time = `${hour.toString().padStart(2, "0")}:${minute}`
                              return (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Settings */}
                <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Settings className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Appointment Settings</h2>
                      <p className="text-gray-600">Configure appointment duration and buffer time</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Duration (minutes)
                      </label>
                      <select
                        value={formData.appointment_duration}
                        onChange={(e) => setFormData({ ...formData, appointment_duration: Number(e.target.value) })}
                        className=" bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes</option>
                        <option value={180}>180 minutes</option>
                        <option value={240}>240 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buffer Time Between Appointments (minutes)
                      </label>
                      <select
                        value={formData.buffer_time}
                        onChange={(e) => setFormData({ ...formData, buffer_time: Number(e.target.value) })}
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value={0}>No buffer</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Schedule Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Working Days:</span>
                      <p className="text-blue-800">{formData.working_days.length} days/week</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Daily Hours:</span>
                      <p className="text-blue-800">
                        {preview.totalHours}h {preview.totalMinutes}m
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Available Time:</span>
                      <p className="text-blue-800">
                        {preview.availableHours}h {preview.availableMinutes}m
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Max Appointments:</span>
                      <p className="text-blue-800">{preview.maxAppointments}/day</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Schedule
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
