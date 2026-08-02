# 💻 Ejemplos de Código - Autenticación por Roles

## 1️⃣ Generación del JWT (Login)

**Archivo:** `src/app/api/auth/login/route.js`

```javascript
const token = jwt.sign(
  {
    id: nutritionist._id,                 // ← Cambio: nutritionistId → id
    email: nutritionist.email,
    name: nutritionist.name,
    specialization: nutritionist.specialization,
    role: nutritionist.role || "nutritionist",  // ← NUEVO: Role agregado
  },
  jwtSecret,
  { expiresIn: "7d" }
);
```

**Explicación:**
- El role se incluye en el payload del JWT
- Se firma con una clave secreta (no se puede modificar sin ella)
- Expira en 7 días

---

## 2️⃣ Verificación del Token

**Archivo:** `src/app/api/auth/me/route.js`

```javascript
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET
    const decoded = jwt.verify(token, jwtSecret)  // ← Verifica la firma

    return NextResponse.json({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || "nutritionist",
      specialization: decoded.specialization,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
```

**Explicación:**
- Lee el token del cookie
- Verifica que la firma sea válida
- Si es válido, retorna los datos del usuario (incluyendo el role)
- Si es inválido, retorna error 401

---

## 3️⃣ Protección de Ruta en Frontend

**Archivo:** `src/app/admin/page.js`

```javascript
"use client"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch("/api/auth/me")
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)

          // ← Verificación clave: ¿Tiene rol admin?
          if (userData.role === "admin") {
            setIsAdmin(true)  // ✅ Muestra admin dashboard
          } else {
            router.push("/dashboard")  // ❌ Redirige si no es admin
          }
        } else {
          router.push("/login")  // ❌ Redirige si no está autenticado
        }
      } catch (error) {
        router.push("/login")
      }
    }

    verifyAdmin()
  }, [])

  if (!isAdmin) {
    return null  // La redirección ocurrirá en useEffect
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Bienvenido, {user?.name}</p>
      <p>Rol: <strong>{user?.role}</strong></p>
    </div>
  )
}
```

**Explicación:**
- Al cargar la página, llama a `/api/auth/me`
- Verifica `userData.role === "admin"`
- Si es admin → Muestra contenido
- Si no es admin → Redirige a `/dashboard`

---

## 4️⃣ Componente Reutilizable para Proteger Rutas

**Archivo:** `src/components/ProtectedRoute.js`

```javascript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const response = await fetch("/api/auth/me")
        
        if (response.ok) {
          const userData = await response.json()

          if (requiredRole) {
            // Si requiere rol específico
            if (userData.role === requiredRole) {
              setHasAccess(true)
            } else {
              router.push("/dashboard")
            }
          } else {
            // Solo verifica autenticación
            setHasAccess(true)
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    verifyAccess()
  }, [requiredRole, router])

  if (loading) return <div>Cargando...</div>
  if (!hasAccess) return null

  return children
}
```

**Cómo usarlo:**

```javascript
// Solo autenticado
<ProtectedRoute>
  <MiComponente />
</ProtectedRoute>

// Solo admin
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Solo nutricionista
<ProtectedRoute requiredRole="nutritionist">
  <NutritionistPanel />
</ProtectedRoute>
```

---

## 5️⃣ Modelo Nutritionist Actualizado

**Archivo:** `src/models/Nutritionist.js`

```javascript
export class Nutritionist {
  constructor(data) {
    this.name = data.name
    this.email = data.email
    this.password = data.password
    // ... otros campos ...
    
    // ← NUEVO: Campo role
    this.role = data.role || "nutritionist"  // "admin" o "nutritionist"
    
    this.createdAt = data.createdAt || new Date()
    this.isActive = data.isActive !== undefined ? data.isActive : true
  }

  static async findByEmail(email) {
    // ... código de búsqueda ...
  }

  static async updateProfile(id, updateData) {
    // ... código de actualización ...
  }
}
```

---

## 6️⃣ Contexto de Autenticación (Opcional)

**Archivo:** `src/app/context/AuthContext.js`

```javascript
"use client"

import { createContext, useState, useEffect, useContext } from "react"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
```

**Cómo usarlo en un componente:**

```javascript
"use client"

import { useAuth } from "@/app/context/AuthContext"

export default function MiComponente() {
  const { user, loading } = useAuth()

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h1>Hola, {user?.name}</h1>
      <p>Tu rol es: {user?.role}</p>
    </div>
  )
}
```

---

## 7️⃣ Estructura de Respuesta API

**GET /api/auth/me - Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "role": "admin",
  "specialization": "Nutrición Deportiva"
}
```

---

## 8️⃣ Comparativa: Antes vs Después

### ANTES:

```javascript
// src/app/api/auth/login/route.js
const token = jwt.sign({
  nutritionistId: nutritionist._id,        // ← Nombre confuso
  email: nutritionist.email,
  name: nutritionist.name,
  specialization: nutritionist.specialization
  // ❌ No hay "role" - no se sabe quién es admin
}, jwtSecret)
```

### DESPUÉS:

```javascript
// src/app/api/auth/login/route.js
const token = jwt.sign({
  id: nutritionist._id,                    // ← Nombre estándar
  email: nutritionist.email,
  name: nutritionist.name,
  specialization: nutritionist.specialization,
  role: nutritionist.role || "nutritionist"  // ✅ Incluye role
}, jwtSecret)
```

---

## 🎯 Casos de Uso

### Caso 1: Proteger una ruta solo para admin

```javascript
// app/admin/settings/page.js
"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function AdminSettings() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>
        <h1>Configuración del Sistema</h1>
        {/* Solo admin puede ver esto */}
      </div>
    </ProtectedRoute>
  )
}
```

### Caso 2: Mostrar botón solo si es admin

```javascript
"use client"

import { useAuth } from "@/app/context/AuthContext"

export default function Navbar() {
  const { user } = useAuth()

  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      
      {/* Solo muestra si es admin */}
      {user?.role === "admin" && (
        <a href="/admin">Admin Panel</a>
      )}
    </nav>
  )
}
```

### Caso 3: Verificación en Server Action

```javascript
"use server"

import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function deleteUser(userId) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    throw new Error("No autorizado")
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // Solo admin puede hacer esto
  if (decoded.role !== "admin") {
    throw new Error("Solo admins pueden eliminar usuarios")
  }

  // ... resto del código ...
}
```

---

## 🚀 Summary

| Concepto | Antes | Después |
|----------|-------|---------|
| **JWT Field** | `nutritionistId` | `id` |
| **Role en JWT** | ❌ No existe | ✅ Incluido |
| **Validación** | Solo email/password | Role + email/password |
| **Admin Access** | ❌ No diferenciado | ✅ Verificado por role |
| **Escalabilidad** | Difícil agregar roles | Fácil agregar más roles |

¡Todo listo para la exposición! 🎉
