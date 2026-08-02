import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const decoded = jwt.verify(token, jwtSecret)

    return NextResponse.json({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || "nutritionist",
      specialization: decoded.specialization,
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
