# ✅ Checklist - Exposición de Autenticación por Roles

## 📋 Preparación (Hacer 1 día antes)

- [ ] **Crear usuario admin en la BD**
  - Abre MongoDB Compass o Mongo Shell
  - Encuentra tu usuario
  - Cambia `role` de "nutritionist" a "admin"
  - Verifica que se actualizó

- [ ] **Limpiar cookies del navegador**
  - DevTools → Application → Cookies
  - Elimina el cookie `token`

- [ ] **Login con el usuario admin**
  - Ve a http://localhost:3000/login
  - Ingresa credenciales
  - Verifica que redirecciona correctamente

- [ ] **Pruebar acceso a /admin**
  - Navega a http://localhost:3000/admin
  - Deberías ver el dashboard admin
  - Verifica que muestra "🔐 Rol: ADMIN"

- [ ] **Revisar la documentación**
  - Imprime o ten abierta: GUIA_EXPOSICION.md
  - Ten lista: EJEMPLOS_CODIGO.md
  - Ten visible: Diagrama de flujo

---

## 🎬 Durante la Exposición (30 minutos aprox)

### 1️⃣ Introducción (3 minutos)

- [ ] **Explica el objetivo**
  - "Voy a mostrar cómo implementar autenticación por roles"
  - "Usando JWT tokens y validación en frontend"
  - "Sistema simple pero profesional"

- [ ] **Muestra la estructura**
  - DB tiene campo `role`
  - JWT incluye el `role`
  - Frontend valida según el `role`

### 2️⃣ Mostrar el Código (10 minutos)

**Pantalla 1: JWT Generation**
- [ ] Abre `src/app/api/auth/login/route.js`
- [ ] Muestra cómo se genera el JWT con `role`
- [ ] Destaca: `role: nutritionist.role || "nutritionist"`
- [ ] Explica: "Se incluye en el payload firmado"

**Pantalla 2: Token Verification**
- [ ] Abre `src/app/api/auth/me/route.js`
- [ ] Muestra cómo se verifica el JWT
- [ ] Destaca: `jwt.verify(token, jwtSecret)`
- [ ] Explica: "Se valida la firma, se retorna el role"

**Pantalla 3: Frontend Protection**
- [ ] Abre `src/app/admin/page.js`
- [ ] Muestra el `useEffect` que llama a `/api/auth/me`
- [ ] Destaca: `if (userData.role === "admin")`
- [ ] Explica: "Si no es admin, redirige a /dashboard"

**Pantalla 4: Reusable Component**
- [ ] Abre `src/components/ProtectedRoute.js`
- [ ] Muestra cómo se puede reutilizar
- [ ] Ejemplo: `<ProtectedRoute requiredRole="admin">`
- [ ] Explica: "Podemos proteger cualquier ruta"

### 3️⃣ Demo en Vivo (12 minutos)

**Demo 1: Inspeccionar el Token**
- [ ] Abre el navegador en http://localhost:3000/admin
- [ ] Abre DevTools (F12)
- [ ] Ve a: Application → Cookies → token
- [ ] Muestra que existe el cookie `token`
- [ ] Di: "Este es el JWT firmado y seguro"

**Demo 2: Ver la Respuesta de /api/auth/me**
- [ ] En DevTools → Network
- [ ] Recarga la página (F5)
- [ ] Busca la request `me`
- [ ] Haz click en ella
- [ ] Ve a "Response"
- [ ] Muestra el JSON con `role: "admin"`
- [ ] Di: "Aquí ves el role verificado del servidor"

**Demo 3: Probar Redireccionamiento**
- [ ] Abre MongoDB Compass
- [ ] Cambia `role` de "admin" a "nutritionist"
- [ ] Vuelve al navegador
- [ ] Recarga http://localhost:3000/admin
- [ ] Serás redirigido a /dashboard
- [ ] Di: "El sistema valida en tiempo real"

**Demo 4: Limpiar y Cambiar Rol de Vuelta**
- [ ] En MongoDB Compass
- [ ] Cambia `role` de "nutritionist" a "admin"
- [ ] En el navegador, limpia el cache
- [ ] Recarga /admin
- [ ] Ahora sí tienes acceso
- [ ] Di: "El sistema funciona dinámicamente"

### 4️⃣ Explicar Ventajas (5 minutos)

- [ ] **Seguridad**
  - JWT está firmado
  - Cookie es httpOnly
  - No se puede modificar sin la clave secreta

- [ ] **Escalabilidad**
  - Fácil agregar más roles
  - Fácil agregar permisos específicos
  - Estándar de la industria

