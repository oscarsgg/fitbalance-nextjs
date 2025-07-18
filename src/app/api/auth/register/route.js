import { NextResponse } from "next/server"
import { Nutritionist } from "@/models/Nutritionist"

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      name,
      lastName,
      secondLastName,
      email,
      password,
      city,
      street,
      neighborhood,
      streetNumber,
      licenseNumber,
      specialization,
    } = body

    // Validation for required fields
    if (!name || !lastName || !email || !password || !city || !street || !neighborhood || !streetNumber) {
      return NextResponse.json(
        {
          error: "Name, lastName, email, password, city, street, neighborhood, and streetNumber are required",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Create nutritionist
    const nutritionist = await Nutritionist.create({
      name,
      lastName,
      secondLastName,
      email: email.toLowerCase(),
      password,
      city,
      street,
      neighborhood,
      streetNumber,
      licenseNumber,
      specialization,
    })

    return NextResponse.json(
      {
        message: "Nutritionist account created successfully",
        nutritionist: {
          id: nutritionist._id,
          name: nutritionist.name,
          lastName: nutritionist.lastName,
          email: nutritionist.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)

    if (error.message === "Nutritionist already exists with this email") {
      return NextResponse.json({ error: "A nutritionist with this email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}