import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Patient } from "@/models/Patient"

export async function GET(request) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Obtener pacientes recientes para este nutricionista (últimos 5)
    const patients = await Patient.findByNutritionist(decoded.nutritionistId)

    // Tomar solo los primeros 5 pacientes más recientes
    const recentPatients = patients.slice(0, 4)

    console.log(`Found ${patients.length} total patients, returning ${recentPatients.length} recent patients`)

    return NextResponse.json({
      recentPatients,
      totalPatients: patients.length,
    })
  } catch (error) {
    console.error("Get recent patients error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
