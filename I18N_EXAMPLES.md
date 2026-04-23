# Ejemplos de Extensión - Sistema i18n

## 1. Agregar Nueva Página Multiidioma

### Paso 1: Crear estructura de carpetas
```bash
mkdir -p src/app/\[lang\]/auth
touch src/app/\[lang\]/auth/page.js
```

### Paso 2: Crear archivo de traducción para inglés
**`src/dictionaries/en/auth.json`**
```json
{
  "login": {
    "title": "Sign In",
    "subtitle": "Welcome back to FitBalance",
    "email": "Email address",
    "password": "Password",
    "submit": "Sign In",
    "forgot": "Forgot password?",
    "signup": "Don't have an account? Sign up"
  },
  "register": {
    "title": "Create Account",
    "name": "Full name",
    "email": "Email address",
    "password": "Password",
    "confirm": "Confirm password",
    "submit": "Create Account",
    "terms": "I agree to the terms and conditions",
    "signin": "Already have an account? Sign in"
  }
}
```

### Paso 3: Crear archivo de traducción para español
**`src/dictionaries/es/auth.json`**
```json
{
  "login": {
    "title": "Iniciar Sesión",
    "subtitle": "Bienvenido de vuelta a FitBalance",
    "email": "Dirección de correo",
    "password": "Contraseña",
    "submit": "Iniciar Sesión",
    "forgot": "¿Olvidaste tu contraseña?",
    "signup": "¿No tienes cuenta? Regístrate"
  },
  "register": {
    "title": "Crear Cuenta",
    "name": "Nombre completo",
    "email": "Dirección de correo",
    "password": "Contraseña",
    "confirm": "Confirmar contraseña",
    "submit": "Crear Cuenta",
    "terms": "Acepto los términos y condiciones",
    "signin": "¿Ya tienes cuenta? Inicia sesión"
  }
}
```

### Paso 4: Crear componente de página
**`src/app/[lang]/auth/page.js`**
```javascript
import { getDictionary } from '@/lib/i18n';

/**
 * Auth page component showing login and register forms
 */
export default async function AuthPage({ params }) {
  const { lang } = await Promise.resolve(params);
  const dictionary = await getDictionary(lang, 'auth');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {dictionary.login.title}
          </h2>
          <p className="text-gray-600 mb-6">{dictionary.login.subtitle}</p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dictionary.login.email}
              </label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dictionary.login.password}
              </label>
              <input
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {dictionary.login.submit}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {dictionary.login.signup}
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 2. Crear Componente Multiidioma

### Paso 1: Componente reutilizable con traducciones
**`src/components/ServiceCard.js`**
```javascript
/**
 * Reusable service card component
 * @param {Object} props
 * @param {string} props.title - Service title
 * @param {string} props.description - Service description
 * @param {string} props.icon - Icon emoji or class
 */
export default function ServiceCard({ title, description, icon = '⭐' }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
```

### Paso 2: Usar en landing page
**Actualizar `src/app/[lang]/page.js`**
```javascript
import { getDictionary, getSupportedLanguages } from '@/lib/i18n';
import ServiceCard from '@/components/ServiceCard';

// ... en el JSX de Services:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {dictionary.services?.items?.map((item) => (
    <ServiceCard
      key={item.id}
      title={item.title}
      description={item.description}
      icon={getIconForService(item.id)}
    />
  ))}
</div>

function getIconForService(serviceId) {
  const icons = {
    nutrition_planning: '🍽️',
    diet_tracking: '📊',
    expert_guidance: '👨‍⚕️',
    health_monitoring: '❤️',
  };
  return icons[serviceId] || '⭐';
}
```

## 3. Agregar Nuevo Idioma (Francés)

### Paso 1: Actualizar soportados idiomas
**`src/lib/i18n.js`**
```javascript
const SUPPORTED_LANGUAGES = ['es', 'en', 'fr']; // Agregar 'fr'

