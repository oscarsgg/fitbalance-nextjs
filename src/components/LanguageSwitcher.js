import Link from 'next/link';
import { getLanguageNames, getSupportedLanguages } from '@/lib/i18n';

/**
 * Language Switcher Component
 * Server Component that allows users to switch between languages
 * Preserves the current route when switching languages
 * 
 * @param {Object} props
 * @param {string} props.lang - Current language code
 * @param {string} props.pathname - Current pathname
 */
export default function LanguageSwitcher({ lang, pathname }) {
  const languageNames = getLanguageNames();
  const supportedLanguages = getSupportedLanguages();

  /**
   * Constructs the new URL for a given language
   * Preserves the current route path
   * Example: /es/some/page -> /en/some/page
   */
  const getNewPathname = (newLang) => {
    // Split the pathname to remove the current language
    const segments = pathname.split('/').filter(Boolean);
    
    // If the first segment is the current language, replace it
    if (segments.length > 0 && segments[0] === lang) {
      segments[0] = newLang;
    } else {
      // If somehow the pathname doesn't start with the language, prepend the new language
      segments.unshift(newLang);
    }

    return '/' + segments.join('/');
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      {supportedLanguages.map((supportedLang) => (
        <Link
          key={supportedLang}
          href={getNewPathname(supportedLang)}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${
              lang === supportedLang
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-200'
            }
          `}
          title={`Switch to ${languageNames[supportedLang]}`}
        >
          {supportedLang.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
