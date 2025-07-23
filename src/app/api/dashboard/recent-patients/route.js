import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Patient } from "@/models/Patient"; // Importar la clase Patient

export async function GET(request) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener pacientes para este nutricionista
    const patients = await Patient.findByNutritionist(decoded.nutritionistId);

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Get patients error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}