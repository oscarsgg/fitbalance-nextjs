import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Food } from "@/models/Food"

export async function GET(request) {
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
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit")) || 100

    let foods
    if (category) {
      foods = await Food.findByCategory(category)
    } else {
      foods = await Food.findAll(limit)
    }

    return NextResponse.json({ foods })
  } catch (error) {
    console.error("Get foods error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
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

    const foodData = await request.json()

    // Validar datos requeridos
    if (!foodData.name || !foodData.nutrients) {
      return NextResponse.json({ error: "Missing required fields: name, nutrients" }, { status: 400 })
    }

    const food = await Food.create(foodData)

    return NextResponse.json({ food }, { status: 201 })
  } catch (error) {
    console.error("Create food error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
