"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import {
  Calendar,
  Mail,
  Phone,
  User,
  Weight,
  Ruler,
  Heart,
  Shield,
  Utensils,
  Apple,
  Carrot,
  Leaf,
  Wheat,
  Lock,
  Eye,
  EyeOff,
  XCircle,
  Info,
  Stethoscope,
  Activity,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PatientDetailsPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedPatient, setEditedPatient] = useState(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(format(new Date(), "EEEE", { locale: es }))
  const [dietLoading, setDietLoading] = useState(false)
  const [dietError, setDietError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchPatientDetails()
      fetchWeeklyPlan()
    }
  }, [id, selectedDate])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch patient details")
      }
      const data = await response.json()
      setPatient(data)
      setEditedPatient(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyPlan = async () => {
    try {
      setDietLoading(true)
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const response = await fetch(`/api/patients/${id}/weekly-plan?date=${formattedDate}`)
      if (!response.ok) {
        throw new Error("Failed to fetch weekly plan")
      }
      const data = await response.json()
      setWeeklyPlan(data)
    } catch (err) {
      setDietError(err.message)
    } finally {
      setDietLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedPatient((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedPatient),
      })
      if (!response.ok) {
        throw new Error("Failed to update patient details")
      }
      await fetchPatientDetails() // Re-fetch to get the latest data
      setEditMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedPatient(patient)
    setEditMode(false)
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match.")
      return
    }
    setPasswordLoading(true)
    setPasswordMessage("")
    try {
      const response = await fetch(`/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setPasswordMessage("Password changed successfully!")
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowPasswordForm(false) // Hide form after success
      } else {
        setPasswordMessage(data.message || "Failed to change password.")
      }
    } catch (err) {
      setPasswordMessage("An error occurred. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setPasswordMessage("")
  }

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value))
    setSelectedDay(format(new Date(e.target.value), "EEEE", { locale: es }))
  }

  const handleDayChange = (value) => {
    setSelectedDay(value)
    // Logic to find the date for the selected day in the current week
    const today = new Date(selectedDate)
    const currentDayOfWeek = today.getDay() // 0 for Sunday, 1 for Monday, etc.
    const targetDayOfWeek = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"].indexOf(
      value.toLowerCase(),
    )

    if (targetDayOfWeek !== -1) {
      const diff = targetDayOfWeek - currentDayOfWeek
      const newDate = new Date(today)
      newDate.setDate(today.getDate() + diff)
      setSelectedDate(newDate)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <Heart
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 animate-pulse"
              size={24}
            />
          </div>
          <p className="text-lg font-semibold text-green-700">Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200">
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="w-16 h-16 text-red-600" />
          <p className="text-lg font-semibold text-red-800">Error: {error}</p>
          <Button onClick={fetchPatientDetails} className="bg-red-500 hover:bg-red-600 text-white">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="flex flex-col items-center space-y-4">
          <Info className="w-16 h-16 text-gray-600" />
          <p className="text-lg font-semibold text-gray-800">Patient not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Icons */}
      <Apple className="absolute top-10 left-10 w-24 h-24 text-green-300 opacity-10 rotate-12" />
      <Carrot className="absolute bottom-20 right-10 w-28 h-28 text-orange-300 opacity-10 -rotate-45" />
      <Leaf className="absolute top-1/2 left-1/4 w-32 h-32 text-green-400 opacity-5 rotate-90" />
      <Utensils className="absolute bottom-1/4 left-10 w-20 h-20 text-gray-400 opacity-8 -rotate-12" />
      <Wheat className="absolute top-20 right-1/4 w-28 h-28 text-yellow-600 opacity-8 rotate-45" />

      <div className="max-w-6xl mx-auto bg-white/65 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden relative z-10">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Stethoscope className="w-48 h-48 text-white/10 rotate-45" />
            <Heart className="w-40 h-40 text-white/10 -rotate-12 ml-10" />
            <Activity className="w-52 h-52 text-white/10 rotate-90 mr-10" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Patient Profile</h1>
            <p className="text-green-100 text-lg">Manage patient details and weekly diet plan</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <Card className="bg-blue-50 border border-blue-100 shadow-lg relative overflow-hidden">
            <Utensils className="absolute top-4 right-4 w-16 h-16 text-blue-200 opacity-30 rotate-12" />
            <Leaf className="absolute bottom-4 left-4 w-16 h-16 text-blue-200 opacity-30 -rotate-45" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
              <Button
                onClick={() => setEditMode(!editMode)}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 transform hover:scale-105"
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <Image
                    className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
                    src={
                      patient.image ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={patient.name}
                    width={128}
                    height={128}
                  />
                  <button className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 shadow-md hover:bg-green-600 transition-colors duration-300 opacity-0 group-hover:opacity-100">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">{patient.name}</h2>
                  <p className="text-gray-600 text-lg">{patient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 flex items-center mb-1">
                    <User className="w-4 h-4 mr-2 text-blue-500" /> Name
                  </Label>
                  {editMode ? (
                    <Input
                      id="name"
                      name="name"
                      value={editedPatient.name}
                      onChange={handleInputChange}
                      className="border-blue-300 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{patient.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 flex items-center mb-1">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" /> Email
                  </Label>
                  {editMode ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editedPatient.email}
                      onChange={handleInputChange}
                      className="border-blue-300 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{patient.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 flex items-center mb-1">
                    <Phone className="w-4 h-4 mr-2 text-blue-500" /> Phone
                  </Label>
                  {editMode ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={editedPatient.phone}
                      onChange={handleInputChange}
                      className="border-blue-300 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{patient.phone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dob" className="text-gray-700 flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Date of Birth
                  </Label>
                  {editMode ? (
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={editedPatient.dob ? format(new Date(editedPatient.dob), "yyyy-MM-dd") : ""}
                      onChange={handleInputChange}
                      className="border-blue-300 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">
                      {patient.dob ? format(new Date(patient.dob), "PPP", { locale: es }) : "N/A"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="weight" className="text-gray-700 flex items-center mb-1">
                    <Weight className="w-4 h-4 mr-2 text-blue-500" /> Weight (kg)
                  </Label>
                  {editMode ? (
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={editedPatient.weight}
                      onChange={handleInputChange}
                      className="border-blue-300 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{patient.weight} kg</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="height" className="text-gray-700 flex items-center mb-1">
                    <Ruler className="w-4 h-4 mr-2 text-blue-500" /> Height (cm)
                  </Label>
                  {editMode ? (
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={editedPatient.height}
                      onChange={handleInputChange}
                      className="border-blue-300 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{patient.height} cm</p>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="bg-red-50 border border-red-100 shadow-lg relative overflow-hidden">
            <Shield className="absolute top-4 right-4 w-16 h-16 text-red-200 opacity-30 rotate-12" />
            <Lock className="absolute bottom-4 left-4 w-16 h-16 text-red-200 opacity-30 -rotate-45" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-2xl font-bold text-red-800 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 mb-4">
                Manage your account security settings. For patient data confidentiality, we recommend changing your
                password regularly.
              </p>
              {!showPasswordForm ? (
                <Button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-105"
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4 transition-all duration-500 ease-in-out animate-fadeIn">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-red-500" /> Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-red-500" /> New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-red-500" /> Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  {passwordMessage && (
                    <p
                      className={`text-sm mt-2 ${passwordMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}
                    >
                      {passwordMessage}
                    </p>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      onClick={handleCancelPasswordChange}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        passwordLoading ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {passwordLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Plan Section */}
        <div className="p-6 sm:p-8 lg:p-10">
          <Card className="bg-green-50 border border-green-100 shadow-lg relative overflow-hidden">
            <Apple className="absolute top-4 right-4 w-16 h-16 text-green-200 opacity-30 rotate-12" />
            <Carrot className="absolute bottom-4 left-4 w-16 h-16 text-green-200 opacity-30 -rotate-45" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
                <Utensils className="w-6 h-6 mr-2 text-green-600" />
                Weekly Diet Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <Label htmlFor="plan-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </Label>
                  <Input
                    id="plan-date"
                    type="date"
                    value={format(selectedDate, "yyyy-MM-dd")}
                    onChange={handleDateChange}
                    className="border-green-300 focus:ring-green-500"
                  />
                </div>
                <div className="flex-1 w-full">
                  <Label htmlFor="plan-day" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Day
                  </Label>
                  <Select value={selectedDay} onValueChange={handleDayChange}>
                    <SelectTrigger id="plan-day" className="w-full border-green-300 focus:ring-green-500">
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {dietLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : dietError ? (
                <div className="text-red-600 text-center py-8">Error loading diet plan: {dietError}</div>
              ) : weeklyPlan && weeklyPlan.meals && weeklyPlan.meals.length > 0 ? (
                <div className="space-y-4">
                  {weeklyPlan.meals.map((meal, index) => (
                    <Card key={index} className="bg-white border border-green-200 shadow-sm">
                      <CardContent className="p-4">
                        <h4 className="text-lg font-semibold text-green-700 mb-2">{meal.name}</h4>
                        <p className="text-gray-700">{meal.description}</p>
                        {meal.foods && meal.foods.length > 0 && (
                          <ul className="list-disc list-inside text-gray-600 mt-2">
                            {meal.foods.map((food, foodIndex) => (
                              <li key={foodIndex}>
                                {food.name} ({food.quantity} {food.unit})
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-center py-8">No weekly plan assigned for this day.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
