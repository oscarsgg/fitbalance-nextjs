import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export class NutritionistSchedule {
  constructor(data) {
    this.nutritionist_id = data.nutritionist_id
    this.working_days = data.working_days || [] // ["monday", "tuesday", "wednesday", "thursday", "friday"]
    this.working_hours = data.working_hours || {
      start: "09:00",
      end: "17:00",
    }
    this.lunch_break = data.lunch_break || {
      enabled: true,
      start: "13:00",
      end: "14:00",
    }
    this.appointment_duration = data.appointment_duration || 60 // minutes
    this.buffer_time = data.buffer_time || 15 // minutes between appointments
    this.created_at = data.created_at ? new Date(data.created_at) : new Date()
    this.updated_at = data.updated_at ? new Date(data.updated_at) : new Date()
  }

  // Create or update schedule
  static async createOrUpdate(scheduleData) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const existingSchedule = await db.collection("NutritionistSchedules").findOne({
        $or: [
          { nutritionist_id: scheduleData.nutritionist_id },
          { nutritionist_id: new ObjectId(scheduleData.nutritionist_id) },
        ],
      })

      if (existingSchedule) {
        // Update existing schedule
        const updateData = {
          ...scheduleData,
          updated_at: new Date().toISOString(),
        }
        delete updateData.nutritionist_id // Don't update the ID

        const result = await db.collection("NutritionistSchedules").updateOne(
          {
            $or: [
              { nutritionist_id: scheduleData.nutritionist_id },
              { nutritionist_id: new ObjectId(scheduleData.nutritionist_id) },
            ],
          },
          { $set: updateData },
        )

        return {
          _id: existingSchedule._id,
          nutritionist_id: scheduleData.nutritionist_id,
          ...updateData,
        }
      } else {
        // Create new schedule
        const schedule = new NutritionistSchedule(scheduleData)
        const result = await db.collection("NutritionistSchedules").insertOne(schedule)

        return {
          _id: result.insertedId,
          ...schedule,
        }
      }
    } catch (error) {
      throw error
    }
  }

  // Get schedule by nutritionist
  static async findByNutritionist(nutritionistId) {
    try {
      const client = await clientPromise
      const db = client.db("fitbalance")

      const schedule = await db.collection("NutritionistSchedules").findOne({
        $or: [{ nutritionist_id: nutritionistId }, { nutritionist_id: new ObjectId(nutritionistId) }],
      })

      return schedule
    } catch (error) {
      throw error
    }
  }

  // Generate available time slots for a specific date
  static async getAvailableSlots(nutritionistId, date) {
    try {
      const schedule = await NutritionistSchedule.findByNutritionist(nutritionistId)
      if (!schedule) {
        return [] // No schedule configured
      }

      // Check if the date is a working day
      const [y, m, d] = date.split("-")
      const localDate = new Date(y, m - 1, d)
      const dayOfWeek = localDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

      if (!schedule.working_days.includes(dayOfWeek)) {
        return [] // Not a working day
      }

      // Generate time slots
      const slots = []
      const [startHour, startMinute] = schedule.working_hours.start.split(":").map(Number)
      const [endHour, endMinute] = schedule.working_hours.end.split(":").map(Number)

      let currentTime = startHour * 60 + startMinute // Convert to minutes
      const endTime = endHour * 60 + endMinute

      while (currentTime + schedule.appointment_duration <= endTime) {
        const hours = Math.floor(currentTime / 60)
        const minutes = currentTime % 60
        const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

        // Check if this time conflicts with lunch break
        if (schedule.lunch_break.enabled) {
          const [lunchStartHour, lunchStartMinute] = schedule.lunch_break.start.split(":").map(Number)
          const [lunchEndHour, lunchEndMinute] = schedule.lunch_break.end.split(":").map(Number)
          const lunchStart = lunchStartHour * 60 + lunchStartMinute
          const lunchEnd = lunchEndHour * 60 + lunchEndMinute

          // Skip if appointment would overlap with lunch
          if (!(currentTime + schedule.appointment_duration <= lunchStart || currentTime >= lunchEnd)) {
            currentTime += schedule.appointment_duration + schedule.buffer_time
            continue
          }
        }

        slots.push(timeString)
        currentTime += schedule.appointment_duration + schedule.buffer_time
      }

      // Filter out already booked slots
      const { Appointment } = await import("./Appointment")
      const existingAppointments = await Appointment.findByNutritionist(nutritionistId, { date })

      const bookedTimes = existingAppointments
        .filter((apt) => apt.status === "scheduled")
        .map((apt) => apt.appointment_time)

      return slots.filter((slot) => !bookedTimes.includes(slot))
    } catch (error) {
      throw error
    }
  }
}
