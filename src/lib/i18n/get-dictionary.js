import { i18n, isValidLocale } from './config'

const dictionaries = {
  en: {
    landing: () => import('../../../dictionaries/en/landing.json').then((module) => module.default),
    common: () => import('../../../dictionaries/en/common.json').then((module) => module.default),
  },
  es: {
    landing: () => import('../../../dictionaries/es/landing.json').then((module) => module.default),
    common: () => import('../../../dictionaries/es/common.json').then((module) => module.default),
  },
}

export async function getDictionary(locale) {
  const normalizedLocale = isValidLocale(locale) ? locale : i18n.defaultLocale
  const loaders = dictionaries[normalizedLocale]
  const [landing, common] = await Promise.all([loaders.landing(), loaders.common()])

  return {
    landing,
    common,
  }
}
