import clientPromise from "@/lib/mongodb"

export class Food {
  static async searchByName(searchTerm) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const foods = await db.collection("Food")
        .find({
          name: { $regex: searchTerm, $options: "i" }
        })
        .limit(20)
        .toArray()

      return foods
    } catch (error) {
      throw error
    }
  }

  static async findById(foodId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const food = await db.collection("Food").findOne({ _id: foodId })
      return food
    } catch (error) {
      throw error
    }
  }

  static async findByIds(foodIds) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const foods = await db.collection("Food")
        .find({ _id: { $in: foodIds } })
        .toArray()

      return foods
    } catch (error) {
      throw error
    }
  }
}