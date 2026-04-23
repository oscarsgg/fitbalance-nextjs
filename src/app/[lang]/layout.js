import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getSupportedLanguages, isValidLang } from '@/lib/i18n';

/**
 * Generate static params for all supported languages
 * Enables static generation for all language variants
 * @returns {Promise<Array>} Array of language params
 */
export async function generateStaticParams() {
  return getSupportedLanguages().map((lang) => ({
    lang,
  }));
}

/**
 * Generate metadata for language-specific pages
 * Includes alternates.languages for proper SEO and language negotiation
 * 
 * @param {Object} props
 * @param {string} props.params - Route parameters
 * @returns {Object} Metadata object
 */
export async function generateMetadata({ params }) {
  const { lang } = await Promise.resolve(params);
  
  const baseMetadata = {
    title: 'FitBalance',
    description: 'Personalized nutrition guidance and wellness support',
  };

  // Add language-specific metadata
  const languageMetadata = {
    en: {
      title: 'FitBalance - Your Personal Nutrition & Wellness Partner',
      description: 'Transform your health with personalized nutrition guidance, meal planning, and expert support from certified nutritionists.',
    },
    es: {
      title: 'FitBalance - Tu Socio Personal en Nutrición y Bienestar',
      description: 'Transforma tu salud con guía nutricional personalizada, planificación de comidas y apoyo experto de nutricionistas certificados.',
    },
  };

  const metadata = {
    ...baseMetadata,
    ...languageMetadata[lang],
    // Add alternates for language versions (important for SEO)
    alternates: {
      languages: {
        es: 'https://fitbalance.example.com/es',
        en: 'https://fitbalance.example.com/en',
      },
    },
  };

  return metadata;
}

/**
 * Language-specific Layout Component
 * Provides language context and UI chrome (header with language switcher, etc.)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.params - Route parameters
 */
export default async function LangLayout({ children, params }) {
  const { lang } = await Promise.resolve(params);

  // Validate language parameter - show 404 if invalid
  if (!isValidLang(lang)) {
    notFound();
  }

  return (
    <html lang={lang}>
      <body>
        {/* Header with Language Switcher */}
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo/Brand */}
              <div className="text-2xl font-bold text-blue-600">
                FitBalance
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher lang={lang} pathname={`/${lang}`} />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
