import { useState, useEffect } from "react"
import { Plus, Search, Save, Trash, Check, X, AlertCircle, Calendar } from "lucide-react"
import { Progress, Typography, Tooltip } from "@material-tailwind/react"

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

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
  ]

  const mealTypes = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
    { key: "snack", label: "Snack" }
  ]

  useEffect(() => {
    loadPatient()
    loadWeeklyPlan()
  }, [patientId, selectedWeekStart])

  function getMonday(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
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
          // Convert from storage format to display format
          const displayPlan = convertToDisplayFormat(data.plan)
          setWeeklyPlan(displayPlan)
        } else {
          // Create empty plan structure
          setWeeklyPlan({
            patient_id: patientId,
            week_start: selectedWeekStart,
            dailyCalories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            meals: getEmptyWeekMeals()
          })
        }
      }
    } catch (error) {
      console.error("Error loading weekly plan:", error)
    }
  }

  const getEmptyWeekMeals = () => {
    const emptyDay = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }
    
    return {
      monday: { ...emptyDay },
      tuesday: { ...emptyDay },
      wednesday: { ...emptyDay },
      thursday: { ...emptyDay },
      friday: { ...emptyDay },
      saturday: { ...emptyDay },
      sunday: { ...emptyDay }
    }
  }

  // Convert from storage format (array) to display format (nested object)
  const convertToDisplayFormat = (plan) => {
    if (!plan || !plan.meals) return null

    const displayFormat = {
      ...plan,
      meals: getEmptyWeekMeals()
    }

    // Convert array format to nested object format for easier UI handling
    plan.meals.forEach(meal => {
      if (displayFormat.meals[meal.day] && displayFormat.meals[meal.day][meal.type]) {
        displayFormat.meals[meal.day][meal.type] = meal.foods.map(food => ({
          food_id: food.food_id,
          grams: food.grams,
          time: meal.time
        }))
      }
    })

    return displayFormat
  }

  // Convert from display format (nested object) to storage format (array)
  const convertToStorageFormat = (displayPlan) => {
    if (!displayPlan || !displayPlan.meals) return []

    const meals = []
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

    // Default times for each meal type
    const defaultTimes = {
      breakfast: "08:00",
      lunch: "13:00",
      dinner: "19:00",
      snack: "16:00"
    }

    days.forEach(day => {
      mealTypes.forEach(type => {
        const dayMeals = displayPlan.meals[day]
        if (dayMeals && dayMeals[type] && dayMeals[type].length > 0) {
          meals.push({
            day: day,
            type: type,
            time: dayMeals[type][0]?.time || defaultTimes[type],
            foods: dayMeals[type].map(food => ({
              food_id: food.food_id,
              grams: parseInt(food.grams) || 100
            }))
          })
        }
      })
    })

    return meals
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

    console.log("Adding food to meal:", food)

    const newMeal = {
      food_id: food._id,
      grams: parseInt(selectedGrams),
      food_name: food.name,
      food_nutrients: food.nutrients
    }

    const updatedPlan = { ...weeklyPlan }
    if (!updatedPlan.meals[selectedDay]) {
      updatedPlan.meals[selectedDay] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      }
    }
    
    updatedPlan.meals[selectedDay][selectedMealType].push(newMeal)
    setWeeklyPlan(updatedPlan)
    
    // Clear search
    setSearchTerm("")
    setSearchResults([])
    setSelectedGrams(100)

    console.log("Updated plan:", updatedPlan)
  }

  const removeFoodFromMeal = (dayKey, mealType, foodIndex) => {
    const updatedPlan = { ...weeklyPlan }
    updatedPlan.meals[dayKey][mealType].splice(foodIndex, 1)
    setWeeklyPlan(updatedPlan)
  }

  const saveWeeklyPlan = async () => {
    if (!weeklyPlan) return

    setLoading(true)
    try {
      // Convert from display format to storage format
      const mealsArray = convertToStorageFormat(weeklyPlan)

      // Prepare data for saving
      const dataToSave = {
        patient_id: patientId,
        week_start: selectedWeekStart,
        dailyCalories: weeklyPlan.dailyCalories || 0,
        protein: weeklyPlan.protein || 0,
        fat: weeklyPlan.fat || 0,
        carbs: weeklyPlan.carbs || 0,
        meals: mealsArray
      }

      console.log("Saving plan data:", dataToSave)

      const method = weeklyPlan._id ? "PUT" : "POST"
      const body = weeklyPlan._id 
        ? { planId: weeklyPlan._id, ...dataToSave }
        : dataToSave

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
        loadWeeklyPlan() // Reload to get the updated data
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
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Activity factor (assuming moderate activity)
    const calories = Math.round(bmr * 1.55)
    
    // Macro distribution (protein: 1.6g/kg, fat: 25% of calories, carbs: remainder)
    const protein = Math.round(weight * 1.6)
    const fat = Math.round((calories * 0.25) / 9) // 9 calories per gram of fat
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4) // 4 calories per gram

    return { calories, protein, carbs, fat }
  }

  const calculateDayCompletion = (dayKey) => {
    if (!weeklyPlan?.meals?.[dayKey]) return 0
    
    const dayMeals = weeklyPlan.meals[dayKey]
    const totalMeals = Object.keys(dayMeals).length
    const completedMeals = Object.values(dayMeals).filter(meals => meals.length > 0).length
    
    return Math.round((completedMeals / totalMeals) * 100)
  }

  const calculateWeekCompletion = () => {
    if (!weeklyPlan?.meals) return 0
    
    const totalDays = daysOfWeek.length
    const completedDays = daysOfWeek.filter(day => calculateDayCompletion(day.key) > 0).length
    
    return Math.round((completedDays / totalDays) * 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
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

        {/* Macronutrients */}
        <div className="mb-6 bg-white/80 shadow-md rounded-xl p-4 border border-gray-200">
          <h4 className="text-lg font-medium text-gray-800 mt-3 text-center">Daily Macronutrients</h4>
          <p className="text-sm font-medium text-gray-800 mb-5 text-center">Insert the daily macronutrients for the patient</p>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Calories</label>
              <input
                type="number"
                value={weeklyPlan?.dailyCalories || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, dailyCalories: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Protein (g)</label>
              <input
                type="number"
                value={weeklyPlan?.protein || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, protein: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={weeklyPlan?.carbs || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, carbs: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fats (g)</label>
              <input
                type="number"
                value={weeklyPlan?.fat || ""}
                onChange={(e) => setWeeklyPlan({ ...weeklyPlan, fat: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Recommended macronutrients guide */}
          <div className="bg-green-200/60 rounded-xl border border-green-400 my-5">
            <h4 className="text-sm font-medium text-green-700 mt-3 mx-3 mb-1">Recommended macronutrients (Based on patient's weight)</h4>
            <div className="grid grid-cols-4 gap-4 text-gray-700 font-semibold">
              <div className="m-3">
                Calories: {recommendedMacros.calories}
              </div>
              <div className="m-3">
                Protein: {recommendedMacros.protein}g
              </div>
              <div className="m-3">
                Carbs: {recommendedMacros.carbs}g
              </div>
              <div className="m-3">
                Fats: {recommendedMacros.fat}g
              </div>
            </div>
            <div className="mx-3 pb-3">
              <button
                onClick={() => {
                  setWeeklyPlan({
                    ...weeklyPlan,
                    dailyCalories: recommendedMacros.calories,
                    protein: recommendedMacros.protein,
                    carbs: recommendedMacros.carbs,
                    fat: recommendedMacros.fat
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
          <p className="text-sm font-medium text-gray-800 mb-5 text-center pb-4 border-b border-gray-300">You can assign a daily menu diet to complete the weekly plan for the patient</p>

          {/* Week selector */}
          <div className="flex justify-center items-center mb-4">
            <h4 className="text-lg font-medium text-gray-800 text-center mr-2">New weekly plan starting date</h4>
            <Tooltip
              placement="bottom"
              className="border border-blue-gray-50 bg-white px-4 py-3 shadow-xl shadow-black/10 text-gray-500"
              content="This is the date when the patient will start their diet"
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

          <div className="flex justify-center mb-4">
            <input
              type="date"
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(getMonday(new Date(e.target.value)))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Calendar display */}
          <div className='flex bg-white shadow-md justify-start md:justify-center rounded-lg overflow-x-auto mx-auto py-4 px-2 md:mx-12'>
            {daysOfWeek.map((day, index) => {
              const date = weekDates[index]
              const isSelected = day.key === selectedDay
              const completion = calculateDayCompletion(day.key)
              
              return (
                <div 
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex group hover:bg-green-500 hover:shadow-lg rounded-lg mx-1 transition-all duration-300 cursor-pointer justify-center w-16 ${
                    isSelected ? 'bg-green-600 shadow-lg' : ''
                  }`}
                >
                  <div className='flex items-center px-4 py-4'>
                    <div className='text-center'>
                      <p className={`text-sm transition-all duration-300 ${
                        isSelected ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-100'
                      }`}>
                        {day.label.slice(0, 3)}
                      </p>
                      <p className={`mt-3 transition-all duration-300 ${
                        isSelected ? 'text-gray-100 font-bold' : 'text-gray-900 group-hover:text-gray-100 group-hover:font-bold'
                      }`}>
                        {date.getDate()}
                      </p>
                      {completion > 0 && (
                        <div className="mt-1">
                          <span className="text-xs bg-white text-green-600 px-1 rounded">
                            {completion}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Day and meal type selectors */}
          <div className="flex flex-col md:flex-row items-stretch gap-3 mt-6">
            <div className="my-5 mx-3 w-full md:w-3/5">
              <div className="flex justify-center items-center mb-2">
                <h4 className="text-lg font-medium text-gray-800 text-center mr-2">Day of the week</h4>
                <Tooltip
                  placement="bottom"
                  className="border border-blue-gray-50 bg-white px-4 py-3 shadow-xl shadow-black/10 text-gray-500"
                  content="Select and configure each patient's day menu"
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
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="block w-full appearance-none bg-white border border-green-500 text-gray-800 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {daysOfWeek.map(day => (
                  <option key={day.key} value={day.key}>{day.label}</option>
                ))}
              </select>
            </div>

            {/* Progress bar */}
            <div className="w-full my-5 mx-3 md:w-2/5">
              <div className="mb-2 flex items-center justify-between gap-4">
                <Typography color="blue-gray" variant="h6">
                  Day completion
                </Typography>
                <Typography color="blue-gray" variant="h6">
                  {dayCompletion}%
                </Typography>
              </div>
              <Progress
                value={dayCompletion}
                color="green"
                className="h-2 bg-gray-200 rounded-full"
              />
            </div>
          </div>

          {/* Meal type selector */}
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-800 text-center mb-3">Select meal type</h4>
            <div className="flex justify-center">
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="block appearance-none bg-white border border-green-500 text-gray-800 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {mealTypes.map(meal => (
                  <option key={meal.key} value={meal.key}>{meal.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Food search and add */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 text-center mb-3">Add meals</h4>
            
            <div className="flex flex-col md:flex-row items-stretch gap-3 border border-gray-200 rounded-xl p-4">
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
                className="w-full md:w-3/4 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <input
                type="number"
                placeholder="Grams"
                value={selectedGrams}
                onChange={(e) => setSelectedGrams(e.target.value)}
                min="1"
                className="w-full md:w-1/6 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                {searchResults.map((food) => (
                  <button
                    key={food._id}
                    onClick={() => addFoodToMeal(food)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{food.name}</p>
                      <p className="text-sm text-gray-500">
                        {food.nutrients.energy_kcal} kcal per 100g | 
                        P: {food.nutrients.protein_g}g | 
                        C: {food.nutrients.carbohydrates_g}g | 
                        F: {food.nutrients.fat_g}g
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-green-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current meal items */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {mealTypes.find(m => m.key === selectedMealType)?.label} for {daysOfWeek.find(d => d.key === selectedDay)?.label}
            </h4>
            
            {weeklyPlan?.meals?.[selectedDay]?.[selectedMealType]?.length > 0 ? (
              <div className="space-y-2">
                {weeklyPlan.meals[selectedDay][selectedMealType].map((meal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{meal.food_name}</p>
                      <p className="text-sm text-gray-500">
                        {meal.grams}g | 
                        {meal.food_nutrients ? Math.round((meal.food_nutrients.energy_kcal * meal.grams) / 100) : 0} kcal
                      </p>
                    </div>
                    <button
                      onClick={() => removeFoodFromMeal(selectedDay, selectedMealType, index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No meals added yet for this {selectedMealType}</p>
            )}
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
            <Progress
              value={weekCompletion}
              color="green"
              className="h-2 bg-gray-200 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}