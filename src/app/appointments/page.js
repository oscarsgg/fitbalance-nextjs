"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, Filter, Search, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Sidebar from "../../components/layout/Sidebar"
import AddAppointmentForm from "../../components/appointments/AddAppointmentForm"
import AppointmentCard from "../../components/appointments/AppointmentCard"
import CalendarView from "../../components/appointments/CalendarView"

export default function AppointmentsPage() {
  const [view, setView] = useState("list") // "list" or "calendar"
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }))
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const todayLocal = new Date().toLocaleDateString("en-CA") // formato YYYY-MM-DD local

  useEffect(() => {
    loadAppointments()
  }, [selectedDate, statusFilter, refreshTrigger, view]) // Agregamos view y refreshTrigger como dependencias

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (view === "list") {
        // For list view, get appointments for selected date
        params.append("date", selectedDate)
        console.log("Cargando citas para fecha específica:", selectedDate)
      } else {
        // For calendar view, get appointments for the whole month
        const date = new Date(selectedDate)
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const startOfMonth = start.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" })
        const endOfMonth = end.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" })

        params.append("startDate", startOfMonth)
        params.append("endDate", endOfMonth)
        console.log("Cargando citas para rango de fechas:", startOfMonth, "a", endOfMonth)
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      console.log("URL de consulta:", `/api/appointments?${params.toString()}`)
      const response = await fetch(`/api/appointments?${params.toString()}`, {
        credentials: "include", // Asegurar que las cookies se envíen
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Citas recibidas de la API:", data.appointments)
        console.log("Número de citas:", data.appointments?.length || 0)

        // Verificar el formato de las fechas
        if (data.appointments && data.appointments.length > 0) {
          console.log("Ejemplo de cita:", data.appointments[0])
          data.appointments.forEach((apt, index) => {
            console.log(`Cita ${index + 1}:`, {
              date: apt.appointment_date,
              time: apt.appointment_time,
              patient: apt.patient_name,
              status: apt.status,
            })
          })
        }

        setAppointments(data.appointments || [])
      } else {
        const errorText = await response.text()
        console.error("Error al cargar citas:", response.status, errorText)
        setAppointments([])
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentSuccess = () => {
    console.log("Cita creada exitosamente, recargando lista...")
    setShowAddAppointment(false)
    // Forzar recarga de citas con un pequeño delay para asegurar que la DB se actualice
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 500)
  }

  const handleDateChange = (newDate) => {
    console.log("Cambiando fecha seleccionada a:", newDate)
    setSelectedDate(newDate)
  }

  const handleViewChange = (newView) => {
    console.log("Cambiando vista a:", newView)
    setView(newView)
    // Forzar recarga cuando cambie la vista
    setRefreshTrigger((prev) => prev + 1)
  }

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate)
    prevDay.setDate(prevDay.getDate() - 1)
    setSelectedDate(prevDay.toISOString().split("T")[0])
  }


  const handleNextDay = () => {
      const nextDate = new Date(selectedDate)
      nextDate.setDate(nextDate.getDate() + 1)
      setSelectedDate(nextDate.toISOString().split("T")[0])
    }



  const handleToday = () => {
    const today = new Date()
    const localDate = today.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" })
    setSelectedDate(localDate)
  }


  function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day) // new Date(año, mes (0-11), día)
  }

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.patient_email && appointment.patient_email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Get appointments stats
  const todayAppointments = appointments.filter((apt) => apt.appointment_date === todayLocal)

  const scheduledCount = appointments.filter((apt) => apt.status === "scheduled").length
  const completedCount = appointments.filter((apt) => apt.status === "completed").length

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
                <p className="text-gray-600">Manage your appointment schedule</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewChange("list")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === "list" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => handleViewChange("calendar")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === "calendar" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Calendar
                </button>
              </div>

              <button
                onClick={() => setShowAddAppointment(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="px-6 py-2 bg-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-green-800">{todayAppointments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-800">{scheduledCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-800">{completedCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Total This Period</p>
                  <p className="text-2xl font-bold text-orange-800">{appointments.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Date Controls (for list view) */}
            {view === "list" && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleToday}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Today
                </button>
              </div>
            )}

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === "list" ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Appointments for{" "}
                  {parseLocalDate(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading appointments...</span>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No appointments scheduled for this date."}
                  </p>
                  <button
                    onClick={() => setShowAddAppointment(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors"
                  >
                    Schedule New Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
                      />
                    ))}
                </div>
              )}
            </div>
          ) : (
            <CalendarView
              appointments={appointments}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              onAppointmentClick={(appointment) => {
                // Handle appointment click in calendar view
                console.log("Appointment clicked:", appointment)
              }}
            />
          )}
        </main>

        {/* Add Appointment Modal */}
        <AddAppointmentForm
          isOpen={showAddAppointment}
          onClose={() => setShowAddAppointment(false)}
          onSuccess={handleAppointmentSuccess}
        />
      </div>
    </div>
  )
}
