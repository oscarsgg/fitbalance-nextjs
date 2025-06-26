import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { Patient } from "@/models/Patient"
import { Appointment } from "@/models/Appointment"

// Funciones para normalizar fechas a UTC
function startOfDayUTC(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function endOfDayUTC(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999))
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
    const nutritionistId = decoded.nutritionistId

    const now = new Date()

    // Normalizar fechas a UTC
    const todayStart = startOfDayUTC(now)
    const todayEnd = endOfDayUTC(now)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const weekStart = startOfDayUTC(startOfWeek)

    const endOfWeek = new Date(weekStart)
    endOfWeek.setDate(weekStart.getDate() + 6)
    const weekEnd = endOfDayUTC(endOfWeek)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const monthStart = startOfDayUTC(startOfMonth)
    const monthEnd = endOfDayUTC(endOfMonth)

    // Total patients
    const totalPatients = await Patient.countByNutritionist(nutritionistId)

    // Today's appointments
    const todayAppointments = await Appointment.findByNutritionist(nutritionistId, {
      startDate: todayStart,
      endDate: todayEnd,
    })

    // This week's appointments
    const weekAppointments = await Appointment.findByNutritionist(nutritionistId, {
      startDate: weekStart,
      endDate: weekEnd,
    })

    // This month's appointments
    const monthAppointments = await Appointment.findByNutritionist(nutritionistId, {
      startDate: monthStart,
      endDate: monthEnd,
    })

    // Completed appointments this month
    const completedAppointments = monthAppointments.filter((apt) => apt.status === "completed").length

    // Response
    const stats = {
      totalPatients,
      todayAppointments: todayAppointments.length,
      weekAppointments: weekAppointments.length,
      completedAppointments,
      // Dummy values for now
      patientsChange: "+12%",
      todayChange: todayAppointments.length > 0 ? "+100%" : "0%",
      weekChange: weekAppointments.length > 5 ? "+20%" : weekAppointments.length > 0 ? "+10%" : "0%",
      completedChange: completedAppointments > 10 ? "+15%" : completedAppointments > 0 ? "+5%" : "0%",
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
