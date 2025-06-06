import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Diet } from "@/models/Diet"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const body = await request.json()

    const dietData = {
      ...body,
      patient_id: new ObjectId(params.id),
      nutritionist_id: new ObjectId(decoded.nutritionistId)
    }

    const diet = await Diet.create(dietData)

    return NextResponse.json({
      message: "Diet created successfully",
      diet
    }, { status: 201 })
  } catch (error) {
    console.error("Create diet error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const diet = await Diet.findByPatient(params.id)
    return NextResponse.json({ diet })
  } catch (error) {
    console.error("Get diet error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const body = await request.json()
    const updated = await Diet.update(params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "Diet not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ message: "Diet updated successfully" })
  } catch (error) {
    console.error("Update diet error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}