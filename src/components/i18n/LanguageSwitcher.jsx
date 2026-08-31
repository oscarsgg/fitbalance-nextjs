'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SUPPORTED_LOCALES = ['es', 'en']

export default function LanguageSwitcher({ currentLang, labels }) {
  const pathname = usePathname()

  const buildLocalizedPath = (newLang) => {
    const segments = pathname.split('/').filter(Boolean)

    if (segments.length === 0) {
      return `/${newLang}`
    }

    if (SUPPORTED_LOCALES.includes(segments[0])) {
      segments[0] = newLang
      return `/${segments.join('/')}`
    }

    return `/${newLang}/${segments.join('/')}`
  }

  return (
    <div className="flex items-center gap-2">
      {SUPPORTED_LOCALES.map((lang) => {
        const isActive = lang === currentLang

        return (
          <Link
            key={lang}
            href={buildLocalizedPath(lang)}
            className={`px-3 py-1 text-xs rounded-md border transition ${
              isActive
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white/70 text-gray-800 border-white hover:bg-white'
            }`}
          >
            {labels?.[lang] ?? lang.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}
