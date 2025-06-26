import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"
import { Patient } from "@/models/Patient"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
    const nutritionistId = decoded.nutritionistId

    // Get data for the last 6 months
    const months = []
    const appointmentsData = []
    const patientsData = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      // Get month name
      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      months.push(monthName)

      // Get appointments for this month
      const monthAppointments = await Appointment.findByNutritionist(nutritionistId, {
        startDate: monthStart,
        endDate: monthEnd,
      })
      appointmentsData.push(monthAppointments.length)

      // Get patients created this month
      const monthPatients = await Patient.findByNutritionist(nutritionistId, {
        createdAfter: monthStart,
        createdBefore: monthEnd,
      })
      patientsData.push(monthPatients.length)
    }

    const chartData = {
      months,
      appointments: appointmentsData,
      patients: patientsData,
    }

    return NextResponse.json({ chartData })
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
