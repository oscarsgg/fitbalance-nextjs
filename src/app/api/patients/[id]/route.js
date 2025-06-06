import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Patient } from "@/models/Patient"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get patient data
    const patient = await Patient.findById(params.id)

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Verify the patient belongs to this nutritionist
    if (patient.nutritionist_id.toString() !== decoded.nutritionistId) {
      return NextResponse.json({ error: "Unauthorized access to patient data" }, { status: 403 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error("Get patient error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const body = await request.json()

    // Get current patient to verify ownership
    const currentPatient = await Patient.findById(params.id)

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    if (currentPatient.nutritionist_id.toString() !== decoded.nutritionistId) {
      return NextResponse.json({ error: "Unauthorized to update this patient" }, { status: 403 })
    }

    // Update patient
    const updated = await Patient.update(params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "Failed to update patient" }, { status: 400 })
    }

    return NextResponse.json({ message: "Patient updated successfully" })
  } catch (error) {
    console.error("Update patient error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get current patient to verify ownership
    const currentPatient = await Patient.findById(params.id)

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    if (currentPatient.nutritionist_id.toString() !== decoded.nutritionistId) {
      return NextResponse.json({ error: "Unauthorized to delete this patient" }, { status: 403 })
    }

    // Delete patient
    const deleted = await Patient.delete(params.id)

    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete patient" }, { status: 400 })
    }

    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    console.error("Delete patient error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}