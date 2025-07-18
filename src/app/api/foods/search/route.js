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
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ foods: [] })
    }

    console.log("Searching for foods with query:", query)

    const foods = await Food.search(query.trim(), limit)

    console.log(`Found ${foods.length} foods for query: ${query}`)

    return NextResponse.json({ foods })
  } catch (error) {
    console.error("Food search error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
