import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Food } from "@/models/Food"

export async function GET(request) {
  try {  
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("q")

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ foods: [] })
    }

    const foods = await Food.searchByName(searchTerm)
    return NextResponse.json({ foods })
  } catch (error) {
    console.error("Search foods error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}