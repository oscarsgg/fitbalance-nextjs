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

      if (typeof planData.patient_id === "string") {
        planData.patient_id = new ObjectId(planData.patient_id)
      }

      if (typeof planData.week_start === "string") {
        planData.week_start = new Date(planData.week_start)
      }

      const processedData = {
        patient_id: planData.patient_id,
        week_start: planData.week_start,
        dailyCalories: Number(planData.dailyCalories) || 0,
        protein: Number(planData.protein) || 0,
        fat: Number(planData.fat) || 0,
        carbs: Number(planData.carbs) || 0,
        meals: planData.meals.map(meal => ({
          day: meal.day,
          type: meal.type,
          time: meal.time || "00:00",
          foods: meal.foods
            .filter(food => !!food.food_id)
            .map(food => ({
              food_id: food.food_id,
              grams: parseInt(food.grams) || 100
            }))
        })),
        created_at: new Date(),
        updated_at: new Date()
      }

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

      const processedData = {
        dailyCalories: Number(updateData.dailyCalories) || 0,
        protein: Number(updateData.protein) || 0,
        fat: Number(updateData.fat) || 0,
        carbs: Number(updateData.carbs) || 0,
        meals: updateData.meals.map(meal => ({
          day: meal.day,
          type: meal.type,
          time: meal.time || "00:00",
          foods: meal.foods
            .filter(food => !!food.food_id)
            .map(food => ({
              food_id: food.food_id,
              grams: parseInt(food.grams) || 100
            }))
        })),
        updated_at: new Date()
      }

      if (updateData.week_start) {
        processedData.week_start = new Date(updateData.week_start)
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

  static convertToDisplayFormat(plan) {
    if (!plan || !plan.meals || !Array.isArray(plan.meals)) return null

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

    plan.meals.forEach(meal => {
      if (
        displayFormat.meals[meal.day] &&
        displayFormat.meals[meal.day][meal.type]
      ) {
        displayFormat.meals[meal.day][meal.type] = meal.foods.map(food => ({
          food_id: food.food_id,
          grams: food.grams,
          time: meal.time
        }))
      }
    })

    return displayFormat
  }

  static convertToStorageFormat(displayPlan) {
    if (!displayPlan || !displayPlan.meals) return []

    const meals = []
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

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

export async function enrichMealsWithFoodDetails(meals) {
  const client = await clientPromise
  const db = client.db("fitbalance")

  const foodIds = [
    ...new Set(
      meals.flatMap(meal =>
        meal.foods.map(f => f.food_id)
      )
    )
  ]

  const objectIds = foodIds.map(id => /^[a-fA-F0-9]{24}$/.test(id) ? new ObjectId(id) : id)

  const foodsData = await db.collection("Food")
    .find({ _id: { $in: objectIds } })
    .toArray()

  const foodMap = {}
  foodsData.forEach(food => {
    foodMap[food._id.toString()] = food
  })

  const enriched = meals.map(meal => ({
    ...meal,
    foods: meal.foods.map(food => {
      const data = foodMap[food.food_id.toString()]
      return {
        food_id: food.food_id,
        food_name: data?.name || "Unknown Food",
        grams: food.grams,
        food_nutrients: data?.nutrients || null
      }
    })
  }))

  return enriched
}