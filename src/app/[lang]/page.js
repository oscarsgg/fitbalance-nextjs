import { getDictionary, getSupportedLanguages } from '@/lib/i18n';

/**
 * Generate static params for all supported languages
 * Ensures all language variants are pre-rendered at build time
 * @returns {Promise<Array>} Array of language params
 */
export async function generateStaticParams() {
  return getSupportedLanguages().map((lang) => ({
    lang,
  }));
}

/**
 * Landing Page Component
 * Server Component that loads translations and renders language-specific content
 * 
 * @param {Object} props
 * @param {Object} props.params - Route parameters containing language code
 */
export default async function LandingPage({ params }) {
  const { lang } = await Promise.resolve(params);

  // Load translations for the landing page
  const dictionary = await getDictionary(lang, 'landing');

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {dictionary.hero?.title || 'Welcome'}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-4">
            {dictionary.hero?.subtitle || 'Your wellness partner'}
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {dictionary.hero?.description || 'Transform your health with personalized guidance.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">
              {dictionary.hero?.cta_primary || 'Get Started'}
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-3 rounded-lg font-semibold transition">
              {dictionary.hero?.cta_secondary || 'Learn More'}
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {dictionary.services?.title || 'Services'}
            </h2>
            <p className="text-lg text-gray-600">
              {dictionary.services?.subtitle || 'Our comprehensive solutions'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dictionary.services?.items?.map((item) => (
              <div key={item.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {dictionary.footer?.company || 'FitBalance'}
              </h3>
              <p className="text-sm text-gray-400">
                {dictionary.footer?.tagline || 'Your wellness partner'}
              </p>
            </div>

            {/* Footer Sections */}
            {dictionary.footer?.sections &&
              Object.entries(dictionary.footer.sections).map(([key, section]) => (
                <div key={key}>
                  <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links?.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-gray-400 hover:text-white transition text-sm"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            {dictionary.footer?.copyright || '© 2024 FitBalance. All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
}
