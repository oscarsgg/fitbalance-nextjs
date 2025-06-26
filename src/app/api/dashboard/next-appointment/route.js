import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get("token")

    if (!tokenCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const nutritionistId = decoded.nutritionistId

    function getAppointmentDateTimeLocal(appointment) {
      const dateISO = appointment.appointment_date.toISOString().slice(0, 10) // "YYYY-MM-DD"
      const [year, month, day] = dateISO.split("-").map(Number)
      const [hours, minutes] = appointment.appointment_time.split(":").map(Number)
      return new Date(year, month - 1, day, hours, minutes)
    }

    const nowLocal = new Date()

    const allAppointments = await Appointment.findByNutritionist(nutritionistId, {
      status: "scheduled",
    })

    if (!allAppointments || allAppointments.length === 0) {
      return NextResponse.json({ nextAppointment: null })
    }

    const futureAppointments = allAppointments.filter(appointment => {
      const appointmentDateTimeLocal = getAppointmentDateTimeLocal(appointment)
      return appointmentDateTimeLocal > nowLocal
    })

    if (futureAppointments.length === 0) {
      return NextResponse.json({ nextAppointment: null })
    }

    futureAppointments.sort((a, b) => {
      return getAppointmentDateTimeLocal(a) - getAppointmentDateTimeLocal(b)
    })

    const nextAppointment = futureAppointments[0]

    return NextResponse.json({ nextAppointment })
  } catch (error) {
    console.error("Error fetching next appointment:", error)
    return NextResponse.json({ error: "Failed to fetch next appointment" }, { status: 500 })
  }
}
