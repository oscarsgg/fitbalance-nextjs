"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, User, AlertCircle, Check, Search, CheckCircle } from "lucide-react"

export default function AddAppointmentForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patient_type: "new", // "existing" or "new"
    patient_id: "",
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    appointment_date: "",
    appointment_time: "",
    appointment_type: "",
    notes: "",
  })
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  // Load patients when component mounts
  useEffect(() => {
    if (isOpen) {
      loadPatients()
    }
  }, [isOpen])

  // Filter patients based on search term
  useEffect(() => {

    // Only show the dropdown if no patient is selected or the search term
    // differs from the selected patients name
    const isSameAsSelected =
      selectedPatient && searchTerm === selectedPatient.name

    if (
      searchTerm &&
      formData.patient_type === "existing" &&
      !isSameAsSelected
    ) {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPatients(filtered)
      setShowPatientDropdown(filtered.length > 0)
    } else {
      setFilteredPatients([])
      setShowPatientDropdown(false)
    }
  }, [searchTerm, patients, formData.patient_type, selectedPatient])

  // Load available slots when date changes
  useEffect(() => {
    if (formData.appointment_date) {
      loadAvailableSlots(formData.appointment_date)
    }
  }, [formData.appointment_date])

  const loadPatients = async () => {
    try {
      const response = await fetch("/api/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
      }
    } catch (error) {
      console.error("Error loading patients:", error)
    }
  }

  const loadAvailableSlots = async (date) => {
    try {
      const response = await fetch(`/api/appointments/available-slots?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.availableSlots)
      } else {
        setAvailableSlots([])
      }
    } catch (error) {
      console.error("Error loading available slots:", error)
      setAvailableSlots([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError("")

    // If patient type changes to new, clear patient selection
    if (name === "patient_type" && value === "new") {
      setFormData((prev) => ({
        ...prev,
        patient_id: "",
        patient_name: "",
        patient_email: "",
        patient_phone: "",
      }))
      setSearchTerm("")
      setSelectedPatient(null)
      setShowPatientDropdown(false)
    }
  }

  const handlePatientSelect = (patient) => {
    console.log("Selecting patient:", patient)
    setSelectedPatient(patient)
    setFormData({
      ...formData,
      patient_type: "existing",
      patient_id: patient._id,
      patient_name: patient.name,
      patient_email: patient.email || "",
      patient_phone: patient.phone || "",
    })
    setSearchTerm(patient.name)
    setShowPatientDropdown(false)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // If user clears the search, clear the selection
    if (!value && selectedPatient) {
      setSelectedPatient(null)
      setFormData({
        ...formData,
        patient_id: "",
        patient_name: "",
        patient_email: "",
        patient_phone: "",
      })
    }
  }

  const validateForm = () => {
    if (!formData.patient_name.trim()) {
      return "Patient name is required"
    }
    if (!formData.appointment_date) {
      return "Appointment date is required"
    }
    if (!formData.appointment_time) {
      return "Appointment time is required"
    }
    if (!formData.appointment_type) {
      return "Appointment type is required"
    }

    // Validate email if provided
    if (formData.patient_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.patient_email)) {
        return "Please enter a valid email address"
      }
    }

    // Validate date is not in the past
    const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
    const now = new Date()
    if (appointmentDateTime < now) {
      return "Cannot schedule appointments in the past"
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setShowErrorModal(true)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Submitting appointment data:", formData)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.appointment)
      } else {
        setError(data.error || "Failed to create appointment")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      setError("Network error. Please check your connection and try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setFormData({
      patient_type: "new",
      patient_id: "",
      patient_name: "",
      patient_email: "",
      patient_phone: "",
      appointment_date: "",
      appointment_time: "",
      appointment_type: "",
      notes: "",
    })
    setSuccess(null)
    setSearchTerm("")
    setSelectedPatient(null)
    setShowPatientDropdown(false)
    onSuccess && onSuccess()
    onClose()
  }

  const handleErrorClose = () => {
    setShowErrorModal(false)
    setError("")
  }

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  if (!isOpen) return null

  // Error Modal
  if (showErrorModal && error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Appointment Error</h3>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">Please correct the error and try again.</p>
          <button
            onClick={handleErrorClose}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            OK, Got It
          </button>
        </div>
      </div>
    )
  }

  // Success Modal
  if (success) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Appointment Scheduled!</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Appointment Details:</p>
            <p className="font-semibold text-gray-900">{success.patient_name}</p>
            <p className="text-sm text-gray-600">
              {new Date(success.appointment_date).toLocaleDateString()} at {success.appointment_time}
            </p>
            <p className="text-sm text-gray-600 capitalize">{success.appointment_type?.replace("_", " ")}</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">The appointment has been added to your calendar.</p>
          <button
            onClick={handleSuccessClose}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Main Form Modal
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Appointment</h2>
              <p className="text-sm text-gray-500">Create a new appointment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Patient Information
                </h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="patient_type"
                      value="existing"
                      checked={formData.patient_type === "existing"}
                      onChange={handleChange}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    Existing Patient
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="patient_type"
                      value="new"
                      checked={formData.patient_type === "new"}
                      onChange={handleChange}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    New Patient
                  </label>
                </div>
              </div>

              {formData.patient_type === "existing" && (
                <div className="md:col-span-2">
                  <label htmlFor="patient_search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Patient *
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {selectedPatient && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      <input
                        id="patient_search"
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => {
                          if (filteredPatients.length > 0) {
                            setShowPatientDropdown(true)
                          }
                        }}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          selectedPatient ? "border-green-300 bg-green-50" : "border-gray-300"
                        }`}
                        placeholder="Search by name, email, or username..."
                      />
                    </div>

                    {/* Selected Patient Indicator */}
                    {selectedPatient && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-900">{selectedPatient.name}</p>
                            <p className="text-sm text-green-700">{selectedPatient.email}</p>
                            <p className="text-xs text-green-600">
                              {selectedPatient.objective} • Age: {selectedPatient.age}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )}

                    {/* Patient Dropdown */}
                    {showPatientDropdown && filteredPatients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredPatients.slice(0, 5).map((patient) => (
                          <button
                            key={patient._id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-500">{patient.email}</p>
                                <p className="text-xs text-gray-400">
                                  {patient.objective} • Age: {patient.age}
                                </p>
                              </div>
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.patient_type === "new" && (
                <>
                  <div>
                    <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      id="patient_name"
                      name="patient_name"
                      type="text"
                      required
                      value={formData.patient_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="patient_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="patient_email"
                      name="patient_email"
                      type="email"
                      value={formData.patient_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="patient_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="patient_phone"
                      name="patient_phone"
                      type="tel"
                      value={formData.patient_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </>
              )}

              {/* Appointment Details */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Appointment Details
                </h3>
              </div>

              <div>
                <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  id="appointment_date"
                  name="appointment_date"
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.appointment_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <select
                  id="appointment_time"
                  name="appointment_time"
                  required
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {formData.appointment_date && availableSlots.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {formData.appointment_date === new Date().toISOString().split("T")[0]
                      ? "No available slots for today. Check your schedule."
                      : "No available slots for this date. Check your schedule."}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type *
                </label>
                <select
                  id="appointment_type"
                  name="appointment_type"
                  required
                  value={formData.appointment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="initial">Initial Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="consultation">General Consultation</option>
                  <option value="nutrition_plan">Nutrition Plan Review</option>
                  <option value="progress_check">Progress Check</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional notes for this appointment..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
