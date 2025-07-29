import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { WeeklyPlan } from "@/models/WeeklyPlan"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // ✅ AWAIT params antes de usarlo
    const { id: patientId } = await params
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")

    // Validate ObjectId format
    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 })
    }

    if (!weekStart) {
      return NextResponse.json({ error: "Week start date is required" }, { status: 400 })
    }

    console.log("Getting weekly plan for patient:", patientId, "week:", weekStart)

    const plan = await WeeklyPlan.findByPatientAndWeek(patientId, weekStart)

    console.log("Found plan:", plan ? "Yes" : "No")

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Get weekly plan error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // ✅ AWAIT params antes de usarlo
    const { id: patientId } = await params
    const planData = await request.json()

    // Validate ObjectId format
    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 })
    }

    // Validate required fields
    if (!planData.week_start || !planData.meals) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

     // Validate weight and height
    if (planData.weight_kg === undefined || Number(planData.weight_kg) < 1) {
      return NextResponse.json({ error: "Weight must be at least 1 kg" }, { status: 400 })
    }
    if (planData.height_cm === undefined || Number(planData.height_cm) < 30) {
      return NextResponse.json({ error: "Height must be at least 30 cm" }, { status: 400 })
    }

    console.log("Creating weekly plan for patient:", patientId)
    console.log("Plan data:", JSON.stringify(planData, null, 2))

    const plan = await WeeklyPlan.create({
      ...planData,
      patient_id: patientId,
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Create weekly plan error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // ✅ AWAIT params antes de usarlo
    const { id: patientId } = await params
    const { planId, ...planData } = await request.json()

    // Validate ObjectId formats
    if (!ObjectId.isValid(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 })
    }

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID format" }, { status: 400 })
    }

    console.log("Updating weekly plan:", planId, "for patient:", patientId)

    // Validate weight and height
    if (planData.weight_kg !== undefined && Number(planData.weight_kg) < 1) {
      return NextResponse.json({ error: "Weight must be at least 1 kg" }, { status: 400 })
    }
    if (planData.height_cm !== undefined && Number(planData.height_cm) < 30) {
      return NextResponse.json({ error: "Height must be at least 30 cm" }, { status: 400 })
    }

    const success = await WeeklyPlan.update(planId, {
      ...planData,
      patient_id: patientId,
    })

    if (!success) {
      return NextResponse.json({ error: "Plan not found or not updated" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update weekly plan error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID format" }, { status: 400 })
    }

    const success = await WeeklyPlan.delete(planId)

    if (!success) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete weekly plan error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}