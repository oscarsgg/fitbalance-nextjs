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
} from "lucide-react"
import Sidebar from "@/components/layout/Sidebar"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const [nutritionist, setNutritionist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false) // Main editing state
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState("/user.png")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false, // For the current password field (when not editing)
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
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
          name: "Dr. Maria Elena Gonzalez",
          email: "maria.gonzalez@nutrition.com",
          phone: "+52 55 1234 5678",
        }
        setNutritionist(mockData)
        setFormData(mockData)
      }
    } catch (error) {
      console.error("Error loading nutritionist data:", error)
      const mockData = {
        name: "Dr. Maria Elena Gonzalez",
        email: "maria.gonzalez@nutrition.com",
        phone: "+52 55 1234 5678",
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
      // Clear errors at the start of save attempt
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    let payload = { ...formData }
    let isPasswordChangeAttempt = false

    // Check if any password field has been touched/filled
    if (passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) {
      isPasswordChangeAttempt = true
      payload = { ...payload, ...passwordData } // Add password data to payload
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
        // Clear password fields after successful update
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        if (isPasswordChangeAttempt && errorData.error) {
          // Map backend errors to frontend state
          const newErrors = { ...passwordErrors }
          if (errorData.error.includes("La contraseña actual es incorrecta.")) {
            // Specific message from backend
            newErrors.currentPassword = "La contraseña actual es incorrecta."
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
          // Handle non-password related errors or general update errors
          alert(`Error updating profile: ${errorData.error || "Unknown error"}`)
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile. Please check your connection and try again.")
    } finally {
      setSaving(false)
      setPasswordLoading(false) // Ensure password loading is off
    }
  }

  const handleCancel = () => {
    setFormData(nutritionist)
    setEditing(false)
    // Reset password fields and errors on cancel
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordErrors({
      // Clear errors
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

  // Modified handler for password input changes to provide real-time validation
  const handlePasswordInputChange = (field, value) => {
    setPasswordData((prev) => {
      const updatedPasswordData = { ...prev, [field]: value }
      const newErrors = { ...passwordErrors }

      // Clear the error for the current field as user types
      newErrors[field] = "" // Clear error for the field being typed into

      // Client-side validation for New Password
      if (field === "newPassword") {
        if (value && value.length < 6) {
          newErrors.newPassword = "New password must be at least 6 characters long."
        } else if (value && updatedPasswordData.currentPassword && value === updatedPasswordData.currentPassword) {
          newErrors.newPassword = "New password cannot be the same as the current password."
        } else {
          newErrors.newPassword = ""
        }
        // Re-validate confirm password if new password changes and confirm password has a value
        if (updatedPasswordData.confirmPassword && updatedPasswordData.confirmPassword !== value) {
          newErrors.confirmPassword = "Passwords do not match."
        } else if (updatedPasswordData.confirmPassword === value) {
          newErrors.confirmPassword = ""
        }
      }

      // Client-side validation for Confirm New Password
      if (field === "confirmPassword") {
        if (value && value !== updatedPasswordData.newPassword) {
          newErrors.confirmPassword = "Passwords do not match."
        } else {
          newErrors.confirmPassword = ""
        }
      }

      // Client-side validation for Current Password (only if empty when other fields are filled)
      if (field === "currentPassword") {
        if (!value && (updatedPasswordData.newPassword || updatedPasswordData.confirmPassword)) {
          newErrors.currentPassword = "You must enter your current password to change it."
        } else {
          newErrors.currentPassword = "" // Clear if user starts typing or it's no longer empty
        }
        // Re-validate new password if current password changes and new password has a value and is the same
        if (updatedPasswordData.newPassword && updatedPasswordData.newPassword === value) {
          newErrors.newPassword = "New password cannot be the same as the current password."
        } else if (
          updatedPasswordData.newPassword &&
          updatedPasswordData.newPassword !== value &&
          newErrors.newPassword === "New password cannot be the same as the current password."
        ) {
          newErrors.newPassword = "" // Clear if they become different
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

  // Determine if any password error exists
  const hasAnyPasswordError = Object.values(passwordErrors).some((error) => error !== "")

  // Determine if the password section is actively being used (any password field has a value)
  const isPasswordSectionActive =
    passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword

  // Determine if the save button should be disabled
  // It's disabled if: 1. A save operation is in progress (`saving`).
  // 2. OR, if we are in editing mode AND the password section is active AND there's any password error.
  const isSaveButtonDisabled = saving || (editing && isPasswordSectionActive && hasAnyPasswordError)

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
          {/* Background icons for the main container */}
          <Apple className="absolute top-10 left-10 w-24 h-24 text-green-200 opacity-10 -rotate-12" />
          <Carrot className="absolute bottom-20 right-10 w-20 h-20 text-orange-200 opacity-10 rotate-45" />
          <Leaf className="absolute top-1/2 left-1/4 w-28 h-28 text-green-300 opacity-5 -translate-x-1/2 -translate-y-1/2" />
          <Utensils className="absolute bottom-5 left-1/3 w-20 h-20 text-gray-200 opacity-8 rotate-180" />
          <Wheat className="absolute top-5 right-1/4 w-20 h-20 text-yellow-200 opacity-8 rotate-90" />

          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                  title="Go Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">My Profile</h1>
                  <p className="text-green-100 text-sm">Manage your personal information</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true)
                    }}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaveButtonDisabled} // Updated disabled prop
                      className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Profile Photo */}
              <div className="bg-white rounded-xl shadow-md border border-green-100 mb-6 relative overflow-hidden">
                <Apple className="absolute -top-5 -left-5 w-20 h-20 text-green-100 opacity-20 rotate-45" />
                <Carrot className="absolute -bottom-5 -right-5 w-16 h-16 text-orange-100 opacity-20 -rotate-45" />
                <div className="p-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Image
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile Photo"
                        width={96}
                        height={96}
                        unoptimized={true}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        onClick={handleCameraClick}
                        className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
                        title="Change photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{nutritionist?.name}</h2>
                      <p className="text-gray-600 text-sm mt-1">Professional Nutritionist</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-md border border-green-100 relative overflow-hidden">
                  <Utensils className="absolute top-5 right-5 w-16 h-16 text-gray-100 opacity-20 rotate-12" />
                  <Leaf className="absolute bottom-5 left-5 w-12 h-12 text-green-100 opacity-20 -rotate-12" />
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.name || ""}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <User size={16} className="text-green-600" />
                            {nutritionist?.name}
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

                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Mail size={16} className="text-green-600" />
                            {nutritionist?.email}
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

                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Phone size={16} className="text-green-600" />
                            {nutritionist?.phone}
                          </div>
                        )}
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
                    {/* Password form is shown if 'editing' is true */}
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
                      // Show current password (*****)
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
