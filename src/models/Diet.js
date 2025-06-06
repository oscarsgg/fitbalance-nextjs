import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export class Diet {
  constructor(data) {
    this.patient_id = data.patient_id
    this.nutritionist_id = data.nutritionist_id
    this.daily_calories = data.daily_calories
    this.macros = {
      protein: data.macros?.protein || 0,
      carbs: data.macros?.carbs || 0,
      fats: data.macros?.fats || 0
    }
    this.meals = data.meals || []
    this.disliked_foods = data.disliked_foods || []
    this.allergies = data.allergies || []
    this.notes = data.notes || ""
    this.start_date = data.start_date || new Date().toISOString()
    this.end_date = data.end_date || null
    this.is_active = data.is_active !== undefined ? data.is_active : true
    this.created_at = data.created_at || new Date().toISOString()
    this.updated_at = data.updated_at || new Date().toISOString()
  }

  static async create(dietData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const diet = new Diet(dietData)
      const result = await db.collection("Diets").insertOne(diet)

      return {
        _id: result.insertedId,
        ...diet
      }
    } catch (error) {
      throw error
    }
  }

  static async findByPatient(patientId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const diet = await db.collection("Diets").findOne({
        patient_id: new ObjectId(patientId),
        is_active: true
      })

      return diet
    } catch (error) {
      throw error
    }
  }

  static async update(dietId, updateData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const result = await db.collection("Diets").updateOne(
        { _id: new ObjectId(dietId) },
        {
          $set: {
            ...updateData,
            updated_at: new Date().toISOString()
          }
        }
      )

      return result.modifiedCount > 0
    } catch (error) {
      throw error
    }
  }
}