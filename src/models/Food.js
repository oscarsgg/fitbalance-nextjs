import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export class Food {
  static async search(query, limit = 20) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("Food")

      const searchFilter = {
        $or: [{ name: { $regex: query, $options: "i" } }, { category: { $regex: query, $options: "i" } }],
      }

      console.log("Searching foods with filter:", JSON.stringify(searchFilter))

      const foods = await collection.find(searchFilter).limit(limit).toArray()

      console.log(`Found ${foods.length} foods`)

      return foods.map((food) => ({
        ...food,
        _id: food._id.toString(),
      }))
    } catch (error) {
      console.error("Error searching foods:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("Food")

      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid ObjectId format")
      }

      const food = await collection.findOne({ _id: new ObjectId(id) })

      if (!food) {
        return null
      }

      return {
        ...food,
        _id: food._id.toString(),
      }
    } catch (error) {
      console.error("Error finding food by ID:", error)
      throw error
    }
  }

  static async findByIds(ids) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("Food")

      console.log("Finding foods by IDs:", ids)

      const objectIds = ids
        .map((id) => {
          // Si ya es ObjectId, usarlo directamente, si no convertirlo
          if (id instanceof ObjectId) {
            return id
          }
          if (!ObjectId.isValid(id)) {
            console.error(`Invalid ObjectId format: ${id}`)
            return null
          }
          return new ObjectId(id)
        })
        .filter(Boolean) // Filtrar nulls

      console.log("Converted to ObjectIds:", objectIds)

      const foods = await collection.find({ _id: { $in: objectIds } }).toArray()

      console.log(`Found ${foods.length} foods from ${objectIds.length} requested`)

      return foods.map((food) => ({
        ...food,
        _id: food._id.toString(),
      }))
    } catch (error) {
      console.error("Error finding foods by IDs:", error)
      throw error
    }
  }

  static async create(foodData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("Food")

      const result = await collection.insertOne(foodData)

      return {
        ...foodData,
        _id: result.insertedId.toString(),
      }
    } catch (error) {
      console.error("Error creating food:", error)
      throw error
    }
  }

  static async findAll(limit = 100) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("Food")

      const foods = await collection.find({}).limit(limit).toArray()

      return foods.map((food) => ({
        ...food,
        _id: food._id.toString(),
      }))
    } catch (error) {
      console.error("Error finding all foods:", error)
      throw error
    }
  }

  static async findByCategory(category) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")
      const collection = db.collection("Food")

      const foods = await collection.find({ category: { $regex: category, $options: "i" } }).toArray()

      return foods.map((food) => ({
        ...food,
        _id: food._id.toString(),
      }))
    } catch (error) {
      console.error("Error finding foods by category:", error)
      throw error
    }
  }
}
