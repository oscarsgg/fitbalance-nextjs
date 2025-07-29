import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Food } from "./Food"

const DEBUG = process.env.DEBUG_LOGS === "false"

export class DailyMealLogs {
  static async create(logData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("DailyMealLogs")

      // Procesar meals para cumplir con el esquema
      const processedMeals = logData.meals.map((meal) => ({
        type: meal.type,
        foods: meal.foods.map((food) => ({
          food_id: typeof food.food_id === "string" ? new ObjectId(food.food_id) : food.food_id,
          grams: Number.parseInt(food.grams) || 100,
        })),
      }))

      const processedData = {
        patient_id: typeof logData.patient_id === "string" ? new ObjectId(logData.patient_id) : logData.patient_id,
        date: new Date(logData.date),
        caloriesConsumed: Number(logData.caloriesConsumed) || 0,
        proteinConsumed: Number(logData.proteinConsumed) || 0,
        fatConsumed: Number(logData.fatConsumed) || 0,
        carbsConsumed: Number(logData.carbsConsumed) || 0,
        meals: processedMeals,
        created_at: new Date(),
        updated_at: new Date(),
      }

      if (DEBUG) {
        console.log("Creating daily meal log with processed data:", JSON.stringify(processedData, null, 2))
      }

      const result = await collection.insertOne(processedData)
      return {
        ...processedData,
        _id: result.insertedId.toString(),
        patient_id: processedData.patient_id.toString(),
      }
    } catch (error) {
      console.error("Error creating daily meal log:", error)
      throw error
    }
  }

  static async findByPatientAndDate(patientId, date) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      if (DEBUG) {
        console.log("Searching for log with patient_id:", patientId, "date:", date)
      }

      const log = await db.collection("DailyMealLogs").findOne({
        patient_id: new ObjectId(patientId),
        date: new Date(date),
      })

      if (!log) {
        if (DEBUG) {
          console.log("No log found")
        }
        return null
      }

      // Enriquecer con detalles de alimentos si hay meals
      if (log.meals && Array.isArray(log.meals)) {
        if (DEBUG) {
          console.log("Enriching meals with food details...")
        }
        log.meals = await this.enrichMealsWithFoodDetails(log.meals)
      }

      return {
        ...log,
        _id: log._id.toString(),
        patient_id: log.patient_id.toString(),
      }
    } catch (error) {
      console.error("Error finding daily meal log:", error)
      throw error
    }
  }

  static async findByPatientAndDateRange(patientId, startDate, endDate) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const logs = await db
        .collection("DailyMealLogs")
        .find({
          patient_id: new ObjectId(patientId),
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        })
        .sort({ date: 1 })
        .toArray()

      return logs.map((log) => ({
        ...log,
        _id: log._id.toString(),
        patient_id: log.patient_id.toString(),
      }))
    } catch (error) {
      console.error("Error finding daily meal logs by date range:", error)
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
          console.log(`Processing meal ${mealIndex}:`, meal.type)
        }
        if (meal.foods && Array.isArray(meal.foods)) {
          meal.foods.forEach((food, foodIndex) => {
            if (DEBUG) {
              console.log(`  Food ${foodIndex}:`, food.food_id)
            }
            if (food.food_id) {
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
          console.log(`Enriching meal ${mealIndex}:`, meal.type)
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
                food_id: foodIdStr,
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

  static async update(logId, updateData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("DailyMealLogs")

      if (!ObjectId.isValid(logId)) {
        throw new Error("Invalid log ID format")
      }

      if (DEBUG) {
        console.log("Update data received:", JSON.stringify(updateData, null, 2))
      }

      // Procesar meals para cumplir con el esquema si están presentes
      let processedMeals = null
      if (updateData.meals && Array.isArray(updateData.meals)) {
        processedMeals = updateData.meals.map((meal) => ({
          type: meal.type,
          foods: meal.foods.map((food) => ({
            food_id: typeof food.food_id === "string" ? new ObjectId(food.food_id) : food.food_id,
            grams: Number.parseInt(food.grams) || 100,
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
      if (updateData.date) {
        processedData.date = new Date(updateData.date)
      }
      if (updateData.caloriesConsumed !== undefined) {
        processedData.caloriesConsumed = Number(updateData.caloriesConsumed)
      }
      if (updateData.proteinConsumed !== undefined) {
        processedData.proteinConsumed = Number(updateData.proteinConsumed)
      }
      if (updateData.fatConsumed !== undefined) {
        processedData.fatConsumed = Number(updateData.fatConsumed)
      }
      if (updateData.carbsConsumed !== undefined) {
        processedData.carbsConsumed = Number(updateData.carbsConsumed)
      }
      if (processedMeals) {
        processedData.meals = processedMeals
      }

      if (DEBUG) {
        console.log("Processed data for update:", JSON.stringify(processedData, null, 2))
      }

      const result = await collection.updateOne({ _id: new ObjectId(logId) }, { $set: processedData })
      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating daily meal log:", error)
      throw error
    }
  }

  static async delete(logId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("DailyMealLogs")

      if (!ObjectId.isValid(logId)) {
        throw new Error("Invalid log ID format")
      }

      const result = await collection.deleteOne({ _id: new ObjectId(logId) })
      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting daily meal log:", error)
      throw error
    }
  }
}
