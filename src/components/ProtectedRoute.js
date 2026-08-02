"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)

          // Si requiere un rol específico, verificar
          if (requiredRole) {
            if (userData.role === requiredRole) {
              setHasAccess(true)
            } else {
              router.push("/dashboard")
            }
          } else {
            // Solo verificar que esté autenticado
            setHasAccess(true)
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    verifyAccess()
  }, [requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return children
}