- [ ] **Performance**
  - No requiere llamada a BD en cada validación
  - Info del usuario está en el token
  - Verificación local es rápida

- [ ] **Flexibilidad**
  - Validación en frontend o backend
  - Componentes reutilizables
  - Fácil de testear

---

## 📊 Puntos Clave a Destacar

```
1. JWT MODIFICADO
   Antes: nutritionistId, email, name, specialization
   Ahora: id, email, name, specialization, role ← ¡NUEVO!

2. VALIDACIÓN EN FRONTEND
   El frontend verifica: if (user.role === "admin")
   Si es true → muestra contenido
   Si es false → redirige

3. SEGURIDAD
   - Token firmado (no se puede modificar)
   - Cookie httpOnly (protegido contra XSS)
   - Verifica en cada acceso

4. ESCALABILIDAD
   - 2 roles ahora: "admin", "nutritionist"
   - Fácil agregar más: "patient", "superadmin", etc.
   - Estructura lista para evolucionar
```

---

## 🎤 Frases Útiles

```javascript
"El JWT es un token JSON firmado. 
Contiene información del usuario y no se puede modificar 
sin la clave secreta."

"El role se incluye en el payload del JWT.
Cuando el usuario accede a /admin, validamos que sea 'admin'."

"Si no es admin, automáticamente lo redirigimos a /dashboard.
Esto ocurre sin recarga de página, muy rápido."

"Este sistema es seguro porque:
1. El JWT está firmado
2. Se almacena en cookie httpOnly
3. Se verifica en cada acceso
4. Es el estándar de la industria"

"Es escalable porque puedo agregar más roles fácilmente.
Por ejemplo: 'patient', 'superadmin', etc.
Solo cambio el valor y listo."
```

---

## 🚨 Si Algo Falla

### El servidor no inicia
```bash
# Reinicia el servidor
npm run dev

# Si sigue con error, borra node_modules
rm -rf node_modules
npm install
npm run dev
```

### No puedo acceder a /admin
- Verifica que creaste el usuario admin en la BD
- Limpia el cookie del navegador
- Login nuevamente
- Recarga /admin

### No veo el JWT en DevTools
- Abre DevTools (F12)
- Application → Cookies
- Si el cookie `token` no existe:
  - Haz login nuevamente
  - Verifica que sea usuario admin

### La respuesta de /api/auth/me no muestra role
- Asegúrate de que el usuario tiene `role: "admin"` en la BD
- Limpia el cache del navegador (Ctrl+Shift+Delete)
- Haz login nuevamente

---

## 💡 Alternativas para Explicar

Si alguien pregunta "¿Por qué no verificas en el servidor?"

**Respuesta:**
"Podríamos, pero es ineficiente. Cada acceso requeriría una llamada a BD.
Con JWT, toda la información está en el token, firmado y seguro.
Es el patrón de autenticación moderna."

---

## 📸 Screenshots Útiles

Toma screenshots de:
- [ ] Código del JWT en login/route.js
- [ ] Código de validación en admin/page.js
- [ ] DevTools mostrando el JWT response
- [ ] Dashboard admin cargado correctamente
- [ ] Error cuando no eres admin

---

## 🎯 Objetivo Final

Al terminar la exposición, la gente debe entender:

✅ Qué es un JWT y cómo se genera  
✅ Por qué se incluye el `role` en el JWT  
✅ Cómo el frontend valida el role  
✅ Por qué es seguro y escalable  
✅ Cómo implementarlo en sus proyectos  

---

## ⏱️ Timeline Recomendado

| Tiempo | Actividad |
|--------|-----------|
| 0:00 - 0:03 | Introducción |
| 0:03 - 0:13 | Mostrar código |
| 0:13 - 0:25 | Demo en vivo |
| 0:25 - 0:30 | Preguntas y ventajas |
| 0:30 | Fin |

---

## 🎓 Recursos de Referencia

📄 Archivos creados:
- GUIA_EXPOSICION.md - Guía visual
- EJEMPLOS_CODIGO.md - Código con explicaciones
- SETUP_ADMIN.md - Cómo crear admin
- ROLES_IMPLEMENTATION.md - Detalles técnicos
- auth-flow-diagram.png - Diagrama visual

---

## ✨ ¡Listo para triunfar!

Has implementado un sistema de autenticación por roles profesional.
Tienes código limpio, documentación completa, y un demo funcional.

**¡Mucho éxito en tu exposición! 🚀**
