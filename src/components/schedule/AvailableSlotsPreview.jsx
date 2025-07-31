"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar, RefreshCw } from "lucide-react"

export default function AvailableSlotsPreview({ selectedDate }) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedDate])

  const loadAvailableSlots = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/available-slots?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.availableSlots)
      }
    } catch (error) {
      console.error("Error loading available slots:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white/75 rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Available Slots Preview</h3>
        </div>
        <button
          onClick={loadAvailableSlots}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(selectedDate)}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading slots...</span>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            {selectedDate === new Date().toISOString().split("T")[0]
              ? "No available slots for today. Check your schedule."
              : "No available slots for this date. Check your schedule."}
          </p>
          <p className="text-xs text-gray-400 mt-1">This might be a non-working day or all slots are booked</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availableSlots.map((slot) => (
            <div
              key={slot}
              className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-center text-sm font-medium border border-green-200"
            >
              {slot}
            </div>
          ))}
        </div>
      )}

      {availableSlots.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>{availableSlots.length}</strong> appointment slots available for this date
          </p>
        </div>
      )}
    </div>
  )
}