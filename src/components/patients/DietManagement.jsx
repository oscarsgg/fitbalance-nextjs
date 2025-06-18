import { useState, useEffect } from "react"
import { Plus, Search, Save, Trash } from "lucide-react"
import { Select, Option, Progress, Typography, Tooltip } from "@material-tailwind/react";


export default function DietManagement({ patientId }) {
  const [diet, setDiet] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState("react");

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
    <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200 p-6">
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
      <div className="mb-6 bg-white/80 shadow-md rounded-xl p-4 border border-gray-200">
        <h4 className="text-lg font-medium text-gray-800 mt-3 text-center">Daily Macronutrients</h4>
        <p className="text-sm font-medium text-gray-800 mb-5 text-center">Insert the daily macronutrients for the patient</p>

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
        {/* recomended macronutrients guide */}
        <div className="bg-green-200/60 rounded-xl border border-green-400 my-5">
          <h4 className="text-sm font-medium text-green-700 mt-3 mx-3 mb-1">Recomended macronutrients (Based on patients weight)</h4>
          <div className="grid grid-cols-4 gap-4 text-gray-700 font-semibold">
            <div className="m-3">
              Calories: 2000
            </div>
            <div className="m-3">
              Protein (g): 100g
            </div>
            <div className="m-3">
              Carbs (g): 121g
            </div>
            <div className="m-3">
              Fats (g): 30g
            </div>
          </div>
        </div>
      </div>

      {/* Second div -> weekly plan asignment */}
      <div className=" bg-white/80 shadow-md rounded-xl p-4 border border-gray-200">
        <h4 className="text-lg font-medium text-gray-800 mt-3 text-center">Weekly plan</h4>
        <p className="text-sm font-medium text-gray-800 mb-5 text-center pb-4 border-b border-gray-300">You can asign a daily menu diet to complete the weekly plan to the patient</p>

        {/* Cool calendar display */}
        <div className="flex justify-center ">
          <h4 className="text-lg font-medium text-gray-800 text-center">New weekly plan starting date</h4>
          <Tooltip
            placement="bottom"
            className="border border-blue-gray-50 bg-white ml-2 px-4 py-3 shadow-xl shadow-black/10 text-gray-500"
            content="This is the date when the patient will start his diet"
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0, y: 25 },
            }}
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
        <div className='flex bg-white shadow-md justify-start md:justify-center rounded-lg overflow-x-auto mx-auto py-4 px-2  md:mx-12'>

          <div className='flex group hover:bg-green-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Sun </p>
                <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 11 </p>
              </div>
            </div>
          </div>

          <div className='flex group hover:bg-green-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Mon </p>
                <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 12 </p>
              </div>
            </div>
          </div>

          <div className='flex group hover:bg-green-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Tue </p>
                <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 13</p>
              </div>
            </div>
          </div>

          <div className='flex group bg-green-600 shadow-lg dark-shadow rounded-lg mx-1 cursor-pointer justify-center relative  w-16'>
            <span className="flex h-3 w-3 absolute -top-1 -right-1">
              <span className="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full bg-green-400 "></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-100"></span>
            </span>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-100 text-sm'> Wed </p>
                <p className='text-gray-100  mt-3 font-bold'> 14 </p>
              </div>
            </div>
          </div>

          <div className='flex group hover:bg-green-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300 cursor-pointer justify-center w-16'>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Thu </p>
                <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 15 </p>
              </div>
            </div>
          </div>

          <div className='flex group hover:bg-green-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Fri </p>
                <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 16 </p>
              </div>
            </div>
          </div>

          <div className='flex group hover:bg-green-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
            <div className='flex items-center px-4 py-4'>
              <div className='text-center'>
                <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Sat </p>
                <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 17 </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600 text-center mb-4 pb-4 border-b border-gray-300">
              Select the start date of the week for the diet plan.
        </div>

        {/* Flex w 2 elements for day of the week selector, and prgress bar */}
        <div className="flex justify-center ">
              <h4 className="text-lg font-medium text-gray-800 text-center">Day of the week</h4>
              <Tooltip
                placement="bottom"
                className="border border-blue-gray-50 bg-white ml-2 px-4 py-3 shadow-xl shadow-black/10 text-gray-500"
                content="Select and configure each patients day menu"
                animate={{
                  mount: { scale: 1, y: 0 },
                  unmount: { scale: 0, y: 25 },
                }}
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
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          
          {/* Cool day of the week selector combobox, with border green and white bg */}
          <div className="my-5 mx-3 w-full md:w-3/5">            
            <div className="relative">
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="block w-full appearance-none bg-white border border-green-500 text-gray-800 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full my-5 mx-3 md:w-2/5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <Typography color="blue-gray" variant="h6">
                Day completition
              </Typography>
              <Typography color="blue-gray" variant="h6">
                50%
              </Typography>
            </div>
            <Progress
              value={50}
              color="green"
              className="h-2 bg-gray-200 rounded-full"
              barProps={{
                className: "bg-green-500"
              }}
            />
          </div>

        </div>


        {/* Food selector */}
        <div >
          <h4 className="text-lg font-medium text-gray-800 text-center">Add meals</h4>

          <h2 className="mb-2">Breakfast</h2>
          <div className="flex flex-col md:flex-row items-stretch gap-3 border-gray-200 rounded-xl">
            
            {/* Select tipo de comida */}
            {/* <select
            className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select> */}

            {/* Nombre del alimento */}
            <input
              type="text"
              placeholder="Food name"
              className="w-full md:w-3/4 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Gramos */}
            <input
              type="number"
              placeholder="Grams"
              className="w-full md:w-1/6 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Botón + */}
            <button
              className="p-2 text-green-600 hover:bg-green-50 border border-green-200 rounded-full transition"
              title="Add food"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>    

        {/* Selected Foods */}
        {/* <div>
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
        </div> */}

        {/* Final progress bar */}
        <div className="w-full my-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <Typography color="blue-gray" variant="h6">
              Completed
            </Typography>
            <Typography color="blue-gray" variant="h6">
              50%
            </Typography>
          </div>
          <Progress
            value={50}
            color="green"
            className="h-2 bg-gray-200 rounded-full"
            barProps={{
              className: "bg-green-500"
            }}
          />
        </div>
      </div>
    </div>
  )
}