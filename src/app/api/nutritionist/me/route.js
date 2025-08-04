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
        lastName: nutritionist.lastName,
        secondLastName: nutritionist.secondLastName,
        email: nutritionist.email,
        specialization: nutritionist.specialization,
        licenseNumber: nutritionist.licenseNumber,
        phone: nutritionist.phone,
        city: nutritionist.city,
        street: nutritionist.street,
        streetNumber: nutritionist.streetNumber,
        neighborhood: nutritionist.neighborhood,
        address: {
          city: nutritionist.city,
          street: nutritionist.street,
          streetNumber: nutritionist.streetNumber,
          neighborhood: nutritionist.neighborhood,
        },
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
    const {
      name,
      lastName,
      secondLastName,
      specialization,
      licenseNumber,
      phone,
      city,
      street,
      streetNumber,
      neighborhood,
      currentPassword,
      newPassword,
      confirmPassword,
    } = body

    // Fetch the nutritionist from DB to get the stored password hash for verification
    const nutritionistInDb = await Nutritionist.findByEmail(decoded.email)

    if (!nutritionistInDb) {
      return NextResponse.json({ error: "Nutritionist not found" }, { status: 404 })
    }

    // Handle password change if newPassword is provided (or any password field is filled)
    if (currentPassword || newPassword || confirmPassword) {
      // Check if currentPassword is provided
      if (!currentPassword) {
        return NextResponse.json({ error: "You must enter your current password to change it." }, { status: 400 })
      }

      // Verify current password
      const isCurrentPasswordCorrect = await Nutritionist.verifyPassword(currentPassword, nutritionistInDb.password)
      if (!isCurrentPasswordCorrect) {
        return NextResponse.json({ error: "La contraseña actual es incorrecta." }, { status: 401 })
      }

      // Validate new password
      if (!newPassword) {
        return NextResponse.json({ error: "You must enter a new password." }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 })
      }
      if (newPassword === currentPassword) {
        return NextResponse.json({ error: "New password cannot be the same as the current password." }, { status: 400 })
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
      }

      // Update password in DB
      const passwordUpdated = await Nutritionist.updatePassword(nutritionistInDb._id, newPassword)
      if (!passwordUpdated) {
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
      }
    }

    // Prepare data for profile update (excluding password fields as they are handled above)
    const safeUpdateData = {
      name,
      lastName,
      secondLastName,
      specialization,
      licenseNumber,
      phone,
      city,
      street,
      streetNumber,
      neighborhood,
    }

    // Only update profile fields if they are actually provided and different from current DB values
    const fieldsToUpdate = {}
    for (const key in safeUpdateData) {
      if (safeUpdateData[key] !== undefined && safeUpdateData[key] !== nutritionistInDb[key]) {
        fieldsToUpdate[key] = safeUpdateData[key]
      }
    }

    let profileUpdated = false
    if (Object.keys(fieldsToUpdate).length > 0) {
      profileUpdated = await Nutritionist.updateProfile(nutritionistInDb._id, fieldsToUpdate)
      if (!profileUpdated) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 400 })
      }
    }

    // Get updated nutritionist data (without password)
    const updatedNutritionist = await Nutritionist.findById(nutritionistInDb._id)

    return NextResponse.json({
      message: "Profile updated successfully",
      nutritionist: updatedNutritionist,
    })
  } catch (error) {
    console.error("Update nutritionist error:", error)
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
