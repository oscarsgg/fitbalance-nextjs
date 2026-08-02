# 🔐 Autenticación por Roles - Implementación

## Resumen de Cambios

### 1. **Modelo Nutritionist** (`src/models/Nutritionist.js`)
```javascript
this.role = data.role || "nutritionist" // "admin" o "nutritionist"
```
Se agregó el campo `role` con valor por defecto "nutritionist"

### 2. **JWT Token** (`src/app/api/auth/login/route.js`)
**Antes:**
```javascript
{
  nutritionistId: nutritionist._id,
  email: nutritionist.email,
  name: nutritionist.name,
  specialization: nutritionist.specialization,
}
```

**Después:**
```javascript
{
  id: nutritionist._id,           // Cambio de nombre
  email: nutritionist.email,
  name: nutritionist.name,
  specialization: nutritionist.specialization,
  role: nutritionist.role || "nutritionist"  // ✨ NUEVO
}
```

### 3. **Endpoint de Verificación** (`src/app/api/auth/me/route.js`)
Nuevo endpoint que:
- Verifica el token JWT del cookie
- Decodifica el token
- Retorna la información del usuario incluyendo el `role`

```bash
GET /api/auth/me
# Retorna: { id, email, name, role, specialization }
```

### 4. **Pantalla Admin** (`src/app/admin/page.js`)
- Dashboard exclusivo para usuarios con rol "admin"
- Valida el rol antes de mostrar contenido
- Redirige a `/dashboard` si el usuario NO es admin
- Muestra estadísticas y botones de gestión

### 5. **Componente ProtectedRoute** (`src/components/ProtectedRoute.js`)
Para proteger cualquier ruta:

```javascript
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Solo Admin</div>
    </ProtectedRoute>
  )
}
```

## 🔄 Flujo de Autenticación por Roles

```
1. Usuario inicia sesión en /login
   ↓
2. POST /api/auth/login verifica credenciales
   ↓
3. Se genera JWT con: { id, email, name, role, specialization }
   ↓
4. Token se almacena en cookie httpOnly (seguro)
   ↓
5. Usuario accede a ruta protegida
   ↓
6. Frontend llama a GET /api/auth/me
   ↓
7. Backend verifica JWT y retorna datos del usuario
   ↓
8. Frontend comprueba if (user.role === "admin")
   ↓
9. Si es admin → Muestra AdminPage
   Si no → Redirige a /dashboard
```

## 🚀 Cómo Probar

### Para crear un usuario admin (en MongoDB):
```javascript
db.Nutritionist.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Acceder a Admin Dashboard:
1. Ir a `http://localhost:3000/admin`
2. Si tienes rol "admin" → Ves el dashboard
3. Si no → Eres redirigido a `/dashboard`

## 📋 Puntos Clave para la Exposición

- ✅ **JWT Payload Modificado**: Cambio de `nutritionistId` → `id` + agregación de `role`
- ✅ **Validación en Frontend**: Verificación de rol antes de renderizar
- ✅ **Token Seguro**: Almacenado en cookie `httpOnly`
- ✅ **Redireccionamiento**: Protección de rutas según rol
- ✅ **Escalable**: Fácil agregar más roles ("nutricionista", "paciente", "super-admin", etc.)

## 🔧 Próximos Pasos (Opcional)

1. Crear un rol "paciente" y proteger rutas del paciente
2. Agregar middleware para validar roles en el servidor
3. Implementar control de acceso más granular (permisos específicos)
4. Dashboard de admin para cambiar roles de otros usuarios
