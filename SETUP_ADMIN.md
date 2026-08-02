# 🔐 Setup Admin User - Instrucciones

## ⚡ Opción 1: Desde MongoDB Compass (Recomendado para la exposición)

1. **Abre MongoDB Compass**
   - Conecta a tu base de datos MongoDB
   - Navega a: `fitbalance` → `Nutritionist`

2. **Busca tu usuario**
   - Click en "Filter"
   - Escribe: `{ email: "tuEmail@example.com" }`
   - Click "Apply"

3. **Modifica el documento**
   - Haz click en el documento
   - Busca el campo `role`
   - Cambia de `"nutritionist"` a `"admin"`
   - Click en "Update"

4. **Verifica el cambio**
   - Deberías ver `role: "admin"` en el documento

---

## ⚡ Opción 2: Desde Mongo Shell

```bash
# Conectate a MongoDB
mongosh "mongodb+srv://tu-conexion"

# Selecciona la base de datos
use fitbalance

# Actualiza el usuario
db.Nutritionist.updateOne(
  { email: "tuEmail@example.com" },
  { $set: { role: "admin" } }
)

# Verifica el cambio
db.Nutritionist.findOne({ email: "tuEmail@example.com" })
```

---

## 📱 Prueba en el Navegador

1. **Limpia cookies** (importante):
   - Abre DevTools (F12)
   - Application → Cookies → Elimina el cookie `token`

2. **Login de nuevo**:
   - Ve a http://localhost:3000/login
   - Ingresa tus credenciales
   - Se generará un nuevo token con `role: "admin"`

3. **Accede al admin**:
   - Ve a http://localhost:3000/admin
   - ¡Deberías ver el dashboard admin!

---

## 🔍 Cómo Inspeccionar el Token (Para la Exposición)

### En la Consola del Navegador:
```javascript
// Ver el contenido de las cookies
document.cookie

// Deberías ver algo como:
// token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### En DevTools → Network:
1. Recarga la página (F5)
2. Busca la request `me` (GET /api/auth/me)
3. Abre la respuesta en "Response"
4. Verás JSON con: `{ id, email, name, role, specialization }`
5. Confirma que `role: "admin"`

---

## ✅ Checklist antes de la Exposición

- [ ] Usuario con `role: "admin"` creado en BD
- [ ] Limpiaste las cookies del navegador
- [ ] Hiciste login nuevamente
- [ ] Puedes acceder a http://localhost:3000/admin
- [ ] En DevTools → Network ves el role en la respuesta de /api/auth/me
- [ ] Si cambias el role a "nutritionist" y reloadas, eres redirigido a /dashboard
- [ ] La página admin muestra: "🔐 Rol: ADMIN"

---

## 🎯 Demo Script para la Exposición

1. **Mostrar el código del JWT**:
   - Abre `src/app/api/auth/login/route.js`
   - Muestra cómo se genera el token con `role`

2. **Mostrar la validación**:
   - Abre `src/app/admin/page.js`
   - Muestra el `if (userData.role === "admin")`

3. **Demostrar en vivo**:
   - Abre el navegador en /admin
   - Abre DevTools → Network
   - Recarga la página
   - Busca la request `me`
   - Muestra en la respuesta: `role: "admin"`

4. **Mostrar el cambio de rol**:
   - Abre MongoDB Compass
   - Cambia `role` de "admin" a "nutritionist"
   - En el navegador, recarga (limpiar cache si es necesario)
   - Serás redirigido a /dashboard automáticamente

---

## 💡 Explicación para la Exposición

```
"Como ves, el usuario tiene role: 'admin' en el JWT.
El frontend verifica este valor y si es 'admin',
muestra el dashboard. Si no, redirige automáticamente.

Esto es seguro porque:
- El JWT está firmado (no se puede modificar sin la clave secreta)
- Se almacena en cookie httpOnly (no accesible desde JavaScript)
- Se verifica en cada acceso
- Es el estándar de la industria
"
```

---

## 🚀 Ready to Go!

¡Ya estás listo para hacer la exposición! 🎉
