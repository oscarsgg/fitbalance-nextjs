import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"

// GET: Obtener la próxima cita
export async function GET(request) {
  try {
    // Leer la cookie desde el request (funciona bien en producción)
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const nutritionistId = decoded.nutritionistId

    // Función auxiliar para construir Date desde date y hora separadas
    function getAppointmentDateTimeLocal(appointment) {
      const dateISO = appointment.appointment_date.toISOString().slice(0, 10)
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