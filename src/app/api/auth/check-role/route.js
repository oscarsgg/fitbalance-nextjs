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

    // Solo decodificar el JWT, sin consultar la BD
    const decoded = jwt.verify(token, jwtSecret)

    return NextResponse.json({
      role: decoded.role || "nutritionist",
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    })
  } catch (error) {
    console.error("Role check error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
