"use client"

import { useState, useEffect } from "react"
import { Plus, Save, Trash, Check, AlertCircle, CheckCircle } from "lucide-react"
import { Tooltip, Typography, Progress } from "@material-tailwind/react"

export default function DietManagement({ patientId }) {
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [selectedWeekStart, setSelectedWeekStart] = useState(getMonday(new Date()))
  const [selectedDay, setSelectedDay] = useState("monday")
  const [selectedMealType, setSelectedMealType] = useState("breakfast")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedGrams, setSelectedGrams] = useState(100)
  const [loading, setLoading] = useState(false)
  const [patient, setPatient] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState([])

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0] // YYYY-MM-DD
  }

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  const mealTypes = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
    { key: "snack", label: "Snack" },
  ]

  useEffect(() => {
    loadPatient()
    loadWeeklyPlan()
  }, [patientId, selectedWeekStart])

  // Clear form when component unmounts or page is refreshed
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearFormData()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      clearFormData()
    }
  }, [])

  function getMonday(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d
  }

  const clearFormData = () => {
    setSearchTerm("")
    setSearchResults([])
    setSelectedGrams(100)
    setValidationErrors([])
  }

  const resetWeeklyPlan = () => {
    setWeeklyPlan({
      patient_id: patientId,
      week_start: selectedWeekStart,
      weight_kg: patient?.weight_kg || 0,
      height_cm: patient?.height_cm || 0,
      dailyCalories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      meals: getEmptyWeekMeals(),
    })
  }

  const loadPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
      }
    } catch (error) {
      console.error("Error loading patient:", error)
    }
  }

  const loadWeeklyPlan = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/weekly-plan?weekStart=${selectedWeekStart}`)
      if (response.ok) {
        const data = await response.json()
        if (data.plan) {
          console.log("Loaded plan:", data.plan)
          // Convertir el plan de formato de almacenamiento a formato de visualización
          const displayPlan = convertToDisplayFormat(data.plan)
          setWeeklyPlan(displayPlan)
        } else {
          resetWeeklyPlan()
        }
      }
    } catch (error) {
      console.error("Error loading weekly plan:", error)
      resetWeeklyPlan()
    }
  }

  const getEmptyWeekMeals = () => {
    const emptyDay = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }

    return {
      monday: { ...emptyDay },
      tuesday: { ...emptyDay },
      wednesday: { ...emptyDay },
      thursday: { ...emptyDay },
      friday: { ...emptyDay },
      saturday: { ...emptyDay },
      sunday: { ...emptyDay },
    }
  }

  // Convert from storage format (array) to display format (nested object)
  const convertToDisplayFormat = (plan) => {
    if (!plan || !plan.meals) return plan

    console.log("Converting plan to display format:", plan)

    const displayFormat = {
      ...plan,
      weight_kg:
        plan.weight_kg !== undefined ? plan.weight_kg : patient?.weight_kg || 0,
      height_cm:
        plan.height_cm !== undefined ? plan.height_cm : patient?.height_cm || 0,
      meals: getEmptyWeekMeals(),
    }

    // Si meals es un array (formato de almacenamiento)
    if (Array.isArray(plan.meals)) {
      plan.meals.forEach((meal) => {
        if (displayFormat.meals[meal.day] && displayFormat.meals[meal.day][meal.type]) {
          displayFormat.meals[meal.day][meal.type] = meal.foods.map((food) => ({
            food_id: food.food_id,
            grams: food.grams,
            food_name: food.food_name || "Unknown Food",
            food_nutrients: food.food_nutrients || null,
            time: meal.time,
          }))
        }
      })
    } else {
      // Si meals ya está en formato de objeto (formato de visualización)
      displayFormat.meals = plan.meals
    }

    console.log("Converted to display format:", displayFormat)
    return displayFormat
  }

  // Convert from display format (nested object) to storage format (array)
  const convertToStorageFormat = (displayPlan) => {
    if (!displayPlan || !displayPlan.meals) return []

    const meals = []
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const mealTypes = ["breakfast", "lunch", "dinner", "snack"]

    // Default times for each meal type
    const defaultTimes = {
      breakfast: "08:00",
      lunch: "13:00",
      dinner: "19:00",
      snack: "16:00",
    }

    days.forEach((day) => {
      mealTypes.forEach((type) => {
        const dayMeals = displayPlan.meals[day]
        if (dayMeals && dayMeals[type] && dayMeals[type].length > 0) {
          meals.push({
            day: day,
            type: type,
            time: dayMeals[type][0]?.time || defaultTimes[type],
            foods: dayMeals[type].map((food) => ({
              food_id: food.food_id,
              grams: Number.parseInt(food.grams) || 100,
            })),
          })
        }
      })
    })

    return meals
  }

  const validateForm = () => {
    const errors = []

    // Validate measurements
    if (!weeklyPlan?.weight_kg || weeklyPlan.weight_kg < 1) {
      errors.push("Weight must be at least 1 kg")
    }
    if (!weeklyPlan?.height_cm || weeklyPlan.height_cm < 30) {
      errors.push("Height must be at least 30 cm")
    }


    // Validate macronutrients
    if (!weeklyPlan?.dailyCalories || weeklyPlan.dailyCalories <= 0) {
      errors.push("Daily calories must be greater than 0")
    }
    if (!weeklyPlan?.protein || weeklyPlan.protein <= 0) {
      errors.push("Protein must be greater than 0")
    }
    if (!weeklyPlan?.carbs || weeklyPlan.carbs <= 0) {
      errors.push("Carbs must be greater than 0")
    }
    if (!weeklyPlan?.fat || weeklyPlan.fat <= 0) {
      errors.push("Fats must be greater than 0")
    }

    // Validate that each day has at least one meal
    const daysWithoutMeals = []
    daysOfWeek.forEach((day) => {
      const dayMeals = weeklyPlan?.meals?.[day.key]
      if (!dayMeals) {
        daysWithoutMeals.push(day.label)
        return
      }

      const hasMeals = Object.values(dayMeals).some((meals) => meals && meals.length > 0)
      if (!hasMeals) {
        daysWithoutMeals.push(day.label)
      }
    })

    if (daysWithoutMeals.length > 0) {
      errors.push(`The following days need at least one meal: ${daysWithoutMeals.join(", ")}`)
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const searchFood = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Search results:", data.foods)
        setSearchResults(data.foods || [])
      } else {
        console.error("Search failed:", response.status, response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching food:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const addFoodToMeal = async (food) => {
    if (!weeklyPlan || selectedGrams <= 0) return

    console.log("Adding food to meal:", {
      food: food.name,
      day: selectedDay,
      mealType: selectedMealType,
      grams: selectedGrams,
    })

    const newMeal = {
      food_id: food._id,
      grams: Number.parseInt(selectedGrams),
      food_name: food.name,
      food_nutrients: food.nutrients,
    }

    // Create a deep copy of the weekly plan to avoid mutation issues
    const updatedPlan = JSON.parse(JSON.stringify(weeklyPlan))

    // Ensure the day and meal type structure exists
    if (!updatedPlan.meals[selectedDay]) {
      updatedPlan.meals[selectedDay] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      }
    }

    if (!updatedPlan.meals[selectedDay][selectedMealType]) {
      updatedPlan.meals[selectedDay][selectedMealType] = []
    }

    // Add the meal to the specific day and meal type
    updatedPlan.meals[selectedDay][selectedMealType].push(newMeal)

    // Update the state
    setWeeklyPlan(updatedPlan)

    // Clear search
    setSearchTerm("")
    setSearchResults([])
    setSelectedGrams(100)

    console.log(
      "Updated plan for",
      selectedDay,
      selectedMealType,
      ":",
      updatedPlan.meals[selectedDay][selectedMealType],
    )
  }

  const removeFoodFromMeal = (dayKey, mealType, foodIndex) => {
    const updatedPlan = { ...weeklyPlan }
    updatedPlan.meals[dayKey][mealType].splice(foodIndex, 1)
    setWeeklyPlan(updatedPlan)
  }

  const saveWeeklyPlan = async () => {
    if (!weeklyPlan) return

    // Validate form before saving
    if (!validateForm()) {
      setErrorMessage("Please fix the validation errors before saving.")
      setShowErrorModal(true)
      return
    }

    setLoading(true)
    try {
      // Convert from display format to storage format
      const mealsArray = convertToStorageFormat(weeklyPlan)

      // Prepare data for saving
      const dataToSave = {
        patient_id: patientId,
        week_start: selectedWeekStart,
        weight_kg: Number(weeklyPlan.weight_kg) || 0,
        height_cm: Number(weeklyPlan.height_cm) || 0,
        dailyCalories: weeklyPlan.dailyCalories || 0,
        protein: weeklyPlan.protein || 0,
        fat: weeklyPlan.fat || 0,
        carbs: weeklyPlan.carbs || 0,
        meals: mealsArray,
      }

      console.log("Saving plan data:", dataToSave)

      const method = weeklyPlan._id ? "PUT" : "POST"
      const body = weeklyPlan._id ? { planId: weeklyPlan._id, ...dataToSave } : dataToSave

      const response = await fetch(`/api/patients/${patientId}/weekly-plan`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setSuccessMessage("Weekly plan saved successfully!")
        setShowSuccessModal(true)
      } else {
        const data = await response.json()
        setErrorMessage(data.error || "Failed to save weekly plan")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error("Save error:", error)
      setErrorMessage("Network error. Please try again.")
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const calculateRecommendedMacros = () => {
    if (!patient) return { calories: 2000, protein: 100, carbs: 121, fat: 30 }

    const weight = patient.weight_kg
    const height = patient.height_cm
    const age = patient.age
    const gender = patient.gender

    // Basic BMR calculation (Mifflin-St Jeor Equation)
    let bmr
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Activity factor (assuming moderate activity)
    const calories = Math.round(bmr * 1.55)

    // Macro distribution (protein: 1.6g/kg, fat: 25% of calories, carbs: remainder)
    const protein = Math.round(weight * 1.6)
    const fat = Math.round((calories * 0.25) / 9) // 9 calories per gram of fat
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4) // 4 calories per gram

    return { calories, protein, carbs, fat }
  }

  const calculateDayCompletion = (dayKey) => {
    if (!weeklyPlan?.meals?.[dayKey]) return 0

    const dayMeals = weeklyPlan.meals[dayKey]
    const totalMeals = Object.keys(dayMeals).length
    const completedMeals = Object.values(dayMeals).filter((meals) => meals.length > 0).length

    return Math.round((completedMeals / totalMeals) * 100)
  }

  const calculateWeekCompletion = () => {
    if (!weeklyPlan?.meals) return 0

    const totalDays = daysOfWeek.length
    const completedDays = daysOfWeek.filter((day) => calculateDayCompletion(day.key) > 0).length

    return Math.round((completedDays / totalDays) * 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getWeekDates = (mondayDate) => {
    const dates = []
    const monday = new Date(mondayDate)

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const recommendedMacros = calculateRecommendedMacros()
  const weekDates = getWeekDates(selectedWeekStart)
  const dayCompletion = calculateDayCompletion(selectedDay)
  const weekCompletion = calculateWeekCompletion()

  return (
    <div className="space-y-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-4">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Validation Error</h3>
            <div className="text-gray-600 mb-4 text-left">
              {validationErrors.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{errorMessage}</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowErrorModal(false)
                setValidationErrors([])
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Diet Management</h3>
          <button
            onClick={saveWeeklyPlan}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

         {/* Current Measurements */}
        <div className="mb-6 bg-white/80 shadow-md rounded-xl p-4 border border-gray-200">
          <h4 className="text-lg font-medium text-gray-800 mt-3 text-center">Current Measurements</h4>
          <p className="text-sm font-medium text-gray-800 mb-5 text-center">
            Update patient's weight and height for this week
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={weeklyPlan?.weight_kg || ""}
                onChange={(e) =>
                  setWeeklyPlan({ ...weeklyPlan, weight_kg: Number(e.target.value) })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.some((error) => error.includes("Weight"))
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"}
                `}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="30"
                value={weeklyPlan?.height_cm || ""}
                onChange={(e) =>
                  setWeeklyPlan({ ...weeklyPlan, height_cm: Number(e.target.value) })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.some((error) => error.includes("Height"))
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"}
                `}
                required
              />
            </div>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="mb-6 bg-white/80 shadow-md rounded-xl p-4 border border-gray-200">
          <h4 className="text-lg font-medium text-gray-800 mt-3 text-center">Daily Macronutrients</h4>
          <p className="text-sm font-medium text-gray-800 mb-5 text-center">
            Insert the daily macronutrients for the patient
          </p>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Calories <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={weeklyPlan?.dailyCalories || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, dailyCalories: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.some((error) => error.includes("calories"))
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                  }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Protein (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={weeklyPlan?.protein || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, protein: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.some((error) => error.includes("Protein"))
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                  }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Carbs (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={weeklyPlan?.carbs || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, carbs: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.some((error) => error.includes("Carbs"))
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                  }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Fats (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={weeklyPlan?.fat || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, fat: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.some((error) => error.includes("Fats"))
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                  }`}
                required
              />
            </div>
          </div>

          {/* Recommended macronutrients guide */}
          <div className="bg-green-200/60 rounded-xl border border-green-400 my-5">
            <h4 className="text-sm font-medium text-green-700 mt-3 mx-3 mb-1">
              Recommended macronutrients (Based on patient's BMI)
            </h4>
            <div className="grid grid-cols-4 gap-4 text-gray-700 font-semibold">
              <div className="m-3">Calories: {recommendedMacros.calories}</div>
              <div className="m-3">Protein: {recommendedMacros.protein}g</div>
              <div className="m-3">Carbs: {recommendedMacros.carbs}g</div>
              <div className="m-3">Fats: {recommendedMacros.fat}g</div>
            </div>
            <div className="mx-3 pb-3">
              <button
                onClick={() => {
                  setWeeklyPlan({
                    ...weeklyPlan,
                    dailyCalories: recommendedMacros.calories,
                    protein: recommendedMacros.protein,
                    carbs: recommendedMacros.carbs,
                    fat: recommendedMacros.fat,
                  })
                }}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Use Recommended Values
              </button>
            </div>
          </div>
        </div>

        {/* Weekly plan */}
        <div className="bg-white/80 shadow-md rounded-xl p-4 border border-gray-200">
          <h4 className="text-lg font-medium text-gray-800 mt-3 text-center">Weekly plan</h4>
          <p className="text-sm font-medium text-gray-800 mb-5 text-center pb-4 border-b border-gray-300">
            You can assign a daily menu diet to complete the weekly plan for the patient
          </p>

          {/* Week selector */}
          <div className="flex justify-center items-center mb-4">
            <h4 className="text-lg font-medium text-gray-800 text-center mr-2">
              New weekly plan starting date <span className="text-red-500">*</span>
            </h4>
            <Tooltip
              placement="bottom"
              className="border border-blue-gray-50 bg-white text-center px-4 py-3 shadow-xl shadow-black/10 text-gray-500"
              content={
                <>
                  <p>Select the start date for the patient's diet.</p>
                  <p>Diets can only begin on Mondays.</p>
                </>
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4 cursor-pointer text-blue-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </Tooltip>
          </div>

          <div className="flex justify-center mb-4 pb-4 border-b border-gray-300">
            <input
              type="date"
              value={formatDateForInput(selectedWeekStart)}
              onChange={(e) => {
                const value = e.target.value
                if (!value) return
                const [year, month, day] = value.split("-")
                const date = new Date(year, month - 1, day)
                if (!isNaN(date)) {
                  setSelectedWeekStart(getMonday(date))
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Calendar display */}
          <div className="flex justify-center items-center mb-2">
            <h4 className="text-lg font-medium text-gray-800 text-center mr-2">Day of the week</h4>
            <Tooltip
              placement="bottom"
              className="border border-blue-gray-50 bg-white px-4 py-3 shadow-xl shadow-black/10 text-gray-500"
              content="Select and configure each patient's day menu."
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4 cursor-pointer text-blue-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </Tooltip>
          </div>

          <div className="flex bg-white shadow-md justify-start md:justify-center rounded-lg overflow-x-auto mx-auto py-4 px-2 md:mx-12">
            {daysOfWeek.map((day, index) => {
              const date = weekDates[index]
              const isSelected = day.key === selectedDay
              const completion = calculateDayCompletion(day.key)
              const hasError = validationErrors.some((error) => error.includes(day.label))

              return (
                <div
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex group hover:bg-green-500 hover:shadow-lg rounded-lg mx-1 transition-all duration-300 cursor-pointer justify-center w-16 ${isSelected ? "bg-green-600 shadow-lg" : ""
                    } ${hasError ? "ring-2 ring-red-400" : ""}`}
                >
                  <div className="flex items-center px-4 py-4">
                    <div className="text-center">
                      <p
                        className={`text-sm transition-all duration-300 ${isSelected ? "text-gray-100" : "text-gray-900 group-hover:text-gray-100"
                          }`}
                      >
                        {day.label.slice(0, 3)}
                      </p>
                      <p
                        className={`mt-3 transition-all duration-300 ${isSelected
                            ? "text-gray-100 font-bold"
                            : "text-gray-900 group-hover:text-gray-100 group-hover:font-bold"
                          }`}
                      >
                        {date.getDate()}
                      </p>
                      {completion > 0 && (
                        <div className="mt-1">
                          <span className="text-xs bg-white text-green-600 px-1 rounded">{completion}%</span>
                        </div>
                      )}
                      {hasError && (
                        <div className="mt-1">
                          <AlertCircle className="h-3 w-3 text-red-500 mx-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Meal Management Grid */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 text-center mt-4 mb-4">Meal Management</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Meal Type & Search */}
              <div className="space-y-4">
                {/* Meal Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal Type</label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-full bg-white border border-green-500 text-gray-800 py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {mealTypes.map((meal) => (
                      <option key={meal.key} value={meal.key}>
                        {meal.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Food Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Food</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search food..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        if (e.target.value.length >= 2) {
                          searchFood()
                        } else {
                          setSearchResults([])
                        }
                      }}
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <input
                      type="number"
                      placeholder="Grams"
                      value={selectedGrams}
                      onChange={(e) => setSelectedGrams(e.target.value)}
                      min="1"
                      className="w-24 px-3 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="p-2 bg-gray-50 border-b">
                      <p className="text-sm font-medium text-gray-600">Search Results ({searchResults.length})</p>
                    </div>
                    {searchResults.map((food) => (
                      <div
                        key={food._id}
                        className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{food.name}</p>
                          <p className="text-sm text-gray-500">
                            {food.nutrients.energy_kcal} kcal per 100g | P: {food.nutrients.protein_g}g | C:{" "}
                            {food.nutrients.carbohydrates_g}g | F: {food.nutrients.fat_g}g
                          </p>
                        </div>
                        <button
                          onClick={() => addFoodToMeal(food)}
                          disabled={!selectedGrams || selectedGrams <= 0}
                          className="ml-3 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={`Add ${selectedGrams}g to ${mealTypes.find((m) => m.key === selectedMealType)?.label}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {loading && searchTerm.length >= 2 && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Searching...</span>
                  </div>
                )}
              </div>

              {/* Right Column - Current Meal Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current {mealTypes.find((m) => m.key === selectedMealType)?.label} for{" "}
                  {daysOfWeek.find((d) => d.key === selectedDay)?.label}
                </label>

                <div className="border border-gray-200 rounded-lg bg-white min-h-[300px]">
                  {weeklyPlan?.meals?.[selectedDay]?.[selectedMealType]?.length > 0 ? (
                    <div className="p-4 space-y-3">
                      {weeklyPlan.meals[selectedDay][selectedMealType].map((meal, index) => (
                        <div
                          key={`${selectedDay}-${selectedMealType}-${index}`}
                          className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-green-300/75"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{meal.food_name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="font-medium">{meal.grams}g</span>
                              <span>
                                {meal.food_nutrients
                                  ? Math.round((meal.food_nutrients.energy_kcal * meal.grams) / 100)
                                  : 0}{" "}
                                kcal
                              </span>
                              {meal.food_nutrients && (
                                <span>
                                  P: {Math.round((meal.food_nutrients.protein_g * meal.grams) / 100)}g | C:{" "}
                                  {Math.round((meal.food_nutrients.carbohydrates_g * meal.grams) / 100)}g | F:{" "}
                                  {Math.round((meal.food_nutrients.fat_g * meal.grams) / 100)}g
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFoodFromMeal(selectedDay, selectedMealType, index)}
                            className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove from meal"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Meal Summary */}
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-300">
                        <p className="text-sm font-medium text-green-800 mb-1">Meal Summary</p>
                        <div className="text-sm text-green-700">
                          {(() => {
                            const totalCalories = weeklyPlan.meals[selectedDay][selectedMealType].reduce(
                              (sum, meal) => {
                                return (
                                  sum +
                                  (meal.food_nutrients
                                    ? Math.round((meal.food_nutrients.energy_kcal * meal.grams) / 100)
                                    : 0)
                                )
                              },
                              0,
                            )
                            const totalProtein = weeklyPlan.meals[selectedDay][selectedMealType].reduce((sum, meal) => {
                              return (
                                sum +
                                (meal.food_nutrients
                                  ? Math.round((meal.food_nutrients.protein_g * meal.grams) / 100)
                                  : 0)
                              )
                            }, 0)
                            const totalCarbs = weeklyPlan.meals[selectedDay][selectedMealType].reduce((sum, meal) => {
                              return (
                                sum +
                                (meal.food_nutrients
                                  ? Math.round((meal.food_nutrients.carbohydrates_g * meal.grams) / 100)
                                  : 0)
                              )
                            }, 0)
                            const totalFat = weeklyPlan.meals[selectedDay][selectedMealType].reduce((sum, meal) => {
                              return (
                                sum +
                                (meal.food_nutrients ? Math.round((meal.food_nutrients.fat_g * meal.grams) / 100) : 0)
                              )
                            }, 0)

                            return (
                              <div className="grid grid-cols-2 gap-2">
                                <span>Total Calories: {totalCalories} kcal</span>
                                <span>Protein: {totalProtein}g</span>
                                <span>Carbs: {totalCarbs}g</span>
                                <span>Fat: {totalFat}g</span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[200px] text-gray-500">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <p>No meals added yet</p>
                        <p className="text-sm">Search and add foods to this {selectedMealType}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Week completion progress */}
          <div className="w-full my-3">
            <div className="mb-2 flex items-center justify-between gap-4">
              <Typography color="blue-gray" variant="h6">
                Week Completed
              </Typography>
              <Typography color="blue-gray" variant="h6">
                {weekCompletion}%
              </Typography>
            </div>

            <Progress value={weekCompletion} color="green" className="h-2 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Beautiful Save Button at Bottom */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveWeeklyPlan}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center space-x-3">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving Weekly Plan...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Save Weekly Plan</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
          </button>
        </div>
      </div>
    </div>
  )
}
