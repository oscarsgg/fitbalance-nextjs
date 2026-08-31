export const i18n = {
  defaultLocale: 'es',
  locales: ['es', 'en'],
}

export function isValidLocale(locale) {
  return i18n.locales.includes(locale)
}
