import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export class Appointment {
  constructor(data) {
    this.nutritionist_id = data.nutritionist_id
    this.patient_id = data.patient_id || null // null if it's a new patient
    this.patient_name = data.patient_name // For new patients or display
    this.patient_email = data.patient_email || null
    this.patient_phone = data.patient_phone || null
    this.appointment_date = data.appointment_date // ISO string
    this.appointment_time = data.appointment_time // "HH:MM" format
    this.duration_minutes = data.duration_minutes || 60
    this.appointment_type = data.appointment_type // "initial", "follow_up", "consultation"
    this.status = data.status || "scheduled" // "scheduled", "completed", "cancelled", "no_show"
    this.notes = data.notes || ""
    this.created_at = data.created_at || new Date().toISOString()
    this.updated_at = data.updated_at || new Date().toISOString()
  }

  // Create new appointment
  static async create(appointmentData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Check for time conflicts
      const conflictCheck = await Appointment.checkTimeConflict(
        appointmentData.nutritionist_id,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.duration_minutes || 60,
      )

      if (conflictCheck.hasConflict) {
        throw new Error(`Time conflict: You already have an appointment at ${conflictCheck.conflictTime}`)
      }

      const appointment = new Appointment(appointmentData)

      // Asegurar que nutritionist_id sea ObjectId
      if (typeof appointment.nutritionist_id === "string") {
        appointment.nutritionist_id = new ObjectId(appointment.nutritionist_id)
      }

      console.log("Guardando cita en DB:", JSON.stringify(appointment, null, 2))
      const result = await db.collection("Appointments").insertOne(appointment)

      const createdAppointment = {
        _id: result.insertedId,
        ...appointment,
      }

      console.log("Cita guardada exitosamente con ID:", result.insertedId)
      return createdAppointment
    } catch (error) {
      console.error("Error al crear cita:", error)
      throw error
    }
  }

  // Check for time conflicts
  static async checkTimeConflict(nutritionistId, date, time, duration) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Convert time to minutes for easier calculation
      const [hours, minutes] = time.split(":").map(Number)
      const appointmentStart = hours * 60 + minutes
      const appointmentEnd = appointmentStart + duration

      // Asegurar que nutritionistId sea ObjectId
      const nutritionistObjectId = typeof nutritionistId === "string" ? new ObjectId(nutritionistId) : nutritionistId

      // Find all appointments for this nutritionist on this date
      const existingAppointments = await db
        .collection("Appointments")
        .find({
          nutritionist_id: nutritionistObjectId,
          appointment_date: date,
          status: { $in: ["scheduled", "completed"] }, // Don't check cancelled appointments
        })
        .toArray()

      // Check each existing appointment for conflicts
      for (const existing of existingAppointments) {
        const [existingHours, existingMinutes] = existing.appointment_time.split(":").map(Number)
        const existingStart = existingHours * 60 + existingMinutes
        const existingEnd = existingStart + (existing.duration_minutes || 60)

        // Check if times overlap
        if (
          (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
          (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
          (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
        ) {
          return {
            hasConflict: true,
            conflictTime: existing.appointment_time,
            conflictPatient: existing.patient_name,
          }
        }
      }

      return { hasConflict: false }
    } catch (error) {
      console.error("Error checking time conflict:", error)
      throw error
    }
  }

  // Get appointments for nutritionist
  static async findByNutritionist(nutritionistId, filters = {}) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      // Asegurar que nutritionistId sea ObjectId
      const nutritionistObjectId = typeof nutritionistId === "string" ? new ObjectId(nutritionistId) : nutritionistId

      const query = { nutritionist_id: nutritionistObjectId }

      console.log("Construyendo query con nutritionist_id:", nutritionistId)

      // Add date filters if provided
      if (filters.startDate && filters.endDate) {
        query.appointment_date = {
          $gte: filters.startDate,
          $lte: filters.endDate,
        }
        console.log("Filtro de rango de fechas:", filters.startDate, "a", filters.endDate)
      } else if (filters.date) {
        query.appointment_date = filters.date
        console.log("Filtro de fecha específica:", filters.date)
      }

      // Add status filter if provided
      if (filters.status) {
        query.status = filters.status
        console.log("Filtro de estado:", filters.status)
      }

      console.log("Query final para MongoDB:", JSON.stringify(query, null, 2))

      // Primero, vamos a ver todas las citas de este nutricionista sin filtros
      const allAppointments = await db
        .collection("Appointments")
        .find({ nutritionist_id: nutritionistObjectId })
        .toArray()

      console.log("Todas las citas del nutricionista:", allAppointments.length)
      if (allAppointments.length > 0) {
        console.log("Ejemplo de cita en DB:", JSON.stringify(allAppointments[0], null, 2))
      }

      // Ahora hacer la consulta con filtros
      const appointments = await db
        .collection("Appointments")
        .find(query)
        .sort({ appointment_date: 1, appointment_time: 1 })
        .toArray()

      console.log("Citas encontradas con filtros:", appointments.length)

      return appointments
    } catch (error) {
      console.error("Error al buscar citas:", error)
      throw error
    }
  }

  // Get today's appointments
  static async getTodaysAppointments(nutritionistId) {
    try {
      const today = new Date().toISOString().split("T")[0]
      return await Appointment.findByNutritionist(nutritionistId, { date: today })
    } catch (error) {
      throw error
    }
  }

  // Update appointment status
  static async updateStatus(appointmentId, status, notes = null) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (notes !== null) {
        updateData.notes = notes
      }

      const result = await db
        .collection("Appointments")
        .updateOne({ _id: new ObjectId(appointmentId) }, { $set: updateData })

      return result.modifiedCount > 0
    } catch (error) {
      throw error
    }
  }

  // Delete appointment
  static async delete(appointmentId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const result = await db.collection("Appointments").deleteOne({ _id: new ObjectId(appointmentId) })
      return result.deletedCount > 0
    } catch (error) {
      throw error
    }
  }
}
