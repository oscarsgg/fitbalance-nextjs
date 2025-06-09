"use client"

import { useState } from "react"
import { CalendarDays, Clock, Settings, Plus } from "lucide-react"
import Sidebar from "../../components/layout/Sidebar"
import SchedulePreview from "../../components/schedule/SchedulePreview"
import AvailableSlotsPreview from "../../components/schedule/AvailableSlotsPreview"

export default function SchedulePage() {
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [previewDate, setPreviewDate] = useState(getLocalDateString())

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 rounded-xl min-h-screen">

          {/* Header */}
          <header className="px-7 pt-7 pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center">
                {/* <CalendarDays className="h-8 w-8 text-green-600 mr-3" /> */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">
                    Schedule Management
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700">
                    Manage your working hours and appointment availability
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/schedule/configure"
                  className="bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700/88 transition-colors text-sm sm:text-base flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Schedule
                </a>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Schedule Preview */}
              <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <CalendarDays className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Current Schedule</h2>
                      <p className="text-gray-600">Overview of your working schedule and capacity</p>
                    </div>
                  </div>
                  <a
                    href="/schedule/configure"
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit Schedule
                  </a>
                </div>

                <SchedulePreview />
              </div>

              {/* Test Available Slots */}
              <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Clock className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Available Slots Preview</h2>
                    <p className="text-gray-600">Test your schedule by checking available appointment slots</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date to Preview</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="date"
                      value={previewDate}
                      onChange={(e) => setPreviewDate(e.target.value)}
                      min={getLocalDateString()}
                      className="px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setPreviewDate(getLocalDateString())}
                      className="px-3 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 transition-colors text-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const tomorrow = new Date()
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        setPreviewDate(getLocalDateString(tomorrow))
                      }}
                      className="px-3 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 transition-colors text-sm"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

                <AvailableSlotsPreview selectedDate={previewDate} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-blue-800">Schedule Appointment</h3>
                      <p className="text-blue-600 text-sm">Book a new appointment with a patient</p>
                    </div>
                  </div>
                  <a
                    href="/appointments"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Go to Appointments
                  </a>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <Settings className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-green-800">Configure Schedule</h3>
                      <p className="text-green-600 text-sm">Update your working hours and settings</p>
                    </div>
                  </div>
                  <a
                    href="/schedule/configure"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Configure Now
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
