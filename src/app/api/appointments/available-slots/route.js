import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { NutritionistSchedule } from "@/models/NutritionistSchedule"

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Get available slots
    const availableSlots = await NutritionistSchedule.getAvailableSlots(decoded.nutritionistId, date)

    return NextResponse.json({ availableSlots })
  } catch (error) {
    console.error("Get available slots error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
