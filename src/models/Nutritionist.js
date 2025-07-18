import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export class Nutritionist {
  constructor(data) {
    this.name = data.name
    this.lastName = data.lastName
    this.secondLastName = data.secondLastName || null
    this.email = data.email
    this.password = data.password
    this.city = data.city
    this.street = data.street
    this.neighborhood = data.neighborhood
    this.streetNumber = data.streetNumber
    this.licenseNumber = data.licenseNumber || null
    this.specialization = data.specialization || null
    this.createdAt = data.createdAt || new Date()
    this.isActive = data.isActive !== undefined ? data.isActive : true
    this.lastLogin = data.lastLogin || null
    this.updatedAt = data.updatedAt || null
  }

  // Create new nutritionist
  static async create(nutritionistData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Check if nutritionist already exists
      const existingNutritionist = await db.collection("Nutritionist").findOne({ email: nutritionistData.email })
      if (existingNutritionist) {
        throw new Error("Nutritionist already exists with this email")
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(nutritionistData.password, saltRounds)

      const nutritionist = new Nutritionist({
        ...nutritionistData,
        password: hashedPassword,
      })

      const result = await db.collection("Nutritionist").insertOne(nutritionist)

      // Return nutritionist without password
      const { password, ...nutritionistWithoutPassword } = nutritionist
      return {
        _id: result.insertedId,
        ...nutritionistWithoutPassword,
      }
    } catch (error) {
      throw error
    }
  }

  // Find nutritionist by email
  static async findByEmail(email) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const nutritionist = await db.collection("Nutritionist").findOne({ email })
      return nutritionist
    } catch (error) {
      throw error
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Find nutritionist by ID
  static async findById(id) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const nutritionist = await db.collection("Nutritionist").findOne({ _id: new ObjectId(id) })
      if (nutritionist) {
        const { password, ...nutritionistWithoutPassword } = nutritionist
        return nutritionistWithoutPassword
      }
      return null
    } catch (error) {
      throw error
    }
  }

  // Update last login
  static async updateLastLogin(id) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      await db.collection("Nutritionist").updateOne({ _id: new ObjectId(id) }, { $set: { lastLogin: new Date() } })
    } catch (error) {
      throw error
    }
  }

  // Update nutritionist profile
  static async updateProfile(id, updateData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Remove sensitive fields that shouldn't be updated this way
      const { password, email, _id, ...safeUpdateData } = updateData

      const result = await db
        .collection("Nutritionist")
        .updateOne({ _id: new ObjectId(id) }, { $set: { ...safeUpdateData, updatedAt: new Date() } })

      return result.modifiedCount > 0
    } catch (error) {
      throw error
    }
  }
}