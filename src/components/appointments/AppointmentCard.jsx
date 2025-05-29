"use client"

import { useState } from "react"
import { Clock, User, Phone, Mail, MoreVertical, Check, X, Calendar, Edit } from "lucide-react"

export default function AppointmentCard({ appointment, onUpdate }) {
  const [showActions, setShowActions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "no_show":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "initial":
        return "bg-purple-100 text-purple-800"
      case "follow_up":
        return "bg-blue-100 text-blue-800"
      case "consultation":
        return "bg-green-100 text-green-800"
      case "nutrition_plan":
        return "bg-yellow-100 text-yellow-800"
      case "progress_check":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatType = (type) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const updateAppointmentStatus = async (status) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/appointments/${appointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        onUpdate && onUpdate()
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
    } finally {
      setIsUpdating(false)
      setShowActions(false)
    }
  }

  // Check if appointment is today and in the future
  const isToday = appointment.appointment_date === new Date().toISOString().split("T")[0]
  const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
  const now = new Date()
  const isPast = appointmentTime < now

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900">{appointment.appointment_time}</span>
              <span className="text-sm text-gray-500">({appointment.duration_minutes} min)</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
              {appointment.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">{appointment.patient_name}</span>
            {appointment.patient_id && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Existing Patient</span>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-3">
            {appointment.patient_email && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Mail className="h-3 w-3" />
                <span>{appointment.patient_email}</span>
              </div>
            )}
            {appointment.patient_phone && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{appointment.patient_phone}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(appointment.appointment_type)}`}>
              {formatType(appointment.appointment_type)}
            </span>
            {isToday && !isPast && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Today</span>
            )}
          </div>

          {appointment.notes && <p className="text-sm text-gray-600 mt-2 italic">"{appointment.notes}"</p>}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUpdating}
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {appointment.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => updateAppointmentStatus("completed")}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus("no_show")}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2 text-orange-600" />
                      Mark as No Show
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus("cancelled")}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2 text-red-600" />
                      Cancel Appointment
                    </button>
                  </>
                )}
                <hr className="my-1" />
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Edit className="h-4 w-4 mr-2 text-blue-600" />
                  Edit Appointment
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Reschedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isUpdating && (
        <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Updating...
        </div>
      )}
    </div>
  )
}