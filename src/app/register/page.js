"use client"

import { useState } from "react"
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: "",
    lastName: "",
    secondLastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Step 2: Address Info
    city: "",
    street: "",
    neighborhood: "",
    streetNumber: "",

    // Step 3: Professional Info
    licenseNumber: "",
    specialization: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
    // Clear field error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: "",
      })
    }
  }

  const validateStep1 = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address"
      }
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long"
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}

    if (!formData.city.trim()) {
      errors.city = "City is required"
    }

    if (!formData.street.trim()) {
      errors.street = "Street is required"
    }

    if (!formData.neighborhood.trim()) {
      errors.neighborhood = "Neighborhood is required"
    }

    if (!formData.streetNumber.trim()) {
      errors.streetNumber = "Street number is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = () => {
    const errors = {}

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = "License number is required"
    }

    if (!formData.specialization.trim()) {
      errors.specialization = "Specialization is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setFieldErrors({})
    }
  }

  const handleSubmit = async (skipProfessionalInfo = false) => {
    setIsLoading(true)
    setError("")

    try {
      const submitData = {
        name: formData.name,
        lastName: formData.lastName,
        secondLastName: formData.secondLastName || null,
        email: formData.email.toLowerCase(),
        password: formData.password,
        city: formData.city,
        street: formData.street,
        neighborhood: formData.neighborhood,
        streetNumber: formData.streetNumber,
        licenseNumber: formData.licenseNumber || null,
        specialization: formData.specialization || null,
      }

      // Step 1: Register the user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const registerData = await registerResponse.json()

      if (registerResponse.ok) {
        // Step 2: Automatically log them in
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        if (loginResponse.ok) {
          // Step 3: Redirect to dashboard with success message
          router.push("/dashboard?message=Welcome to FitBalance! Your account has been created successfully.")
        } else {
          // Registration worked but login failed, redirect to login
          router.push("/login?message=Account created successfully! Please sign in.")
        }
      } else {
        setError(registerData.error || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Personal Information</h2>
      <p className="mt-2 text-center text-sm text-gray-600">Lets start with your basic information</p>

      <div className="space-y-6 mt-8">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="John"
            />
            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.lastName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Doe"
            />
            {fieldErrors.lastName && <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="secondLastName" className="block text-sm font-medium text-gray-700">
            Second Last Name
          </label>
          <div className="mt-1">
            <input
              id="secondLastName"
              name="secondLastName"
              type="text"
              value={formData.secondLastName}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="examplemail@example.com"
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password *
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.confirmPassword ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
        </div>

        <div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  const renderStep2 = () => (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Practice Address</h2>
      <p className="mt-2 text-center text-sm text-gray-600">Physical address for consultations (required)</p>

      <div className="space-y-6 mt-8">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <div className="mt-1">
            <input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.city ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Tijuana"
            />
            {fieldErrors.city && <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Street *
          </label>
          <div className="mt-1">
            <input
              id="street"
              name="street"
              type="text"
              required
              value={formData.street}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.street ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Avenida Revolución"
            />
            {fieldErrors.street && <p className="mt-1 text-sm text-red-600">{fieldErrors.street}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
            Neighborhood *
          </label>
          <div className="mt-1">
            <input
              id="neighborhood"
              name="neighborhood"
              type="text"
              required
              value={formData.neighborhood}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.neighborhood ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Zona Centro"
            />
            {fieldErrors.neighborhood && <p className="mt-1 text-sm text-red-600">{fieldErrors.neighborhood}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-700">
            Street Number *
          </label>
          <div className="mt-1">
            <input
              id="streetNumber"
              name="streetNumber"
              type="text"
              required
              value={formData.streetNumber}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.streetNumber ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="1234"
            />
            {fieldErrors.streetNumber && <p className="mt-1 text-sm text-red-600">{fieldErrors.streetNumber}</p>}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  const renderStep3 = () => (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Professional Information</h2>
      <p className="mt-2 text-center text-sm text-gray-600">Add your professional credentials (optional)</p>

      <div className="space-y-6 mt-8">

        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            License Number *
          </label>
          <div className="mt-1">
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  fieldErrors.licenseNumber ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="12345678"
              />
            {fieldErrors.licenseNumber && <p className="mt-1 text-sm text-red-600">{fieldErrors.licenseNumber}</p>}
          </div>
        </div>
        

        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
            Specialization *
          </label>
          <div className="mt-1">
            <input
              id="specialization"
              name="specialization"
              type="text"
              required
              value={formData.specialization}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                fieldErrors.specialization ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Clinical Nutrition"
            />
            {fieldErrors.specialization && <p className="mt-1 text-sm text-red-600">{fieldErrors.specialization}</p>}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (validateStep3()) {
                handleSubmit(false)
              }
            }}
            disabled={isLoading}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Account"}
            <Check className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#b2e29f] to-[#e2ffd4] flex flex-col justify-center py-5 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to home */}
        <Link href="/" className="flex items-center text-green-600 hover:text-green-100 duration-500 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center">
              <img src="/logo1.png" alt="FitBalance Logo" className="h-12 w-12 mr-2 rounded-2xl" />
              <span className="ml-2 text-2xl font-bold text-green-600">FitBalance</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className={`w-8 h-1 ${currentStep >= 2 ? "bg-green-600" : "bg-gray-200"}`}></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div className={`w-8 h-1 ${currentStep >= 3 ? "bg-green-600" : "bg-gray-200"}`}></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {error && (
            <div className="my-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>

          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}