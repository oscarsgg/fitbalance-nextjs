import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"
import { Patient } from "@/models/Patient"

export async function GET(request) {
  try {
    // ✅ Acceder a la cookie del token de forma compatible con Vercel
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ✅ Validar el token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const nutritionistId = decoded.nutritionistId

    const months = []
    const appointmentsData = []
    const patientsData = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthName = date.toLocaleDateString("en-US", { month: "short" })
      months.push(monthName)

      // ✅ Obtener citas de ese mes
      const monthAppointments = await Appointment.findByNutritionist(nutritionistId, {
        startDate: monthStart,
        endDate: monthEnd,
      })
      appointmentsData.push(monthAppointments.length)

      // ✅ Obtener pacientes de ese mes
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
