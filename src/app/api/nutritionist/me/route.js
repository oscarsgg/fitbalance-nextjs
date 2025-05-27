import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Nutritionist } from "@/models/Nutritionist"

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get nutritionist data
    const nutritionist = await Nutritionist.findById(decoded.nutritionistId)

    if (!nutritionist) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 })
    }

    return NextResponse.json({
      nutritionist: {
        id: nutritionist._id,
        name: nutritionist.name,
        email: nutritionist.email,
        specialization: nutritionist.specialization,
        licenseNumber: nutritionist.licenseNumber,
        phone: nutritionist.phone,
        address: nutritionist.address,
        createdAt: nutritionist.createdAt,
        lastLogin: nutritionist.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get nutritionist error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function PUT(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get update data
    const body = await request.json()
    const { name, specialization, licenseNumber, phone, address } = body

    // Update nutritionist profile
    const updated = await Nutritionist.updateProfile(decoded.nutritionistId, {
      name,
      specialization,
      licenseNumber,
      phone,
      address,
    })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 400 })
    }

    // Get updated nutritionist data
    const nutritionist = await Nutritionist.findById(decoded.nutritionistId)

    return NextResponse.json({
      message: "Profile updated successfully",
      nutritionist: {
        id: nutritionist._id,
        name: nutritionist.name,
        email: nutritionist.email,
        specialization: nutritionist.specialization,
        licenseNumber: nutritionist.licenseNumber,
        phone: nutritionist.phone,
        address: nutritionist.address,
      },
    })
  } catch (error) {
    console.error("Update nutritionist error:", error)
    return NextResponse.json({ error: "Invalid token or update failed" }, { status: 401 })
  }
}
