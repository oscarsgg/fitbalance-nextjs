import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { WeeklyPlan } from "@/models/WeeklyPlan"
import { Food } from "@/models/Food"
import { enrichMealsWithFoodDetails } from "@/models/WeeklyPlan"

function isValidObjectId(id) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)
}

export async function POST(request, { params }) {
  try {
    const { id } = await params

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const body = await request.json()

    console.log("Creating weekly plan with data:", JSON.stringify(body, null, 2))

    const processedData = {
      ...body,
      patient_id: id,
      week_start: new Date(body.week_start),
    }

    // ❌ NO vuelvas a convertir meals si ya vienen del frontend bien estructurados
    // ✅ Ya están en formato correcto
    // processedData.meals = WeeklyPlan.convertToStorageFormat(processedData)

    const plan = await WeeklyPlan.create(processedData)

    return NextResponse.json({
      message: "Weekly plan created successfully",
      plan
    }, { status: 201 })
  } catch (error) {
    console.error("Create weekly plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")

    let plan
    if (weekStart) {
      plan = await WeeklyPlan.findByPatientAndWeek(id, weekStart)
    } else {
      plan = await WeeklyPlan.findLatestByPatient(id)
    }

    if (plan && plan.meals) {
      const enrichedMeals = await enrichMealsWithFoodDetails(plan.meals)

      const formattedMeals = {
        monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        sunday: { breakfast: [], lunch: [], dinner: [], snack: [] }
      }

      for (const meal of enrichedMeals) {
        const { day, type, foods } = meal
        if (formattedMeals[day] && formattedMeals[day][type]) {
          formattedMeals[day][type] = foods
        }
      }

      plan.meals = formattedMeals
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Get weekly plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, ...updateData } = body

    console.log("Updating weekly plan with data:", JSON.stringify(updateData, null, 2))

    const updated = await WeeklyPlan.update(planId, updateData)

    if (!updated) {
      return NextResponse.json({ error: "Plan not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ message: "Weekly plan updated successfully" })
  } catch (error) {
    console.error("Update weekly plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
