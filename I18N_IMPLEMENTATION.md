# Sistema de Internacionalización (i18n) - FitBalance

## Overview

Sistema de i18n implementado en Next.js 16+ utilizando rutas dinámicas `[lang]` sin dependencias externas. Soporta múltiples idiomas (actualmente ES y EN) con traducción estática basada en JSON.

## Estructura de Archivos

```
src/
├── app/
│   ├── layout.js                 # Layout raíz (mínimo)
│   ├── page.js                   # Redirige a idioma por defecto
│   ├── [lang]/
│   │   ├── layout.js             # Layout con contexto de idioma
│   │   └── page.js               # Landing page multiidioma
│   └── api/                       # Rutas de API (sin traducción)
├── components/
│   └── LanguageSwitcher.js       # Selector de idioma (Server Component)
├── dictionaries/
│   ├── en/
│   │   └── landing.json          # Traducciones EN
│   └── es/
│       └── landing.json          # Traducciones ES
├── lib/
│   └── i18n.js                   # Utilidades de i18n
├── proxy.js                       # Redirecciones dinámicas
└── middleware.js                  # (Opcional, deprecated en Next.js 16)
```

## Características Principales

### 1. **Routing Dinámico**
- Rutas organizadas bajo `/[lang]/` para soporte multiidioma
- Soporta: `/es/`, `/en/`
- Root `/` redirige a `/es` (idioma por defecto)

### 2. **Traductor (getDictionary)**
```javascript
// Uso en Server Components
const dictionary = await getDictionary('es', 'landing');
console.log(dictionary.hero.title); // "Bienvenido a FitBalance"
```

**Características:**
- Carga dinámica de JSON desde `dictionaries/[lang]/[namespace].json`
- Server-side only (sin hooks innecesarios)
- Validación de idioma y namespace
- Fallback a idioma por defecto si es inválido

### 3. **Language Switcher**
Componente Server que permite cambiar idioma preservando la ruta actual:
```javascript
<LanguageSwitcher lang="es" pathname="/es/some/page" />
```

**Comportamiento:**
- `/es/some/page` → `/en/some/page` (al hacer clic en EN)
- Links en lugar de botones para SEO
- Estilos activos basados en idioma actual

### 4. **Proxy/Middleware**
```javascript
// src/proxy.js - Next.js 16+
// Redirecciones automáticas:
// / → /es (idioma por defecto)
// /fr → /es (idioma inválido)
// /some/path → /es/some/path (sin idioma)
```

**Matcher:**
- Excluye rutas de API (`/api/...`)
- Excluye Next.js internals (`/_next/...`)
- Excluye archivos estáticos (`.png`, `.js`, etc.)

### 5. **SEO & Metadata**
Cada página incluye:
- `html[lang="[lang]"]` para accesibilidad
- `alternates.languages` para búsqueda multiidioma
- Metadata localizada (títulos, descripciones)

```javascript
// En [lang]/layout.js
alternates: {
  languages: {
    es: 'https://domain.com/es',
    en: 'https://domain.com/en',
  },
}
```

### 6. **Static Generation**
Ambas variantes de idioma se pre-generan en build:
```javascript
export async function generateStaticParams() {
  return getSupportedLanguages().map((lang) => ({ lang }));
}
```

## Archivos Principales

### `src/lib/i18n.js`
Proporciona utilidades:
- `getDictionary(lang, namespace)` - Carga traducciones
- `isValidLang(lang)` - Valida código de idioma
- `getSupportedLanguages()` - Lista idiomas soportados
- `getLanguageNames()` - Nombres nativos de idiomas

### `src/dictionaries/[lang]/[namespace].json`
Estructura de ejemplo:
```json
{
  "hero": {
    "title": "Welcome to FitBalance",
    "subtitle": "Your Personal Nutrition Partner",
    "description": "...",
    "cta_primary": "Get Started"
  },
  "services": {
    "title": "Our Services",
    "items": [...]
  },
  "footer": {...}
}
```

### `src/components/LanguageSwitcher.js`
Server Component que:
- Recibe `lang` y `pathname` como props
- Genera enlaces a `/[newLang]/...` manteniendo path
- Muestra estado activo visualmente
- Sin JavaScript del cliente necesario

