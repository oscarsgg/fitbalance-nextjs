import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { NutritionistSchedule } from "@/models/NutritionistSchedule"

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get schedule data
    const body = await request.json()
    const { working_days, working_hours, lunch_break, appointment_duration, buffer_time } = body

    // Validation
    if (!working_days || !Array.isArray(working_days) || working_days.length === 0) {
      return NextResponse.json({ error: "At least one working day must be selected" }, { status: 400 })
    }

    if (!working_hours || !working_hours.start || !working_hours.end) {
      return NextResponse.json({ error: "Working hours start and end times are required" }, { status: 400 })
    }

    // Create or update schedule
    const scheduleData = {
      nutritionist_id: decoded.nutritionistId,
      working_days,
      working_hours,
      lunch_break,
      appointment_duration: appointment_duration || 60,
      buffer_time: buffer_time || 15,
    }

    const schedule = await NutritionistSchedule.createOrUpdate(scheduleData)

    return NextResponse.json(
      {
        message: "Schedule updated successfully",
        schedule,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Update schedule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get schedule
    const schedule = await NutritionistSchedule.findByNutritionist(decoded.nutritionistId)

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Get schedule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
