import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Food } from "@/models/Food"
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

    const { id } = await params

    // Validar formato de ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid food ID format" }, { status: 400 })
    }

    const food = await Food.findById(id)

    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 })
    }

    return NextResponse.json({ food })
  } catch (error) {
    console.error("Get food error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}