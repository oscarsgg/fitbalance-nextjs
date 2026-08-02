# 📊 Guía de Exposición - Autenticación por Roles

## 🎯 Objetivo
Implementar un sistema simple de autenticación basado en roles usando JWT, donde se modifican los tokens para incluir información de rol y se protegen las rutas según el nivel de acceso.

---

## 📝 Estructura de la Solución

### 1️⃣ **Base de Datos - Campo Role**
```javascript
// Modelo Nutritionist
{
  name: "Juan Pérez",
  email: "juan@example.com",
  role: "admin",  // ← NUEVO: "admin" | "nutritionist"
  specialization: "Nutrición Deportiva",
  isActive: true,
  createdAt: Date
}
```

### 2️⃣ **JWT Token - Estructura Modificada**

**ANTES:**
```json
{
  "nutritionistId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "Usuario",
  "specialization": "Nutrición"
}
```

**AHORA:**
```json
{
  "id": "507f1f77bcf86cd799439011",        ← Cambio de nombre
  "email": "user@example.com",
  "name": "Usuario",
  "specialization": "Nutrición",
  "role": "admin"                          ← NUEVO ✨
}
```

### 3️⃣ **Flujo de Autenticación**

```
┌─────────────┐
│   LOGIN     │ usuario@example.com + password
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ POST /api/auth/login            │
│ • Verifica credenciales         │
│ • Obtiene "role" de BD          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Genera JWT con:                 │
│ • id, email, name               │
│ • specialization                │
│ • role ← ¡INCLUYE ROLE!        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Almacena en cookie httpOnly     │
│ (seguro del lado del cliente)   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Usuario navega a /admin         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ GET /api/auth/me                │
│ • Lee token del cookie          │
│ • Verifica firma JWT            │
│ • Decodifica payload            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Frontend verifica:              │
│ if (user.role === "admin")      │
└──────┬──────────────────────────┘
       │
    ┌──┴──┐
    │     │
   SÍ    NO
    │     │
    ▼     ▼
 MUESTRA REDIRIGE
 ADMIN    A /dashboard
```

---

## 🔧 Archivos Implementados

### 1. `/api/auth/login/route.js` - Generación del JWT
```javascript
const token = jwt.sign(
  {
    id: nutritionist._id,
    email: nutritionist.email,
    name: nutritionist.name,
    specialization: nutritionist.specialization,
    role: nutritionist.role || "nutritionist",  // ← SE INCLUYE EL ROLE
  },
  jwtSecret,
  { expiresIn: "7d" }
);
```

### 2. `/api/auth/me/route.js` - Verificación del Token
```javascript
// Verifica el token y retorna datos del usuario
GET /api/auth/me
// Response:
{
  "id": "507f...",
  "email": "user@example.com",
  "name": "Usuario",
  "role": "admin",
  "specialization": "Nutrición"
}
```

### 3. `/admin/page.js` - Dashboard Protegido
```javascript
// 1. Llama a /api/auth/me
const response = await fetch("/api/auth/me")

// 2. Verifica que sea admin
if (userData.role === "admin") {
  setIsAdmin(true)  // Muestra dashboard
} else {
  router.push("/dashboard")  // Redirige
}
```

### 4. `components/ProtectedRoute.js` - Componente Reutilizable
```javascript
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

---

## 🔑 Conceptos Clave

| Concepto | Explicación |
|----------|-------------|
| **JWT (JSON Web Token)** | Token firmado que contiene datos del usuario. No se puede modificar sin la clave secreta. |
| **Payload** | Los datos dentro del JWT (id, email, role, etc.) |
| **Cookie httpOnly** | No es accesible desde JavaScript (más seguro contra XSS) |
| **Role** | Campo que determina qué puede hacer el usuario (admin, nutritionist, etc.) |
| **Verificación en frontend** | Comprueba si user.role === "admin" ANTES de renderizar |

---

## 🚀 Cómo Demostrar en la Exposición

### Paso 1: Login con Usuario Admin
```
Email: admin@example.com
Password: ****
```

### Paso 2: Navegar a `/admin`
- ✅ Si es admin → Ves el dashboard
- ❌ Si no es admin → Eres redirigido

### Paso 3: Inspeccionar el Token (DevTools)
```javascript
// En la consola del navegador:
document.cookie  // Ver que existe "token"

// En Network → Ver request a /api/auth/me
// Verás el role en la respuesta JSON
```

### Paso 4: Explicar el Flujo
1. **Token generado** → Contiene role: "admin"
2. **Frontend verifica** → Comprueba if (user.role === "admin")
3. **Acceso protegido** → Solo admin puede ver /admin

---

## 💡 Ventajas de esta Implementación

✅ **Simple** - Solo 2-3 cambios en el código  
✅ **Seguro** - JWT es verificable, cookie es httpOnly  
✅ **Escalable** - Fácil agregar más roles  
✅ **Rápido** - No requiere llamadas a BD en cada validación  
✅ **Estándar** - JWT es industria estándar  

---

## 🔄 Extensiones Posibles

### Agregar más roles:
```javascript
role: "admin" | "nutritionist" | "patient" | "superadmin"
```

### Implementar permisos:
```javascript
const userCan = (action) => {
  const permissions = {
    admin: ["view-all", "edit-all", "delete-all"],
    nutritionist: ["view-own", "edit-own"],
    patient: ["view-own"]
  }
  return permissions[user.role]?.includes(action)
}
```

### Middleware para validar en servidor:
```javascript
// pages/admin.tsx
export async function getServerSideProps(context) {
  const token = context.req.cookies.token
  const decoded = jwt.verify(token, secret)
  
  if (decoded.role !== "admin") {
    return { redirect: "/dashboard" }
  }
  
  return { props: {} }
}
```

---

## 📚 Recursos Utilizados

- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Creación y verificación de JWT
- **Next.js** - Framework HTTP + Rutas
- **MongoDB** - Base de datos con campo `role`

---

## ✨ Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `models/Nutritionist.js` | ➕ Agregado campo `role` |
| `api/auth/login/route.js` | 🔄 JWT ahora incluye `role`, `id` en lugar de `nutritionistId` |
| `api/auth/me/route.js` | ✨ NUEVO: Endpoint para verificar token |
| `app/admin/page.js` | ✨ NUEVO: Dashboard admin protegido |
| `components/ProtectedRoute.js` | ✨ NUEVO: Componente para proteger rutas |

