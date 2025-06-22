import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export class WeeklyPlan {
  constructor(data) {
    this.patient_id = data.patient_id
    this.week_start = data.week_start
    this.dailyCalories = data.dailyCalories || 0
    this.protein = data.protein || 0
    this.fat = data.fat || 0
    this.carbs = data.carbs || 0
    this.meals = data.meals || []
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }

  static async create(planData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Convert patient_id to ObjectId if it's a string
      if (typeof planData.patient_id === "string") {
        planData.patient_id = new ObjectId(planData.patient_id)
      }

      // Convert week_start to Date if it's a string
      if (typeof planData.week_start === "string") {
        planData.week_start = new Date(planData.week_start)
      }

      // Ensure all required fields are present with proper types
      const processedData = {
        patient_id: planData.patient_id,
        week_start: planData.week_start,
        dailyCalories: Number(planData.dailyCalories) || 0,
        protein: Number(planData.protein) || 0,
        fat: Number(planData.fat) || 0,
        carbs: Number(planData.carbs) || 0,
        meals: planData.meals || [],
        created_at: new Date(),
        updated_at: new Date()
      }

      // Process meals array - ensure proper format
      processedData.meals = processedData.meals.map(meal => ({
        day: meal.day,
        type: meal.type,
        time: meal.time || "00:00",
        foods: meal.foods.map(food => ({
          food_id: food.food_id, // Keep as string per new schema
          grams: parseInt(food.grams) || 100
        }))
      }))

      console.log("Processed data for MongoDB:", JSON.stringify(processedData, null, 2))

      const result = await db.collection("WeeklyPlan").insertOne(processedData)

      return {
        _id: result.insertedId,
        ...processedData
      }
    } catch (error) {
      console.error("WeeklyPlan.create error:", error)
      throw error
    }
  }

  static async findByPatientAndWeek(patientId, weekStart) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const plan = await db.collection("WeeklyPlan").findOne({
        patient_id: new ObjectId(patientId),
        week_start: new Date(weekStart)
      })

      return plan
    } catch (error) {
      throw error
    }
  }

  static async update(planId, updateData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Process the update data similar to create
      const processedData = {
        dailyCalories: Number(updateData.dailyCalories) || 0,
        protein: Number(updateData.protein) || 0,
        fat: Number(updateData.fat) || 0,
        carbs: Number(updateData.carbs) || 0,
        meals: updateData.meals || [],
        updated_at: new Date()
      }

      // Convert week_start to Date if provided
      if (updateData.week_start) {
        processedData.week_start = new Date(updateData.week_start)
      }

      // Process meals array
      if (updateData.meals) {
        processedData.meals = updateData.meals.map(meal => ({
          day: meal.day,
          type: meal.type,
          time: meal.time || "00:00",
          foods: meal.foods.map(food => ({
            food_id: food.food_id, // Keep as string
            grams: parseInt(food.grams) || 100
          }))
        }))
      }

      const result = await db.collection("WeeklyPlan").updateOne(
        { _id: new ObjectId(planId) },
        { $set: processedData }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("WeeklyPlan.update error:", error)
      throw error
    }
  }

  static async findLatestByPatient(patientId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const plan = await db.collection("WeeklyPlan")
        .findOne(
          { patient_id: new ObjectId(patientId) },
          { sort: { week_start: -1 } }
        )

      return plan
    } catch (error) {
      throw error
    }
  }

  // Helper method to convert from old format to new format for display
  static convertToDisplayFormat(plan) {
    if (!plan || !plan.meals) return null

    const displayFormat = {
      ...plan,
      meals: {
        monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        sunday: { breakfast: [], lunch: [], dinner: [], snack: [] }
      }
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

  // Helper method to convert from display format to storage format
  static convertToStorageFormat(displayPlan) {
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
}