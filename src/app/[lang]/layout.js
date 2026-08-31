import { notFound } from 'next/navigation'
import { i18n, isValidLocale } from '@/lib/i18n/config'

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    return {}
  }

  return {
    alternates: {
      canonical: `/${lang}`,
      languages: {
        es: '/es',
        en: '/en',
      },
    },
  }
}

export default async function LocaleLayout({ children, params }) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    notFound()
  }

  return children
}
