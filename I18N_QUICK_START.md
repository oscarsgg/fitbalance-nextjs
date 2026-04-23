# Guía Rápida - Sistema i18n

## 🚀 Inicio Rápido

### 1. Ejecutar el servidor dev
```bash
npm run dev
```

### 2. Visitar en el navegador
- **Español:** http://localhost:3000/es
- **Inglés:** http://localhost:3000/en
- **Root:** http://localhost:3000/ (redirige a /es)

### 3. Cambiar idioma
Haz clic en los botones **ES** o **EN** en el header

---

## 📁 Estructura Rápida

```
src/
├── app/[lang]/
│   ├── layout.js          ← Header + LanguageSwitcher
│   └── page.js            ← Landing page multiidioma
├── components/
│   └── LanguageSwitcher.js ← Botones de idioma
├── dictionaries/
│   ├── en/landing.json     ← Textos en inglés
│   └── es/landing.json     ← Textos en español
└── lib/
    └── i18n.js            ← Función getDictionary()
```

---

## 💡 Flujo de Uso

```javascript
// En tu componente Server:
export default async function Page({ params }) {
  const { lang } = await Promise.resolve(params);
  
  // Cargar traducciones
  const dict = await getDictionary(lang, 'landing');
  
  // Usar en JSX
  return <h1>{dict.hero.title}</h1>;
}
```

---

## ➕ Agregar Idiomas

### Paso 1: Editar `src/lib/i18n.js`
```javascript
const SUPPORTED_LANGUAGES = ['es', 'en', 'fr']; // Agregar 'fr'
```

### Paso 2: Crear JSON de traducciones
```bash
mkdir src/dictionaries/fr
touch src/dictionaries/fr/landing.json
```

### Paso 3: Copiar estructura y traducir
```json
{
  "hero": {
    "title": "Bienvenue...",
    "subtitle": "..."
  }
}
```

**¡Listo!** El nuevo idioma aparece en el selector.

---

## ➕ Agregar Páginas

### Paso 1: Crear página
```bash
mkdir -p src/app/\[lang\]/nueva-pagina
touch src/app/\[lang\]/nueva-pagina/page.js
```

### Paso 2: Crear traducciones
```bash
touch src/dictionaries/en/nueva-pagina.json
touch src/dictionaries/es/nueva-pagina.json
```

### Paso 3: Implementar página
```javascript
import { getDictionary } from '@/lib/i18n';

export default async function Page({ params }) {
  const { lang } = await Promise.resolve(params);
  const dict = await getDictionary(lang, 'nueva-pagina');
  
  return <h1>{dict.title}</h1>;
}
```

---

## 🔍 Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `src/lib/i18n.js` | `getDictionary()`, `isValidLang()` |
| `src/proxy.js` | Redirecciones automáticas |
| `src/app/[lang]/layout.js` | Header + LanguageSwitcher |
| `src/app/[lang]/page.js` | Landing page |
| `src/components/LanguageSwitcher.js` | Selector de idioma |
| `src/dictionaries/[lang]/[namespace].json` | Textos traducidos |

---

## ❌ Evitar Errores Comunes

### ❌ NO usar hooks en traducción
```javascript
// ❌ MALO
'use client';
const [dict, setDict] = useState(null);
useEffect(() => {
  getDictionary('es', 'landing').then(setDict);
}, []);
```

### ✅ SÍ usar async/await en Server Component
```javascript
// ✅ BUENO
export default async function Page({ params }) {
  const dict = await getDictionary(params.lang, 'landing');
}
```

### ❌ NO hardcodear idiomas
```javascript
// ❌ MALO
<html lang="es"> {/* Hardcodeado */}
```

### ✅ SÍ usar parámetro dinámico
```javascript
// ✅ BUENO
<html lang={lang}>
```

---

## 🧪 Verificación

### ¿Las traducciones cargan?
```javascript
// En la consola del servidor dev:
const dict = await getDictionary('es', 'landing');
console.log(dict.hero.title); // "Bienvenido a FitBalance"
```

### ¿El selector funciona?
- Haz clic en ES/EN en el header
- La URL debe cambiar: `/es` ↔ `/en`
- El contenido debe actualizar automáticamente

### ¿Los idiomas invalidos redirigen?
```bash
curl http://localhost:3000/fr
# Debe redirigir a /es
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- **`I18N_IMPLEMENTATION.md`** - Guía completa (features, flujo, best practices)
- **`I18N_EXAMPLES.md`** - Ejemplos de extensión (nuevas páginas, idiomas)
- **`IMPLEMENTATION_SUMMARY.md`** - Resumen técnico

---

## 🎯 Próximos Pasos

1. **Agregar más idiomas:** Seguir pasos "Agregar Idiomas"
2. **Nuevas páginas:** Seguir pasos "Agregar Páginas"  
3. **Optimizaciones:** Ver `I18N_EXAMPLES.md` para middleware avanzado

---

## ⚡ Tips & Tricks

### Obtener nombre nativo de idioma
```javascript
import { getLanguageNames } from '@/lib/i18n';
const names = getLanguageNames();
console.log(names.es); // "Español"
```

### Validar si idioma es soportado
```javascript
import { isValidLang } from '@/lib/i18n';
if (isValidLang(userLang)) {
  // Idioma válido
}
```

### Obtener lista de idiomas soportados
```javascript
import { getSupportedLanguages } from '@/lib/i18n';
const langs = getSupportedLanguages(); // ['es', 'en']
```

---

**¿Más ayuda?** Ver archivos de documentación o abrir issue en GitHub.
