import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export class Patient {
  constructor(data) {
    this.username = data.username
    this.password = data.password
    this.name = data.name
    this.age = Number.isInteger(data.age) ? data.age : parseInt(data.age)
    this.gender = data.gender
    this.height_cm = Number.isInteger(data.height_cm) ? data.height_cm : parseInt(data.height_cm)
    this.weight_kg = Number.isInteger(data.weight_kg) ? data.weight_kg : parseInt(data.weight_kg)
    this.email = data.email
    this.phone = data.phone
    this.objective = data.objective
    this.allergies = data.allergies || []
    this.dietary_restrictions = data.dietary_restrictions || []
    this.registration_date = data.registration_date
      ? new Date(data.registration_date)
      : new Date() // ✅ fecha como Date real
    this.notes = data.notes || ""
    this.last_consultation = data.last_consultation || null
    this.nutritionist_id = data.nutritionist_id
    this.isActive = data.isActive !== undefined ? data.isActive : true
  }

  // Generate unique username
  static async generateUniqueUsername(name) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Clean and format name
      const cleanName = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z\s]/g, "") // Remove special characters
        .trim()

      const nameParts = cleanName.split(" ")
      let baseUsername = ""

      if (nameParts.length >= 2) {
        // First name + last name
        baseUsername = `${nameParts[0]}.${nameParts[nameParts.length - 1]}`
      } else {
        // Just first name
        baseUsername = nameParts[0]
      }

      // Generate unique username with random number
      let username = baseUsername
      let isUnique = false
      let attempts = 0
      const maxAttempts = 100

      while (!isUnique && attempts < maxAttempts) {
        // Check if username exists
        const existingPatient = await db.collection("Patients").findOne({ username: username })

        if (!existingPatient) {
          isUnique = true
        } else {
          // Generate random number between 100 and 9999
          const randomNum = Math.floor(Math.random() * 9900) + 100
          username = `${baseUsername}${randomNum}`
        }

        attempts++
      }

      if (!isUnique) {
        throw new Error("Could not generate unique username after maximum attempts")
      }

      return username
    } catch (error) {
      throw error
    }
  }

  // Create new patient
  static async create(patientData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Convert nutritionist_id a ObjectId si no lo es
      if (typeof patientData.nutritionist_id === "string") {
        patientData.nutritionist_id = new ObjectId(patientData.nutritionist_id)
      }

      // Generar username, hash password, etc.
      const username = await Patient.generateUniqueUsername(patientData.name)
      const defaultPassword = "123456"
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)

      const patient = new Patient({
        ...patientData,
        username,
        password: hashedPassword,
      })

      const result = await db.collection("Patients").insertOne(patient)

      const { password, ...patientWithoutPassword } = patient
      return {
        _id: result.insertedId,
        ...patientWithoutPassword,
        defaultPassword,
      }
    } catch (error) {
      throw error
    }
  }

  static async countByNutritionist(nutritionistId) {
    try {
      const client = await clientPromise;
      const db = client.db("fitbalance");

      const count = await db.collection("Patients").countDocuments({
        nutritionist_id: new ObjectId(nutritionistId),
      });

      console.log("nutritionistId:", nutritionistId)

      return count;
    } catch (error) {
      throw error;
    }
  }

  // Find patients by nutritionist
  static async findByNutritionist(nutritionistId, { createdAfter, createdBefore } = {}) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Construir el filtro base
      const filter = {
        nutritionist_id: new ObjectId(nutritionistId),
      }

      // Agregar filtros por fechas si están presentes
      if (createdAfter || createdBefore) {
        filter.registration_date = {}
        if (createdAfter) filter.registration_date.$gte = createdAfter
        if (createdBefore) filter.registration_date.$lte = createdBefore
      }

      const patients = await db
        .collection("Patients")
        .find(filter)
        .sort({ registration_date: -1 })
        .toArray()

      // Eliminar contraseñas
      return patients.map(({ password, ...rest }) => rest)
    } catch (error) {
      throw error
    }
  }

  // Update patient by ID
  static async update(id, updateData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const result = await db.collection("Patients").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )

      return result.modifiedCount > 0
    } catch (error) {
      throw error
    }
  }

  // Delete patient by ID
  static async delete(id) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const result = await db.collection("Patients").deleteOne({ _id: new ObjectId(id) })

      return result.deletedCount > 0
    } catch (error) {
      throw error
    }
  }


  // Find patient by ID
  static async findById(id) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const patient = await db.collection("Patients").findOne({ _id: new ObjectId(id) })
      if (patient) {
        const { password, ...patientWithoutPassword } = patient
        return patientWithoutPassword
      }
      return null
    } catch (error) {
      throw error
    }
  }
}