### `src/app/[lang]/layout.js`
Layout language-aware que:
- Valida el parámetro `lang` (404 si es inválido)
- Proporciona header con LanguageSwitcher
- Configura `lang` en HTML para SEO
- Genera metadata multiidioma

### `src/app/[lang]/page.js`
Landing page que:
- Carga traducciones con `await getDictionary(lang, 'landing')`
- Usa Server Component (sin 'use client')
- Pre-renderiza contenido estático
- Renderiza traducidos textos, servicios, footer

## Flujo de Traducción

```
User visits /es
    ↓
[lang] = 'es' (extraído de URL)
    ↓
[lang]/layout.js
  - isValidLang('es') ✓
  - metadata.alternates configurado
  - html[lang="es"]
    ↓
[lang]/page.js
  - const dict = await getDictionary('es', 'landing')
  - Renderiza con dict.hero.title, dict.services, etc.
```

## Agregar Nuevos Idiomas

### Paso 1: Actualizar `src/lib/i18n.js`
```javascript
const SUPPORTED_LANGUAGES = ['es', 'en', 'fr']; // Agregar 'fr'
```

### Paso 2: Crear ficheros de traducción
```
src/dictionaries/
├── fr/
│   └── landing.json  # Nuevo idioma
```

### Paso 3: Opcional - Agregar nombre nativo
```javascript
export function getLanguageNames() {
  return {
    es: 'Español',
    en: 'English',
    fr: 'Français', // Nuevo
  };
}
```

## Agregar Nuevos Namespaces

### Paso 1: Crear archivos de traducción
```
src/dictionaries/
├── en/
│   ├── landing.json
│   ├── auth.json      # Nuevo
│   └── dashboard.json # Nuevo
├── es/
│   ├── landing.json
│   ├── auth.json      # Nuevo
│   └── dashboard.json # Nuevo
```

### Paso 2: Usar en componentes
```javascript
// En src/app/[lang]/auth/page.js
const authDict = await getDictionary(lang, 'auth');
```

## Best Practices

✅ **DO:**
- Usar Server Components para cargar traducciones
- Colocar `getDictionary()` en el nivel superior del componente
- Pre-renderizar todas las rutas de idioma
- Validar `lang` en layouts
- Usar JSDoc comments para type hints

❌ **DON'T:**
- Cargar traducciones en Client Components con hooks
- Guardar idioma en localStorage/cookies
- Hacer requests de traducción en el cliente
- Olvidar configurar metadata.alternates
- Usar librerías externas de i18n

## Testing

### Probar rutas de idioma
```bash
# Español (por defecto)
curl http://localhost:3000/es

# Inglés
curl http://localhost:3000/en

# Inválido (redirige a /es)
curl http://localhost:3000/fr

# Root (redirige a /es)
curl http://localhost:3000/
```

### Cambiar idioma
- Click en botones ES/EN en header
- Verifica que la URL cambia (ej: /es → /en)
- Verifica que contenido se actualiza

## Próximos Pasos

Para expandir el sistema:

1. **Agregar más páginas:**
   - Crear `/app/[lang]/auth/page.js`
   - Crear `/app/[lang]/dashboard/page.js`
   - Agregar sus diccionarios en `dictionaries/[lang]/`

2. **Agregar más idiomas:**
   - Seguir pasos en "Agregar Nuevos Idiomas"
   - Copiar JSON existente y traducir

3. **Optimizaciones avanzadas:**
   - Detectar idioma preferido del navegador (Accept-Language header)
   - Agregar cookie de preferencia de idioma
   - Implementar búsqueda en múltiples idiomas

4. **Contenido dinámico:**
   - Agregar base de datos con traducciones
   - Usar `unstable_cache` para caché de BD
   - Mantener fallback a JSON para SSG

## Referencias

- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [Next.js Internationalization](https://nextjs.org/docs/pages/building-your-application/routing/internationalization-routing)
- [Next.js Static Generation](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic)
- [Server Components](https://react.dev/reference/rsc/server-components)
