import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"
import { Patient } from "@/models/Patient"

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get appointment data
    const body = await request.json()
    const {
      patient_type, // "existing" or "new"
      patient_id,
      patient_name,
      patient_email,
      patient_phone,
      appointment_date,
      appointment_time,
      appointment_type,
      notes,
    } = body

    // Validation
    if (!patient_name || !appointment_date || !appointment_time || !appointment_type) {
      return NextResponse.json(
        { error: "Patient name, appointment date, time, and type are required" },
        { status: 400 },
      )
    }

    // Validate date (not in the past)
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`)
    const now = new Date()
    if (appointmentDateTime < now) {
      return NextResponse.json({ error: "Cannot schedule appointments in the past" }, { status: 400 })
    }

    // If existing patient, validate patient exists and belongs to this nutritionist
    if (patient_type === "existing" && patient_id) {
      const patient = await Patient.findById(patient_id)
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }
      if (patient.nutritionist_id.toString() !== decoded.nutritionistId) {
        return NextResponse.json({ error: "Patient does not belong to this nutritionist" }, { status: 403 })
      }
    }

    // Validate email if provided
    if (patient_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(patient_email)) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
      }
    }

    // Create appointment data
    const appointmentData = {
      nutritionist_id: decoded.nutritionistId,
      patient_id: patient_type === "existing" ? patient_id : null,
      patient_name,
      patient_email,
      patient_phone,
      appointment_date,
      appointment_time,
      appointment_type,
      notes,
    }

    // Create appointment
    const appointment = await Appointment.create(appointmentData)

    return NextResponse.json(
      {
        message: "Appointment created successfully",
        appointment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create appointment error:", error)

    if (error.message.includes("Time conflict")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const date = searchParams.get("date")
    const status = searchParams.get("status")

    // Build filters
    const filters = {}

    if (startDate && endDate) {
      filters.startDate = new Date(startDate)
      filters.endDate = new Date(endDate)
    } else if (date) {
      // Este es el más importante para los clics en el calendario
      filters.date = new Date(date)
    }

    if (status) {
      filters.status = status
    }


    // Get appointments
    const appointments = await Appointment.findByNutritionist(decoded.nutritionistId, filters)

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("Get appointments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
