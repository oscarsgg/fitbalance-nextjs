"use client"

import { useState } from "react"
import { X, User, Mail, Target, AlertCircle, Check } from "lucide-react"

export default function AddPatientForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    secondLastName: "",
    edad: "",
    sexo: "",
    altura_cm: "",
    peso_kg: "",
    email: "",
    telefono: "",
    objetivo: "",
    alergias: "",
    restricciones_alimentarias: "",
    notas: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation function (supports various formats)
  const isValidPhone = (phone) => {
    if (!phone) return true // Phone is optional
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, "")
    // Accept phones with 10-15 digits
    return cleanPhone.length >= 10 && cleanPhone.length <= 15
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const validateForm = () => {
    // Check required fields
    if (!formData.name.trim()) {
      return "First Name is required"
    }
    if (!formData.lastName.trim()) {
      return "Last Name is required"
    }
    if (!formData.edad) {
      return "Age is required"
    }
    if (!formData.sexo) {
      return "Gender is required"
    }
    if (!formData.altura_cm) {
      return "Height is required"
    }
    if (!formData.peso_kg) {
      return "Weight is required"
    }
    if (!formData.email.trim()) {
      return "Email Address is required"
    }
    if (!formData.objetivo) {
      return "Health Objective is required"
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      return "Please enter a valid email address (example: user@domain.com)"
    }

    // Validate phone format if provided
    if (formData.telefono && !isValidPhone(formData.telefono)) {
      return "Please enter a valid phone number (10-15 digits, formats like +1-555-123-4567, (555) 123-4567, or 5551234567 are accepted)"
    }

    // Validate age range
    const age = Number.parseInt(formData.edad)
    if (age < 1 || age > 120) {
      return "Please enter a valid age between 1 and 120"
    }

    // Validate height range
    const height = Number.parseFloat(formData.altura_cm)
    if (height < 50 || height > 250) {
      return "Please enter a valid height between 50 and 250 cm"
    }

    // Validate weight range
    const weight = Number.parseFloat(formData.peso_kg)
    if (weight < 10 || weight > 500) {
      return "Please enter a valid weight between 10 and 500 kg"
    }

    return null // No errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation first
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setShowErrorModal(true)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Process arrays
      const processedData = {
        ...formData,
        alergias: formData.alergias
          ? formData.alergias
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item)
          : [],
        restricciones_alimentarias: formData.restricciones_alimentarias
          ? formData.restricciones_alimentarias
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item)
          : [],
      }

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.patient)
      } else {
        setError(data.error || "Failed to create patient")
        setShowErrorModal(true)
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setFormData({
      name: "",
      lastName: "",
      secondLastName: "",
      edad: "",
      sexo: "",
      altura_cm: "",
      peso_kg: "",
      email: "",
      telefono: "",
      objetivo: "",
      alergias: "",
      restricciones_alimentarias: "",
      notas: "",
    })
    setSuccess(null)
    onSuccess && onSuccess()
    onClose()
  }

  const handleErrorClose = () => {
    setShowErrorModal(false)
    setError("")
  }

  if (!isOpen) return null

  // Error Modal
  if (showErrorModal && error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.66)" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Validation Error</h3>
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
        style={{ backgroundColor: "rgba(0, 0, 0, 0.66)" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Patient Created Successfully!</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Patient Details:</p>
            <p className="font-semibold text-gray-900">
              {`${success.name} ${success.lastName} ${success.secondLastName || ""}`.trim()}
            </p>
            <p className="text-sm text-gray-600">
              Username: <span className="font-mono font-semibold">{success.username}</span>
            </p>
            <p className="text-sm text-gray-600">
              Default Password:{" "}
              <span className="font-mono font-semibold text-green-600">{success.defaultPassword}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            The patient can use these credentials to access their mobile app.
          </p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-teal-400 rounded-lg flex items-center justify-center mr-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
              <p className="text-sm text-gray-500">Create a new patient profile</p>
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
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Basic Information
                </h3>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="María"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="González"
                />
              </div>

              <div>
                <label htmlFor="secondLastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Second Last Name
                </label>
                <input
                  id="secondLastName"
                  name="secondLastName"
                  type="text"
                  value={formData.secondLastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Smith"
                />
              </div>

              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  id="edad"
                  name="edad"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.edad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="34"
                />
              </div>

              <div>
                <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="sexo"
                  name="sexo"
                  required
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="altura_cm" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  id="altura_cm"
                  name="altura_cm"
                  type="number"
                  required
                  min="50"
                  max="250"
                  step="0.1"
                  value={formData.altura_cm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="165"
                />
              </div>

              <div>
                <label htmlFor="peso_kg" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  id="peso_kg"
                  name="peso_kg"
                  type="number"
                  required
                  min="10"
                  max="500"
                  step="0.1"
                  value={formData.peso_kg}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="68"
                />
              </div>

              {/* Contact Information */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-green-600" />
                  Contact Information
                </h3>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="maria.gonzalez@example.com"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional. Formats: +1-555-123-4567, (555) 123-4567, or 5551234567
                </p>
              </div>

              {/* Health Information */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Health Information
                </h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
                  Health Objective *
                </label>
                <select
                  id="objetivo"
                  name="objetivo"
                  required
                  value={formData.objetivo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select objective</option>
                  <option value="lose weight">Lose Weight</option>
                  <option value="gain weight">Gain Weight</option>
                  <option value="maintain weight">Maintain Weight</option>
                  <option value="gain muscle mass">Gain Muscle Mass</option>
                  <option value="improve health">Improve Health</option>
                  <option value="control diabetes">Control Diabetes</option>
                  <option value="control hypertension">Control Hypertension</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  id="alergias"
                  name="alergias"
                  type="text"
                  value={formData.alergias}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="nuts, dairy, shellfish (separate with commas)"
                />
              </div>

              <div>
                <label htmlFor="restricciones_alimentarias" className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Restrictions
                </label>
                <input
                  id="restricciones_alimentarias"
                  name="restricciones_alimentarias"
                  type="text"
                  value={formData.restricciones_alimentarias}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="vegetarian, gluten-free, low sodium (separate with commas)"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  value={formData.notas}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional notes about the patient..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer  */}
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
            className="px-6 py-2 bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Create Patient
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}