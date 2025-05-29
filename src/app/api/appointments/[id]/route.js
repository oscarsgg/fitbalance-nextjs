import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Appointment } from "@/models/Appointment"

export async function PATCH(request, { params }) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get appointment ID
    const appointmentId = params.id

    // Get update data
    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses = ["scheduled", "completed", "cancelled", "no_show"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update appointment
    const updated = await Appointment.updateStatus(appointmentId, status, notes)

    if (!updated) {
      return NextResponse.json({ error: "Appointment not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ message: "Appointment updated successfully" })
  } catch (error) {
    console.error("Update appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get appointment ID
    const appointmentId = params.id

    // Delete appointment
    const deleted = await Appointment.delete(appointmentId)

    if (!deleted) {
      return NextResponse.json({ error: "Appointment not found or delete failed" }, { status: 404 })
    }

    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Delete appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