export function getLanguageNames() {
  return {
    es: 'Español',
    en: 'English',
    fr: 'Français', // Nuevo
  };
}
```

### Paso 2: Crear archivos de traducción
```bash
mkdir -p src/dictionaries/fr
touch src/dictionaries/fr/landing.json
```

**`src/dictionaries/fr/landing.json`**
```json
{
  "hero": {
    "title": "Bienvenue à FitBalance",
    "subtitle": "Votre Partenaire Personnel en Nutrition et Bien-être",
    "description": "Transformez votre santé avec des conseils nutritionnels personnalisés...",
    "cta_primary": "Commencer",
    "cta_secondary": "En Savoir Plus"
  },
  "services": {
    "title": "Nos Services",
    "subtitle": "Solutions nutritionnelles complètes adaptées à vos besoins",
    "items": [
      {
        "id": "nutrition_planning",
        "title": "Planification Nutritionnelle Personnalisée",
        "description": "Plans de repas personnalisés conçus spécifiquement..."
      }
      // ... resto de items en francés
    ]
  },
  "footer": {
    // ... resto en francés
  }
}
```

### Paso 3: ¡Listo! El LanguageSwitcher mostrará automáticamente FR

## 4. Usar Traducciones en Componentes Client (Avanzado)

Si necesitas traducciones en un Client Component, passa las traducciones como props desde el Server Component:

**`src/app/[lang]/page.js`** (Server Component)
```javascript
import LoginButton from '@/components/LoginButton';

const dictionary = await getDictionary(lang, 'landing');

return (
  <LoginButton 
    label={dictionary.hero.cta_primary}
    ariaLabel={`${dictionary.hero.title} - ${dictionary.hero.cta_primary}`}
  />
);
```

**`src/components/LoginButton.js`** (Client Component)
```javascript
'use client';

export default function LoginButton({ label, ariaLabel }) {
  const handleClick = () => {
    // El label viene del servidor, sin necesidad de hooks
    console.log('Clicked:', label);
  };

  return (
    <button 
      onClick={handleClick}
      aria-label={ariaLabel}
      className="bg-blue-600 text-white px-8 py-3 rounded-lg"
    >
      {label}
    </button>
  );
}
```

## 5. Crear Rutina de Blog Multiidioma

### Estructura esperada:
```
src/
├── app/[lang]/blog/
│   ├── page.js           # Lista de posts
│   └── [slug]/page.js    # Post individual
└── dictionaries/
    ├── en/
    │   ├── landing.json
    │   ├── blog.json     # Títulos, labels
    │   └── posts/
    │       ├── post-1.json
    │       └── post-2.json
    └── es/
        ├── landing.json
        ├── blog.json
        └── posts/
            ├── post-1.json
            └── post-2.json
```

### Blog listing page
**`src/app/[lang]/blog/page.js`**
```javascript
import { getDictionary } from '@/lib/i18n';

export default async function BlogPage({ params }) {
  const { lang } = await Promise.resolve(params);
  const dictionary = await getDictionary(lang, 'blog');

  const posts = [
    { slug: 'post-1', title: 'Nutrición Básica' },
    { slug: 'post-2', title: 'Plan Semanal' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">
        {dictionary.title}
      </h1>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="border rounded-lg p-6">
            <a href={`/${lang}/blog/${post.slug}`}>
              <h2 className="text-2xl font-bold text-blue-600 hover:underline">
                {post.title}
              </h2>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
```

## 6. Detectar Idioma del Navegador (Avanzado)

Crear middleware que redirija según `Accept-Language` header:

**`src/proxy.js`** - Versión mejorada
```javascript
import { NextResponse } from 'next/server';

const SUPPORTED_LANGS = ['es', 'en'];
const DEFAULT_LANG = 'es';

export default function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/') {
    // Obtener idioma preferido del navegador
    const acceptLanguage = request.headers.get('accept-language');
    let preferredLang = DEFAULT_LANG;

    if (acceptLanguage) {
      // Extraer primer idioma del header
      const lang = acceptLanguage.split(',')[0].split('-')[0];
      if (SUPPORTED_LANGS.includes(lang)) {
        preferredLang = lang;
      }
    }

    return NextResponse.redirect(new URL(`/${preferredLang}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
```

---

## ¿Preguntas?

Ver `I18N_IMPLEMENTATION.md` para documentación completa del sistema.
