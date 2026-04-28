'use client'

import React from 'react'
import Link from 'next/link'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

export default function Navbar({ lang, dictionary }) {
  return (
    <nav className="absolute top-0 left-0 w-full pt-4 pb-4 z-20 bg-[#b2e29f] backdrop-blur-sm text-gray-700 rounded-b-xl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <img
              src="/logo1.png"
              alt="FitBalance Logo"
              className="h-14 w-auto mr-3 rounded-full border-2 border-white"
            />
            <h1 className="text-xl sm:text-2xl font-bold">{dictionary.common.brand}</h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLang={lang} labels={dictionary.common.languages} />
            <Link href={`/${lang}/login`}>
              <button className="px-4 py-2 text-sm font-medium text-gray-800 hover:text-white hover:bg-green-600/70 rounded-md transition">
                {dictionary.common.nav.login}
              </button>
            </Link>
            <Link href={`/${lang}/register`}>
              <button className="px-4 py-2 text-sm font-medium bg-green-700/60 text-white hover:bg-green-700/80 rounded-md transition">
                {dictionary.common.nav.register}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
