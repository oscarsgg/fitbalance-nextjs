"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Clock, Filter, Search, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Sidebar from "../../components/layout/Sidebar"
import AddAppointmentForm from "../../components/appointments/AddAppointmentForm"
import AppointmentCard from "../../components/appointments/AppointmentCard"
import CalendarView from "../../components/appointments/CalendarView"
import AddPatientForm from "../../components/patients/AddPatientForm"

export default function AppointmentsPage() {
  const [view, setView] = useState("list") // "list" or "calendar"
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [patientPrefilledData, setPatientPrefilledData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }),
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const todayLocal = new Date().toLocaleDateString("en-CA") // formato YYYY-MM-DD local

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (view === "list") {
        params.append("date", selectedDate)
        console.log("Cargando citas para fecha específica:", selectedDate)
      } else {
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Citas recibidas de la API:", data.appointments)
        console.log("Número de citas:", data.appointments?.length || 0)

        if (data.appointments && data.appointments.length > 0) {
          console.log("Ejemplo de cita:", data.appointments[0])
          data.appointments.forEach((apt, index) => {
            console.log(`Cita ${index + 1}:`, {
              date: apt.appointment_date,
              time: apt.appointment_time,
              patient: apt.patient_name,
              status: apt.status,
              isNewPatient: !apt.patient_id,
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
  }, [selectedDate, statusFilter, view])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments, refreshTrigger])

  const handleAppointmentSuccess = () => {
    console.log("Cita creada exitosamente, recargando lista...")
    setShowAddAppointment(false)
    // Forzar recarga de citas con un pequeño delay para asegurar que la DB se actualice
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 500)
  }

  const handlePatientSuccess = () => {
    console.log("Paciente registrado exitosamente, recargando citas...")
    setShowAddPatient(false)
    setPatientPrefilledData(null)
    // Forzar recarga de citas para actualizar el estado de los pacientes
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 500)
  }

  const handleRegisterPatient = (patientData) => {
    console.log("Registrando paciente desde cita:", patientData)
    setPatientPrefilledData(patientData)
    setShowAddPatient(true)
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
  const newPatientsCount = appointments.filter((apt) => !apt.patient_id).length
  const scheduledCount = appointments.filter((apt) => apt.status === "scheduled").length
  const completedCount = appointments.filter((apt) => apt.status === "completed").length

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 rounded-xl min-h-screen">
          {/* Header */}
          <header className="px-7 pt-7 pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Appointments</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700">Manage your appointment schedule</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* View Toggle */}
                <div className="flex bg-white/60 rounded-lg p-2 shadow-sm">
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
                  className="bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700/88 transition-colors text-sm sm:text-base flex items-center"
                >
                  New Appointment
                </button>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="px-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Todays Appointments */}
              <div className="bg-white/70 shadow-sm rounded-lg p-2">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Todays Appointments</p>
                    <p className="text-2xl font-bold text-green-800">{todayAppointments.length}</p>
                  </div>
                </div>
              </div>
              {/* Scheduled */}
              <div className="bg-blue-50 shadow-sm rounded-lg p-2">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-800">{scheduledCount}</p>
                  </div>
                </div>
              </div>
              {/* New Patients - Changed to green */}
              <div className="bg-green-50 shadow-sm rounded-lg p-2">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">New Patients</p>
                    <p className="text-2xl font-bold text-green-800">{newPatientsCount}</p>
                  </div>
                </div>
              </div>
              {/* Completed */}
              <div className="bg-purple-50 shadow-sm rounded-lg p-2">
                <div className="flex items-center">
                  <Filter className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Completed</p>
                    <p className="text-2xl font-bold text-purple-800">{completedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="mx-5 my-4 p-4 bg-white/70 shadow-sm rounded-lg border-gray-200">
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
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <h2 className=" text-center text-lg font-semibold text-gray-800">
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
                  <div className="text-center bg-white/60 rounded-xl shadow-sm py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No appointments scheduled for this date."}
                    </p>
                    <button
                      onClick={() => setShowAddAppointment(true)}
                      className="bg-green-600/80 text-white px-4 py-2 rounded-md hover:bg-green-800/90 transition-colors"
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
                          onRegisterPatient={handleRegisterPatient}
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

          {/* Add Patient Modal */}
          <AddPatientForm
            isOpen={showAddPatient}
            onClose={() => {
              setShowAddPatient(false)
              setPatientPrefilledData(null)
            }}
            onSuccess={handlePatientSuccess}
            prefilledData={patientPrefilledData}
          />
        </div>
      </div>
    </div>
  )
}
