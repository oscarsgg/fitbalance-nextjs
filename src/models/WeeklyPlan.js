import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Food } from "./Food"

const DEBUG = process.env.DEBUG_LOGS === "false"

export class WeeklyPlan {
  static async create(planData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("WeeklyPlan")

      // Procesar meals para cumplir con el esquema
      const processedMeals = planData.meals.map((meal) => ({
        day: meal.day,
        type: meal.type,
        time: meal.time || "00:00",
        foods: meal.foods.map((food) => ({
          food_id: typeof food.food_id === "string" ? new ObjectId(food.food_id) : food.food_id,
          grams: Number.parseInt(food.grams) || 100, // Asegurar que sea int
        })),
      }))

      const processedData = {
        patient_id: typeof planData.patient_id === "string" ? new ObjectId(planData.patient_id) : planData.patient_id,
        week_start: new Date(planData.week_start),
        dailyCalories: Number(planData.dailyCalories) || 0,
        protein: Number(planData.protein) || 0,
        fat: Number(planData.fat) || 0,
        carbs: Number(planData.carbs) || 0,
        meals: processedMeals,
        created_at: new Date(),
        updated_at: new Date(),
      }

      if (DEBUG) {
        console.log(
          "Creating weekly plan with processed data:",
          JSON.stringify(processedData, null, 2),
        )
      }

      const result = await collection.insertOne(processedData)

      return {
        ...processedData,
        _id: result.insertedId.toString(),
        patient_id: processedData.patient_id.toString(),
      }
    } catch (error) {
      console.error("Error creating weekly plan:", error)
      throw error
    }
  }

  static async findByPatientAndWeek(patientId, weekStart) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      if (DEBUG) {
        console.log(
          "Searching for plan with patient_id:",
          patientId,
          "week_start:",
          weekStart,
        )
      }

      const plan = await db.collection("WeeklyPlan").findOne({
        patient_id: new ObjectId(patientId),
        week_start: new Date(weekStart),
      })

      if (!plan) {
        if (DEBUG) {
          console.log("No plan found")
        }
        return null
      }

      if (DEBUG) {
        console.log("Found plan with meals:", plan.meals?.length || 0)
      }

      // Enriquecer con detalles de alimentos si hay meals
      if (plan.meals && Array.isArray(plan.meals)) {
         if (DEBUG) {
          console.log("Enriching meals with food details...")
        }
        plan.meals = await this.enrichMealsWithFoodDetails(plan.meals)
        if (DEBUG) {
          console.log("Meals enriched successfully")
        }
      }

      return {
        ...plan,
        _id: plan._id.toString(),
        patient_id: plan.patient_id.toString(),
      }
    } catch (error) {
      console.error("Error finding weekly plan:", error)
      throw error
    }
  }

  static async enrichMealsWithFoodDetails(meals) {
    try {
      if (DEBUG) {
        console.log("Starting meal enrichment for", meals.length, "meals")
      }

      const allFoodIds = new Set()

      // Recopilar todos los food_ids únicos
      meals.forEach((meal, mealIndex) => {
         if (DEBUG) {
          console.log(`Processing meal ${mealIndex}:`, meal.day, meal.type)
        }
        if (meal.foods && Array.isArray(meal.foods)) {
          meal.foods.forEach((food, foodIndex) => {
            if (DEBUG) {
              console.log(`  Food ${foodIndex}:`, food.food_id)
            }
            if (food.food_id) {
              // Manejar tanto ObjectId como string
              const foodIdStr = food.food_id instanceof ObjectId ? food.food_id.toString() : food.food_id.toString()
              allFoodIds.add(foodIdStr)
            }
          })
        }
      })

       if (DEBUG) {
        console.log("Unique food IDs to fetch:", Array.from(allFoodIds))
      }


      if (allFoodIds.size === 0) {
        if (DEBUG) {
          console.log("No food IDs found, returning original meals")
        }
        return meals
      }

      // Obtener detalles de todos los alimentos
      const foodDetails = await Food.findByIds(Array.from(allFoodIds))
       if (DEBUG) {
        console.log("Food details fetched:", foodDetails.length)
      }

      // Crear mapa para búsqueda rápida
      const foodMap = new Map()
      foodDetails.forEach((food) => {
        foodMap.set(food._id.toString(), food)
        if (DEBUG) {
          console.log(`Mapped food: ${food._id} -> ${food.name}`)
        }
      })

      // Enriquecer las comidas con detalles
      const enrichedMeals = meals.map((meal, mealIndex) => {
        if (DEBUG) {
          console.log(`Enriching meal ${mealIndex}:`, meal.day, meal.type)
        }

        const enrichedFoods = meal.foods
          ? meal.foods.map((food, foodIndex) => {
              const foodIdStr = food.food_id instanceof ObjectId ? food.food_id.toString() : food.food_id.toString()
              const details = foodMap.get(foodIdStr)

              if (DEBUG) {
                console.log(`  Food ${foodIndex}: ${foodIdStr} -> ${details ? details.name : "NOT FOUND"}`)
              }

              return {
                ...food,
                food_id: foodIdStr, // Asegurar que sea string para el frontend
                food_name: details?.name || "Unknown Food",
                food_nutrients: details?.nutrients || null,
                food_details: details || null,
              }
            })
          : []

        return {
          ...meal,
          foods: enrichedFoods,
        }
      })

       if (DEBUG) {
        console.log("Meal enrichment completed successfully")
      }
      return enrichedMeals
    } catch (error) {
      console.error("Error enriching meals with food details:", error)
      // En caso de error, retornar meals originales pero con nombres por defecto
      return meals.map((meal) => ({
        ...meal,
        foods: meal.foods
          ? meal.foods.map((food) => ({
              ...food,
              food_id: food.food_id instanceof ObjectId ? food.food_id.toString() : food.food_id.toString(),
              food_name: "Unknown Food",
              food_nutrients: null,
            }))
          : [],
      }))
    }
  }

  static async update(planId, updateData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("WeeklyPlan")

      if (!ObjectId.isValid(planId)) {
        throw new Error("Invalid plan ID format")
      }

      if (DEBUG) {
        console.log("Update data received:", JSON.stringify(updateData, null, 2))
      }

      // Procesar meals para cumplir con el esquema si están presentes
      let processedMeals = null
      if (updateData.meals && Array.isArray(updateData.meals)) {
        processedMeals = updateData.meals.map((meal) => ({
          day: meal.day,
          type: meal.type,
          time: meal.time || "00:00",
          foods: meal.foods.map((food) => ({
            food_id: typeof food.food_id === "string" ? new ObjectId(food.food_id) : food.food_id,
            grams: Number.parseInt(food.grams) || 100, // Asegurar que sea int
          })),
        }))
      }

      const processedData = {
        updated_at: new Date(),
      }

      // Solo incluir campos que están presentes en updateData
      if (updateData.patient_id) {
        processedData.patient_id =
          typeof updateData.patient_id === "string" ? new ObjectId(updateData.patient_id) : updateData.patient_id
      }

      if (updateData.week_start) {
        processedData.week_start = new Date(updateData.week_start)
      }

      if (updateData.dailyCalories !== undefined) {
        processedData.dailyCalories = Number(updateData.dailyCalories)
      }

      if (updateData.protein !== undefined) {
        processedData.protein = Number(updateData.protein)
      }

      if (updateData.fat !== undefined) {
        processedData.fat = Number(updateData.fat)
      }

      if (updateData.carbs !== undefined) {
        processedData.carbs = Number(updateData.carbs)
      }

      if (processedMeals) {
        processedData.meals = processedMeals
      }

       if (DEBUG) {
        console.log(
          "Processed data for update:",
          JSON.stringify(processedData, null, 2),
        )
      }

      const result = await collection.updateOne({ _id: new ObjectId(planId) }, { $set: processedData })

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating weekly plan:", error)
      console.error("Error details:", error.errInfo || error.message)
      throw error
    }
  }

  static async delete(planId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("WeeklyPlan")

      if (!ObjectId.isValid(planId)) {
        throw new Error("Invalid plan ID format")
      }

      const result = await collection.deleteOne({ _id: new ObjectId(planId) })

      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting weekly plan:", error)
      throw error
    }
  }

  static async findLatestByPatient(patientId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("WeeklyPlan")

      if (!ObjectId.isValid(patientId)) {
        throw new Error("Invalid patient ID format")
      }

      const plan = await collection.findOne({ patient_id: new ObjectId(patientId) }, { sort: { week_start: -1 } })

      if (!plan) {
        return null
      }

      if (plan.meals) {
        plan.meals = await this.enrichMealsWithFoodDetails(plan.meals)
      }

      return {
        ...plan,
        _id: plan._id.toString(),
        patient_id: plan.patient_id.toString(),
      }
    } catch (error) {
      console.error("Error finding latest weekly plan:", error)
      throw error
    }
  }
}

// Export helper function separately
export async function enrichMealsWithFoodDetails(meals) {
  return WeeklyPlan.enrichMealsWithFoodDetails(meals)
}
