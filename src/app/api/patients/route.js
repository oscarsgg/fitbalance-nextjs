import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { Patient } from "@/models/Patient"
import { sendPatientCredentials } from "@/lib/email"

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get patient data from form (still in Spanish field names for compatibility)
    const body = await request.json()
    const {
      name,
      lastName,
      secondLastName,
      edad,
      sexo,
      altura_cm,
      peso_kg,
      email,
      telefono,
      objetivo,
      alergias,
      restricciones_alimentarias,
      notas,
    } = body

    // Validation
    if (!name || !lastName || !edad || !sexo || !altura_cm || !peso_kg || !email || !objetivo) {
      return NextResponse.json(
        { error: "Name, last name, age, gender, height, weight, email, and objective are required" },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Age validation
    if (edad < 1 || edad > 120) {
      return NextResponse.json({ error: "Please enter a valid age between 1 and 120" }, { status: 400 })
    }

    // Height validation (cm)
    if (altura_cm < 50 || altura_cm > 250) {
      return NextResponse.json({ error: "Please enter a valid height between 50 and 250 cm" }, { status: 400 })
    }

    // Weight validation (kg)
    if (peso_kg < 10 || peso_kg > 500) {
      return NextResponse.json({ error: "Please enter a valid weight between 10 and 500 kg" }, { status: 400 })
    }

    // Map Spanish form fields to English database fields
    const patientData = {
      name,
      lastName,
      secondLastName: secondLastName || null,
      age: Number.parseInt(edad),
      gender: sexo,
      height_cm: Number.parseFloat(altura_cm),
      weight_kg: Number.parseFloat(peso_kg),
      email: email.toLowerCase(),
      phone: telefono,
      objective: objetivo,
      allergies: Array.isArray(alergias) ? alergias : [],
      dietary_restrictions: Array.isArray(restricciones_alimentarias) ? restricciones_alimentarias : [],
      notes: notas,
      nutritionist_id: new ObjectId(decoded.nutritionistId),
    }


    // Create patient
    const patient = await Patient.create(patientData)
    const { defaultPassword, ...patientWithoutPassword } = patient

    let warning
    try {
      await sendPatientCredentials(patient.email, patient.username, defaultPassword)
    } catch (emailError) {
      console.error("Send credentials error:", emailError)
      warning = "Patient created but email could not be sent"
    }

    const responseBody = {
      message: "Patient created successfully",
      patient,
    }

    if (warning) {
      responseBody.warning = warning
    }

    return NextResponse.json(responseBody, { status: 201 })
  } catch (error) {
    console.error("Create patient error:", error)

    if (error.message === "Could not generate unique username after maximum attempts") {
      return NextResponse.json({ error: "Could not generate unique username. Please try again." }, { status: 500 })
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

    // Get patients for this nutritionist
    const patients = await Patient.findByNutritionist(decoded.nutritionistId)

    return NextResponse.json({ patients })
  } catch (error) {
    console.error("Get patients error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
