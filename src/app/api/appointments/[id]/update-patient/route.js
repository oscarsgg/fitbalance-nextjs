import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"

export async function PATCH(request, { params }) {
  try {
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get appointment ID and patient ID
    const appointmentId = params.id
    const body = await request.json()
    const { patient_id } = body

    console.log("Updating appointment patient_id:", { appointmentId, patient_id })

    if (!patient_id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Update appointment with patient_id
    const updated = await Appointment.updatePatientId(appointmentId, patient_id)

    if (!updated) {
      return NextResponse.json({ error: "Appointment not found or update failed" }, { status: 404 })
    }

    console.log("Successfully updated appointment with patient_id")
    return NextResponse.json({ message: "Appointment updated successfully" })
  } catch (error) {
    console.error("Update appointment patient_id error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
