"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalNutritionists: 42,
    totalPatients: 328,
    activeAppointments: 15,
    systemHealth: "✅ Operational",
  })

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Solo decodificar el JWT, sin consultar BD
        const response = await fetch("/api/auth/check-role")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)

          // Verificar si es admin leyendo directamente el token
          if (userData.role === "admin") {
            setIsAdmin(true)
          } else {
            // Redirigir si no es admin
            router.push("/dashboard")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    verifyAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b] flex items-center justify-center">
        <div className="text-green-800 text-xl font-semibold">Cargando...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // La redirección ocurrirá en useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      {/* Header */}
      <header className="bg-white/80 border-b border-green-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Admin Dashboard</h1>
            <p className="text-green-600 text-sm">Bienvenido, {user?.name}</p>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" })
              router.push("/login")
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Badge de rol */}
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg font-semibold shadow-md">
            🔐 Rol: {user?.role?.toUpperCase()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Nutricionistas", value: stats.totalNutritionists, icon: "👨‍⚕️", color: "bg-emerald-100" },
            { label: "Total Pacientes", value: stats.totalPatients, icon: "👥", color: "bg-green-100" },
            { label: "Citas Activas", value: stats.activeAppointments, icon: "📅", color: "bg-lime-100" },
            { label: "Estado del Sistema", value: stats.systemHealth, icon: "⚙️", color: "bg-teal-100" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/85 border border-green-200 rounded-lg p-6 hover:shadow-lg hover:border-green-300 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stat.value}</p>
                </div>
                <div className={`text-4xl p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/85 border border-green-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-green-900 mb-4">⚙️ Gestión del Sistema</h2>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white rounded-lg transition font-medium">
                Ver Nutricionistas
              </button>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white rounded-lg transition font-medium">
                Ver Pacientes
              </button>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white rounded-lg transition font-medium">
                Reportes
              </button>
            </div>
          </div>

          <div className="bg-white/85 border border-green-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-green-900 mb-4">📊 Información de Rol</h2>
            <div className="space-y-2 text-green-800">
              <p>
                <strong>ID:</strong> <span className="text-green-700 text-sm">{user?.id?.toString().slice(0, 12)}...</span>
              </p>
              <p>
                <strong>Email:</strong> <span className="text-green-700">{user?.email}</span>
              </p>
              <p>
                <strong>Nombre:</strong> <span className="text-green-700">{user?.name} {user?.lastName}</span>
              </p>
              <p>
                <strong>Rol:</strong> <span className="bg-green-200 text-green-900 px-2 py-1 rounded font-semibold text-sm">{user?.role}</span>
              </p>
              <p className="text-sm text-green-700 mt-4 bg-green-50 p-2 rounded">
                ℹ️ Solo usuarios con rol "admin" pueden acceder a esta pantalla
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-green-50 border-2 border-green-400 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-green-800 mb-2">🔐 Sistema de Roles Implementado</h3>
          <ul className="text-green-700 space-y-2 text-sm">
            <li>✅ JWT Token ahora contiene: id, email, name, role, specialization</li>
            <li>✅ Campo "role" puede ser: "admin" o "nutritionist"</li>
            <li>✅ Validación de acceso en el frontend (esta pantalla solo es para admins)</li>
            <li>✅ Token se verifica SIN consultar BD mediante /api/auth/check-role</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
