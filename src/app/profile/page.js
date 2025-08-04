"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Camera,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Apple,
  Carrot,
  Leaf,
  Utensils,
  Wheat,
  MapPin,
  Home,
  Building,
  CreditCard,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Sidebar from "@/components/layout/Sidebar"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const [nutritionist, setNutritionist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState("/nutriologo_cartoon.jpg")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const fileInputRef = useRef(null)

  // State for password validation errors
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadNutritionistData()
  }, [])

  const loadNutritionistData = async () => {
    try {
      const response = await fetch("/api/nutritionist/me")
      if (response.ok) {
        const data = await response.json()
        setNutritionist(data.nutritionist)
        setFormData(data.nutritionist)
      } else {
        // Example data if no response
        const mockData = {
          name: "Dr. Maria Elena",
          lastName: "Gonzalez",
          secondLastName: "Rodriguez",
          email: "maria.gonzalez@nutrition.com",
          phone: "+52 55 1234 5678",
          city: "Mexico City",
          street: "Av. Insurgentes Sur",
          neighborhood: "Roma Norte",
          streetNumber: "1234",
          licenseNumber: "12345678",
          specialization: "Clinical Nutrition",
        }
        setNutritionist(mockData)
        setFormData(mockData)
      }
    } catch (error) {
      console.error("Error loading nutritionist data:", error)
      const mockData = {
        name: "Dr. Maria Elena",
        lastName: "Gonzalez",
        secondLastName: "Rodriguez",
        email: "maria.gonzalez@nutrition.com",
        phone: "+52 55 1234 5678",
        city: "Mexico City",
        street: "Av. Insurgentes Sur",
        neighborhood: "Roma Norte",
        streetNumber: "1234",
        licenseNumber: "12345678",
        specialization: "Clinical Nutrition",
      }
      setNutritionist(mockData)
      setFormData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    let payload = { ...formData }
    let isPasswordChangeAttempt = false

    // Check if any password field has been touched/filled
    if (passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) {
      isPasswordChangeAttempt = true
      payload = { ...payload, ...passwordData }
    }

    try {
      const response = await fetch("/api/nutritionist/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        setNutritionist(data.nutritionist)
        setEditing(false)
        alert("Profile updated successfully.")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        if (isPasswordChangeAttempt && errorData.error) {
          const newErrors = { ...passwordErrors }
          if (errorData.error.includes("La contraseña actual es incorrecta.")) {
            newErrors.currentPassword = "Current password is incorrect."
          } else if (errorData.error.includes("You must enter your current password")) {
            newErrors.currentPassword = "You must enter your current password to change it."
          } else if (errorData.error.includes("New password must be at least 6 characters long")) {
            newErrors.newPassword = "New password must be at least 6 characters long."
          } else if (errorData.error.includes("New password cannot be the same as the current password")) {
            newErrors.newPassword = "New password cannot be the same as the current password."
          } else if (errorData.error.includes("Passwords do not match")) {
            newErrors.confirmPassword = "Passwords do not match."
          } else if (errorData.error.includes("Failed to update password")) {
            alert("Error updating password. Please try again.")
          } else {
            alert(`Error updating profile: ${errorData.error || "Unknown error"}`)
          }
          setPasswordErrors(newErrors)
        } else {
          alert(`Error updating profile: ${errorData.error || "Unknown error"}`)
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile. Please check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(nutritionist)
    setEditing(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePasswordInputChange = (field, value) => {
    setPasswordData((prev) => {
      const updatedPasswordData = { ...prev, [field]: value }
      const newErrors = { ...passwordErrors }

      newErrors[field] = ""

      if (field === "newPassword") {
        if (value && value.length < 6) {
          newErrors.newPassword = "New password must be at least 6 characters long."
        } else if (value && updatedPasswordData.currentPassword && value === updatedPasswordData.currentPassword) {
          newErrors.newPassword = "New password cannot be the same as the current password."
        } else {
          newErrors.newPassword = ""
        }
        if (updatedPasswordData.confirmPassword && updatedPasswordData.confirmPassword !== value) {
          newErrors.confirmPassword = "Passwords do not match."
        } else if (updatedPasswordData.confirmPassword === value) {
          newErrors.confirmPassword = ""
        }
      }

      if (field === "confirmPassword") {
        if (value && value !== updatedPasswordData.newPassword) {
          newErrors.confirmPassword = "Passwords do not match."
        } else {
          newErrors.confirmPassword = ""
        }
      }

      if (field === "currentPassword") {
        if (!value && (updatedPasswordData.newPassword || updatedPasswordData.confirmPassword)) {
          newErrors.currentPassword = "You must enter your current password to change it."
        } else {
          newErrors.currentPassword = ""
        }
        if (updatedPasswordData.newPassword && updatedPasswordData.newPassword === value) {
          newErrors.newPassword = "New password cannot be the same as the current password."
        } else if (
          updatedPasswordData.newPassword &&
          updatedPasswordData.newPassword !== value &&
          newErrors.newPassword === "New password cannot be the same as the current password."
        ) {
          newErrors.newPassword = ""
        }
      }

      setPasswordErrors(newErrors)
      return updatedPasswordData
    })
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const hasAnyPasswordError = Object.values(passwordErrors).some((error) => error !== "")
  const isPasswordSectionActive =
    passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword
  const isSaveButtonDisabled = saving || (editing && isPasswordSectionActive && hasAnyPasswordError)

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-green-800 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 backdrop-blur-sm rounded-xl min-h-screen relative overflow-hidden">
          {/* Background icons */}
          <Apple className="absolute top-10 left-10 w-24 h-24 text-green-200 opacity-10 -rotate-12" />
          <Carrot className="absolute bottom-20 right-10 w-20 h-20 text-orange-200 opacity-10 rotate-45" />
          <Leaf className="absolute top-1/2 left-1/4 w-28 h-28 text-green-300 opacity-5 -translate-x-1/2 -translate-y-1/2" />
          <Utensils className="absolute bottom-5 left-1/3 w-20 h-20 text-gray-200 opacity-8 rotate-180" />
          <Wheat className="absolute top-5 right-1/4 w-20 h-20 text-yellow-200 opacity-8 rotate-90" />

          {/* Header */}
          <header className="pt-7 pb-2 px-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">My Profile</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700">
                  Manage your personal and professional information, Dr.{" "}
                  {nutritionist
                    ? [nutritionist.name, nutritionist.lastName, nutritionist.secondLastName].filter(Boolean).join(" ")
                    : "Doctor"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold px-4 py-2 rounded-md hover:from-green-500 hover:to-teal-600 transition-colors text-sm sm:text-base flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaveButtonDisabled}
                      className="bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold px-4 py-2 rounded-md hover:from-green-500 hover:to-teal-600 transition-colors text-sm sm:text-base flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white font-bold px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Profile Photo Section */}
              <div className="bg-white rounded-xl shadow-md border border-green-100 mb-6 relative overflow-hidden">
                <Apple className="absolute -top-5 -left-5 w-20 h-20 text-green-100 opacity-20 rotate-45" />
                <Carrot className="absolute -bottom-5 -right-5 w-16 h-16 text-orange-100 opacity-20 -rotate-45" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile Photo"
                          width={96}
                          height={96}
                          unoptimized={true}
                          className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {editing && (
                          <button
                            onClick={handleCameraClick}
                            className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
                            title="Change photo"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {nutritionist?.name} {nutritionist?.lastName} {nutritionist?.secondLastName}
                        </h2>
                        <p className="text-green-600 text-lg font-medium mt-1">
                          {nutritionist?.specialization || "Professional Nutritionist"}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 mr-1" />
                            License: {nutritionist?.licenseNumber || "Not registered"}
                          </div>
                          <div className="flex items-center text-sm">
                            {nutritionist?.isActive !== false ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                <span className="text-green-600">Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                                <span className="text-red-600">Inactive</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Member since: {formatDate(nutritionist?.createdAt)}</div>
                      <div>Last login: {formatDate(nutritionist?.lastLogin)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three-column grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-md border border-green-100 relative overflow-hidden">
                  <Utensils className="absolute top-5 right-5 w-16 h-16 text-gray-100 opacity-20 rotate-12" />
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.name || ""}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="First name"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <User size={16} className="text-green-600" />
                            {nutritionist?.name || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.lastName || ""}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="Last name"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <User size={16} className="text-green-600" />
                            {nutritionist?.lastName || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Second Last Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.secondLastName || ""}
                            onChange={(e) => handleInputChange("secondLastName", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="Second last name (optional)"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <User size={16} className="text-green-600" />
                            {nutritionist?.secondLastName || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        {editing ? (
                          <input
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="email@example.com"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Mail size={16} className="text-green-600" />
                            {nutritionist?.email || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        {editing ? (
                          <input
                            type="tel"
                            value={formData.phone || ""}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="+52 55 1234 5678"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Phone size={16} className="text-green-600" />
                            {nutritionist?.phone || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-xl shadow-md border border-green-100 relative overflow-hidden">
                  <Leaf className="absolute top-5 right-5 w-16 h-16 text-green-100 opacity-20 -rotate-12" />
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Address Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.city || ""}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="City"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Building size={16} className="text-green-600" />
                            {nutritionist?.city || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.street || ""}
                            onChange={(e) => handleInputChange("street", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="Street name"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Home size={16} className="text-green-600" />
                            {nutritionist?.street || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Number</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.streetNumber || ""}
                            onChange={(e) => handleInputChange("streetNumber", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="Street number"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Home size={16} className="text-green-600" />
                            {nutritionist?.streetNumber || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.neighborhood || ""}
                            onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                            placeholder="Neighborhood or district"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <MapPin size={16} className="text-green-600" />
                            {nutritionist?.neighborhood || "Not specified"}
                          </div>
                        )}
                      </div>

                      {/* Professional Information in Address Card */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-green-600" />
                          Professional Information
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Professional License</label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.licenseNumber || ""}
                                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                placeholder="Professional license number"
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                <CreditCard size={16} className="text-blue-600" />
                                {nutritionist?.licenseNumber || "Not registered"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                            {editing ? (
                              <select
                                value={formData.specialization || ""}
                                onChange={(e) => handleInputChange("specialization", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                              >
                                <option value="">Select specialization</option>
                                <option value="Clinical Nutrition">Clinical Nutrition</option>
                                <option value="Sports Nutrition">Sports Nutrition</option>
                                <option value="Pediatric Nutrition">Pediatric Nutrition</option>
                                <option value="Geriatric Nutrition">Geriatric Nutrition</option>
                                <option value="Community Nutrition">Community Nutrition</option>
                                <option value="Oncology Nutrition">Oncology Nutrition</option>
                                <option value="Vegetarian/Vegan Nutrition">Vegetarian/Vegan Nutrition</option>
                                <option value="Eating Disorders">Eating Disorders</option>
                                <option value="Diabetes and Endocrinology">Diabetes and Endocrinology</option>
                                <option value="General Nutrition">General Nutrition</option>
                              </select>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">
                                <Award size={16} className="text-purple-600" />
                                {nutritionist?.specialization || "Not specified"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl shadow-md border border-green-100 relative overflow-hidden">
                  <Shield className="absolute top-5 left-5 w-16 h-16 text-green-100 opacity-20 -rotate-12" />
                  <Lock className="absolute bottom-5 right-5 w-12 h-12 text-green-100 opacity-20 rotate-45" />
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Security
                    </h3>
                  </div>
                  <div className="p-6">
                    {editing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter your current password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("current")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500"
                            >
                              {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("new")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500"
                            >
                              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility("confirm")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500"
                            >
                              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              value="********"
                              readOnly
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-green-50 text-gray-600 focus:outline-none select-none cursor-default"
                            />
                          </div>
                        </div>

                        {/* Account Status */}
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-green-600" />
                            Account Status
                          </h4>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Status</span>
                              <div className="flex items-center">
                                {nutritionist?.isActive !== false ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                    <span className="text-sm text-green-600 font-medium">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1 text-red-500" />
                                    <span className="text-sm text-red-600 font-medium">Inactive</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Created</span>
                              <span className="text-sm text-gray-600">
                                {nutritionist?.createdAt
                                  ? new Date(nutritionist.createdAt).toLocaleDateString("en-US")
                                  : "N/A"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Last login</span>
                              <span className="text-sm text-gray-600">
                                {nutritionist?.lastLogin
                                  ? new Date(nutritionist.lastLogin).toLocaleDateString("en-US")
                                  : "Never"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
