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
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)

          // Verificar si es admin
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // La redirección ocurrirá en useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Bienvenido, {user?.name}</p>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" })
              router.push("/login")
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Badge de rol */}
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-amber-500 text-amber-950 rounded-lg font-semibold">
            🔐 Rol: {user?.role?.toUpperCase()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Nutricionistas", value: stats.totalNutritionists, icon: "👨‍⚕️" },
            { label: "Total Pacientes", value: stats.totalPatients, icon: "👥" },
            { label: "Citas Activas", value: stats.activeAppointments, icon: "📅" },
            { label: "Estado del Sistema", value: stats.systemHealth, icon: "⚙️" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">⚙️ Gestión del Sistema</h2>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Ver Nutricionistas
              </button>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Ver Pacientes
              </button>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Reportes
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 Información de Rol</h2>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong>ID:</strong> {user?.id}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Rol:</strong> <span className="text-amber-400 font-semibold">{user?.role}</span>
              </p>
              <p className="text-sm text-slate-500 mt-4">
                ℹ️ Solo usuarios con rol "admin" pueden acceder a esta pantalla
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-300 mb-2">🔐 Sistema de Roles Implementado</h3>
          <ul className="text-blue-200 space-y-2 text-sm">
            <li>✅ JWT Token ahora contiene: id, email, name, role, specialization</li>
            <li>✅ Campo "role" puede ser: "admin" o "nutritionist"</li>
            <li>✅ Validación de acceso en el frontend (esta pantalla solo es para admins)</li>
            <li>✅ Token se verifica en cada acceso mediante /api/auth/me</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
