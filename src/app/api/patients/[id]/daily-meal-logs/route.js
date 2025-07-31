import { NextResponse } from "next/server"
import { DailyMealLogs } from "@/models/DailyMealLogs"
import { Food } from "@/models/Food"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 })
    }

    // Find the daily meal log for this patient and date
    const dailyMealLog = await DailyMealLogs.findByPatientAndDate(id, dateParam)

    if (!dailyMealLog) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No meal logs found for this date",
      })
    }

    // Enrich the meal log with food details
    const enrichedMeals = await Promise.all(
      dailyMealLog.meals.map(async (meal) => {
        const enrichedFoods = await Promise.all(
          meal.foods.map(async (food) => {
            try {
              const foodDetails = await Food.findById(food.food_id.toString())
              return {
                ...food,
                food_name: foodDetails?.name || "Unknown Food",
                food_details: foodDetails || null,
              }
            } catch (error) {
              console.error("Error fetching food details:", error)
              return {
                ...food,
                food_name: "Unknown Food",
                food_details: null,
              }
            }
          }),
        )

        return {
          ...meal,
          foods: enrichedFoods,
        }
      }),
    )

    const enrichedDailyMealLog = {
      ...dailyMealLog,
      _id: dailyMealLog._id.toString(),
      patient_id: dailyMealLog.patient_id.toString(),
      meals: enrichedMeals,
    }

    return NextResponse.json({
      success: true,
      data: enrichedDailyMealLog,
    })
  } catch (error) {
    console.error("Error fetching daily meal logs:", error)
    return NextResponse.json({ error: "Failed to fetch daily meal logs" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const logData = await request.json()

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid patient ID format" }, { status: 400 })
    }

    // Validate required fields
    if (!logData.date || !logData.meals) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const dailyLog = await DailyMealLogs.create({
      ...logData,
      patient_id: id,
    })

    return NextResponse.json(
      {
        success: true,
        data: dailyLog,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating daily meal log:", error)
    return NextResponse.json({ error: "Failed to create daily meal log" }, { status: 500 })
  }
}
