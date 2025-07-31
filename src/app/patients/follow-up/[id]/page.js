"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, CalendarIcon, Activity, Utensils, Soup, Apple, Coffee } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import WeightChart from "@/components/patients/WeightChart"
import HeightChart from "@/components/patients/HeightChart"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/Calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ScrollArea } from "@/components/ui/ScrollArea"

export default function PatientFollowUpPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [followUpData, setFollowUpData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyMealLog, setDailyMealLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dailyLogLoading, setDailyLogLoading] = useState(false)
  const router = useRouter()

  const handleRedirect = () => {
    router.push(`/patients/${id}`)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA") // YYYY-MM-DD format
  }

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true)
        // Cargar datos del paciente
        const patientResponse = await fetch(`/api/patients/${id}`)
        if (patientResponse.ok) {
          const patientData = await patientResponse.json()
          setPatient(patientData.patient)
        }

        // Cargar datos de seguimiento (para las gráficas y resumen general)
        const followUpResponse = await fetch(`/api/patients/${id}/follow-up`)
        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json()
          setFollowUpData(followUpData.data)
        }
      } catch (error) {
        console.error("Error loading patient data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadPatientData()
    }
  }, [id])

  useEffect(() => {
    const fetchDailyMealLog = async () => {
      if (!id || !selectedDate) return

      setDailyLogLoading(true)
      try {
        const formattedDate = formatDate(selectedDate)
        const response = await fetch(`/api/patients/${id}/daily-meal-logs?date=${formattedDate}`)
        if (response.ok) {
          const data = await response.json()
          setDailyMealLog(data.data)
        } else {
          setDailyMealLog(null) // No logs for this day
        }
      } catch (error) {
        console.error("Error fetching daily meal log:", error)
        setDailyMealLog(null)
      } finally {
        setDailyLogLoading(false)
      }
    }

    fetchDailyMealLog()
  }, [id, selectedDate])

  const getMealIcon = (type) => {
    switch (type) {
      case "breakfast":
        return <Coffee className="h-5 w-5 text-orange-500" />
      case "lunch":
        return <Utensils className="h-5 w-5 text-blue-500" />
      case "dinner":
        return <Soup className="h-5 w-5 text-purple-500" />
      case "snack":
        return <Apple className="h-5 w-5 text-green-500" />
      default:
        return <Utensils className="h-5 w-5 text-gray-500" />
    }
  }

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snack",
    }
    return labels[type] || type
  }

  const calculateDailyTotals = (log) => {
    if (!log || !log.meals) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0 }
    }

    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0

    log.meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        if (food.food_details && food.grams) {
          const ratio = food.grams / 100 // Nutrients are per 100g
          totalCalories += (food.food_details.nutrients?.energy_kcal || 0) * ratio
          totalProtein += (food.food_details.nutrients?.protein_g || 0) * ratio
          totalFat += (food.food_details.nutrients?.fat_g || 0) * ratio
          totalCarbs += (food.food_details.nutrients?.carbohydrates_g || 0) * ratio
        }
      })
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
    }
  }

  const dailyTotals = calculateDailyTotals(dailyMealLog)

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Patient not found</p>
            <Link href="/patients" className="text-green-600 hover:underline mt-2 inline-block">
              Return to patients list
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 rounded-xl min-h-screen">
          {/* Header */}
          <header className="pt-7 pb-2 px-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/patients" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{patient.name} - Follow Up</h1>
                    <p className="text-gray-600">Patient Progress Tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Image
                            className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover"
                            src="/user-alt.png"
                            alt={patient.name}
                            width={80}
                            height={80}
                          />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{patient.name}</h2>
                          <p className="text-green-100 text-sm mt-1">{patient.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Age</p>
                              <p className="text-2xl font-bold text-gray-900">{patient.age}</p>
                              <p className="text-xs text-gray-400">years old</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <CalendarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">BMI</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {(patient.weight_kg / (patient.height_cm / 100) ** 2).toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-400">kg/m²</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Activity className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Stats */}
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Follow-up Summary</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Weight Records:</span>
                              <span className="font-medium">{followUpData?.totalWeightRecords || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Recent Meal Logs:</span>
                              <span className="font-medium">{followUpData?.totalMealLogs || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Current Weight:</span>
                              <span className="font-medium">{patient.weight_kg} kg</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Current Height:</span>
                              <span className="font-medium">{patient.height_cm} cm</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Patient Objective</h3>
                          <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
                            <p className="text-blue-800 font-medium capitalize">{patient.objective}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            onClick={handleRedirect}
                            className="flex-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors py-2 px-4 font-medium"
                          >
                            Create a weekly plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts and Daily Meal Logs Section */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <HeightChart patientId={id} />
                      <WeightChart patientId={id} />
                    </div>

                    {/* Daily Meal Logs Section */}
                    <Card className="bg-white/63 shadow-sm border border-gray-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Utensils className="h-6 w-6 text-orange-500" />
                          Daily Meal Logs
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          View and track daily food intake for{" "}
                          <span className="font-semibold">{formatDisplayDate(selectedDate)}</span>
                        </p>
                      </CardHeader>
                      <CardContent className="flex flex-col lg:flex-row gap-6">
                        {/* Calendar */}
                        <div className="lg:w-1/3 flex justify-center">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="shadow-sm"
                          />
                        </div>

                        {/* Meal Log Details */}
                        <div className="lg:w-2/3">
                          {dailyLogLoading ? (
                            <div className="flex items-center justify-center h-96">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                            </div>
                          ) : dailyMealLog ? (
                            <div className="space-y-4">
                              {/* Daily Totals */}
                              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Activity className="h-5 w-5 text-green-600" />
                                  Daily Totals
                                </h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{dailyTotals.calories}</div>
                                    <div className="text-sm text-gray-600">Calories</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{dailyTotals.protein}g</div>
                                    <div className="text-sm text-gray-600">Protein</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{dailyTotals.fat}g</div>
                                    <div className="text-sm text-gray-600">Fat</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{dailyTotals.carbs}g</div>
                                    <div className="text-sm text-gray-600">Carbs</div>
                                  </div>
                                </div>
                              </div>

                              {/* Meals by Type */}
                              <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-6">
                                  {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                                    const mealsOfType = dailyMealLog.meals.filter((meal) => meal.type === mealType)
                                    if (mealsOfType.length === 0) return null

                                    return (
                                      <div key={mealType} className="space-y-3">
                                        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                                          {getMealIcon(mealType)}
                                          <h4 className="text-lg font-semibold text-gray-800">
                                            {getMealTypeLabel(mealType)}
                                          </h4>
                                        </div>

                                        {mealsOfType.map((meal, index) => (
                                          <div
                                            key={index}
                                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                                          >
                                            {meal.time && (
                                              <p className="text-sm text-gray-500 mb-3 font-medium">🕐 {meal.time}</p>
                                            )}
                                            <div className="space-y-2">
                                              {meal.foods.map((food, foodIndex) => (
                                                <div
                                                  key={foodIndex}
                                                  className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                                                >
                                                  <div className="flex-1">
                                                    <span className="font-medium text-gray-800">
                                                      {food.food_name || "Unknown Food"}
                                                    </span>
                                                    <span className="text-gray-600 ml-2">({food.grams}g)</span>
                                                  </div>
                                                  {food.food_details?.nutrients && (
                                                    <div className="text-sm text-gray-500">
                                                      {Math.round(
                                                        (food.food_details.nutrients.energy_kcal || 0) *
                                                          (food.grams / 100),
                                                      )}{" "}
                                                      cal
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  })}
                                </div>
                              </ScrollArea>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                              <Utensils className="h-16 w-16 mb-4 text-gray-300" />
                              <h4 className="text-xl font-medium mb-2">No Meal Logs for this Day</h4>
                              <p className="text-sm text-center max-w-md">
                                No food intake has been recorded for {formatDisplayDate(selectedDate)}. Select a
                                different date or ask the patient to log their meals.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity Summary */}
                    <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-500 rounded-lg flex items-center justify-center text-white mr-4">
                          <Activity className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                          <p className="text-sm text-gray-600">Last 30 days meal logging activity</p>
                        </div>
                      </div>

                      {followUpData?.totalMealLogs > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{followUpData.totalMealLogs}</div>
                            <div className="text-sm text-green-700">Meal Logs</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{followUpData.totalWeightRecords}</div>
                            <div className="text-sm text-blue-700">Weight Records</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.round((followUpData.totalMealLogs / 30) * 10) / 10}
                            </div>
                            <div className="text-sm text-purple-700">Avg. Daily Logs</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                          <Activity className="h-12 w-12 mb-4 text-gray-300" />
                          <h4 className="text-lg font-medium mb-2">No Recent Activity</h4>
                          <p className="text-sm text-center">No meal logs have been recorded in the last 30 days.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
