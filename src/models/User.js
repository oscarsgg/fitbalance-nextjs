import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export class User {
  constructor(data) {
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.role = data.role || "nutritionist"
    this.createdAt = data.createdAt || new Date()
    this.isActive = data.isActive !== undefined ? data.isActive : true
  }

  // Create new user
  static async create(userData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ email: userData.email })
      if (existingUser) {
        throw new Error("User already exists with this email")
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

      const user = new User({
        ...userData,
        password: hashedPassword,
      })

      const result = await db.collection("users").insertOne(user)

      // Return user without password
      const { password, ...userWithoutPassword } = user
      return {
        _id: result.insertedId,
        ...userWithoutPassword,
      }
    } catch (error) {
      throw error
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const user = await db.collection("users").findOne({ email })
      return user
    } catch (error) {
      throw error
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Find user by ID
  static async findById(id) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const user = await db.collection("users").findOne({ _id: new ObjectId(id) })
      if (user) {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      }
      return null
    } catch (error) {
      throw error
    }
  }
}
