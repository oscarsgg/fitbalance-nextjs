import { NextResponse } from "next/server"
import { DailyMealLogs } from "@/models/DailyMealLogs"

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Obtener todos los planes semanales del paciente para el historial de peso/altura
    const client = await import("@/lib/mongodb").then((m) => m.default)
    const db = (await client).db("fitbalance")

    // Obtener historial de peso y altura de WeeklyPlan
    const weightHistory = await db
      .collection("WeeklyPlan")
      .find({
        patient_id: new (await import("mongodb")).ObjectId(id),
        $or: [{ weight_kg: { $exists: true, $ne: null } }, { height_cm: { $exists: true, $ne: null } }],
      })
      .sort({ week_start: 1 })
      .toArray()

    // Procesar datos para las gráficas
    const processedWeightHistory = weightHistory.map((plan) => ({
      date: plan.week_start,
      weight: plan.weight_kg || null,
      height: plan.height_cm || null,
      week_start: plan.week_start,
    }))

    // Obtener logs de comidas recientes (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMealLogs = await DailyMealLogs.findByPatientAndDateRange(
      id,
      thirtyDaysAgo.toISOString(),
      new Date().toISOString(),
    )

    return NextResponse.json({
      success: true,
      data: {
        weightHistory: processedWeightHistory,
        recentMealLogs: recentMealLogs || [],
        totalWeightRecords: processedWeightHistory.length,
        totalMealLogs: recentMealLogs?.length || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching patient follow-up data:", error)
    return NextResponse.json({ error: "Failed to fetch follow-up data" }, { status: 500 })
  }
}
