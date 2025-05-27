import { NextResponse } from "next/server"
import { Nutritionist } from "@/models/Nutritionist"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find nutritionist
    const nutritionist = await Nutritionist.findByEmail(email.toLowerCase())
    if (!nutritionist) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await Nutritionist.verifyPassword(password, nutritionist.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if nutritionist is active
    if (!nutritionist.isActive) {
      return NextResponse.json({ error: "Account is deactivated. Please contact support." }, { status: 401 })
    }

    // Update last login
    await Nutritionist.updateLastLogin(nutritionist._id)

    // Create JWT token
    const token = jwt.sign(
      {
        nutritionistId: nutritionist._id,
        email: nutritionist.email,
        name: nutritionist.name,
        specialization: nutritionist.specialization,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        nutritionist: {
          id: nutritionist._id,
          name: nutritionist.name,
          email: nutritionist.email,
          specialization: nutritionist.specialization,
          licenseNumber: nutritionist.licenseNumber,
          phone: nutritionist.phone,
        },
      },
      { status: 200 },
    )

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
