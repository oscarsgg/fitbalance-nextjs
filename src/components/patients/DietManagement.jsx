import { useState, useEffect } from "react"
import { Plus, Search, Save, Trash } from "lucide-react"

export default function DietManagement({ patientId }) {
  const [diet, setDiet] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDiet()
  }, [patientId])

  const loadDiet = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/diet`)
      if (response.ok) {
        const data = await response.json()
        setDiet(data.diet)
      }
    } catch (error) {
      console.error("Error loading diet:", error)
    }
  }

  const searchFood = async () => {
  if (!searchTerm.trim()) return

  setLoading(true)
    try {
        const response = await fetch(`/api/fatsecret?method=foods.search&q=${encodeURIComponent(searchTerm)}`)
        if (response.ok) {
        const data = await response.json()
        const foods = data?.foods?.food

        if (Array.isArray(foods)) {
            setSearchResults(foods)
        } else if (typeof foods === "object") {
            // Cuando FatSecret regresa un solo objeto, no array
            setSearchResults([foods])
        } else {
            setSearchResults([])
        }
        } else {
        console.error("Error en la respuesta:", response.status)
        setSearchResults([])
        }
    } catch (error) {
        console.error("Error searching food:", error)
        setSearchResults([])
    } finally {
        setLoading(false)
    }
    }

  const saveDiet = async (dietData) => {
    try {
      const method = diet ? "PUT" : "POST"
      const url = `/api/patients/${patientId}/diet${diet ? `/${diet._id}` : ""}`
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dietData),
      })

      if (response.ok) {
        loadDiet()
      }
    } catch (error) {
      console.error("Error saving diet:", error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Diet Management</h3>
        <button
          onClick={() => saveDiet(diet)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Macronutrients */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Macronutrients</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Calories</label>
            <input
              type="number"
              value={diet?.daily_calories || ""}
              onChange={(e) => setDiet({ ...diet, daily_calories: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Protein (g)</label>
            <input
              type="number"
              value={diet?.macros?.protein || ""}
              onChange={(e) => setDiet({
                ...diet,
                macros: { ...diet?.macros, protein: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Carbs (g)</label>
            <input
              type="number"
              value={diet?.macros?.carbs || ""}
              onChange={(e) => setDiet({
                ...diet,
                macros: { ...diet?.macros, carbs: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fats (g)</label>
            <input
              type="number"
              value={diet?.macros?.fats || ""}
              onChange={(e) => setDiet({
                ...diet,
                macros: { ...diet?.macros, fats: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Food Search */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Search Foods</h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for foods..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={searchFood}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {searchResults.map((food, index) => (
              <div
                key={index}
                className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">{food.food_name}</p>
                  <p className="text-sm text-gray-500">{food.food_description}</p>
                </div>
                <button
                  onClick={() => {
                    setDiet({
                      ...diet,
                      meals: [...(diet?.meals || []), food]
                    })
                    setSearchResults([])
                    setSearchTerm("")
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Foods */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Meal Plan</h4>
        {diet?.meals?.length > 0 ? (
          <div className="space-y-2">
            {diet.meals.map((meal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{meal.food_name}</p>
                  <p className="text-sm text-gray-500">{meal.food_description}</p>
                </div>
                <button
                  onClick={() => {
                    const newMeals = diet.meals.filter((_, i) => i !== index)
                    setDiet({ ...diet, meals: newMeals })
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No meals added yet</p>
        )}
      </div>
    </div>
  )
}