/**
 * @typedef {('es' | 'en')} SupportedLanguage
 * @typedef {('landing' | 'auth' | 'dashboard' | 'nutrition')} SupportedNamespace
 */

const SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';

/**
 * Validates if a language code is supported
 * @param {string} lang - Language code to validate
 * @returns {boolean} True if language is supported
 */
export function isValidLang(lang) {
  return SUPPORTED_LANGUAGES.includes(lang);
}

/**
 * Gets the default language
 * @returns {SupportedLanguage} Default language code
 */
export function getDefaultLanguage() {
  return DEFAULT_LANGUAGE;
}

/**
 * Gets all supported languages
 * @returns {SupportedLanguage[]} Array of supported language codes
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Dynamically loads translation dictionary for a given language and namespace
 * @param {SupportedLanguage} lang - Language code
 * @param {SupportedNamespace} namespace - Translation namespace/module
 * @returns {Promise<Object>} Translation dictionary object
 * @throws {Error} If language or namespace is invalid
 */
export async function getDictionary(lang, namespace) {
  // Validate language
  if (!isValidLang(lang)) {
    console.warn(`[i18n] Invalid language: ${lang}, using default: ${DEFAULT_LANGUAGE}`);
    lang = DEFAULT_LANGUAGE;
  }

  try {
    // Dynamically import the translation file
    const dictionary = await import(`@/dictionaries/${lang}/${namespace}.json`, {
      assert: { type: 'json' },
    });
    return dictionary.default;
  } catch (error) {
    console.error(`[i18n] Failed to load dictionary: ${lang}/${namespace}`, error);
    // Return empty object as fallback
    return {};
  }
}

/**
 * Gets all supported languages with their native names
 * @returns {Object} Object with language codes as keys and native names as values
 */
export function getLanguageNames() {
  return {
    es: 'Español',
    en: 'English',
  };
}
