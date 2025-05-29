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
      const result = await db.collection("Appointments").insertOne(appointment)

      return {
        _id: result.insertedId,
        ...appointment,
      }
    } catch (error) {
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

      // Find all appointments for this nutritionist on this date
      const existingAppointments = await db
        .collection("Appointments")
        .find({
          nutritionist_id: new ObjectId(nutritionistId),
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
      throw error
    }
  }

  // Get appointments for nutritionist
  static async findByNutritionist(nutritionistId, filters = {}) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const query = { nutritionist_id: new ObjectId(nutritionistId) }

      // Add date filters if provided
      if (filters.startDate && filters.endDate) {
        query.appointment_date = {
          $gte: filters.startDate,
          $lte: filters.endDate,
        }
      } else if (filters.date) {
        query.appointment_date = filters.date
      }

      // Add status filter if provided
      if (filters.status) {
        query.status = filters.status
      }

      const appointments = await db
        .collection("Appointments")
        .find(query)
        .sort({ appointment_date: 1, appointment_time: 1 })
        .toArray()

      return appointments
    } catch (error) {
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