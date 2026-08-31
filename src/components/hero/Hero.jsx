'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../navbar/Navbar'
import { motion } from 'framer-motion'

const bgImage = {
  backgroundImage: 'url(/bg-slate.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}

const Hero = ({ lang, dictionary }) => {
  const router = useRouter()
  const { hero } = dictionary.landing

  return (
    <main style={bgImage}>
      <section className="min-h-[700px] w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <Navbar lang={lang} dictionary={dictionary} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center min-h-[700px]">
            <div className="text-gray-600 mt-[100px] md:mt-0 p-4 space-y-28">
              <motion.h1
                initial={{ opacity: 0, y: -100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 1 }}
                className="text-gray-800 text-7xl font-bold leading-tight ml-14"
              >
                {hero.name}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: -100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 1.2 }}
                className="relative"
              >
                <div className="relative z-10 space-y-4">
                  <h1 className="text-2xl font-bold">{hero.title}</h1>
                  <h1 className="text-sm opacity-55 leading-loose">{hero.description}</h1>
                  <div>
                    <button
                      onClick={() => router.push(`/${lang}/register`)}
                      className="mt-6 px-6 py-3 bg-[#9ed18a] hover:bg-[#8cbd78] text-white text-sm font-semibold rounded-md transition duration-300"
                    >
                      {hero.cta}
                    </button>
                  </div>
                </div>
                <div className="absolute -top-6 -left-10 w-[250px] h-[190px] bg-[#d5f3c8] ml-8" />
              </motion.div>
            </div>

            <div className="relative">
              <motion.img
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.4 }}
                src="/manzana.png"
                alt=""
                className="relative z-40 h-[400px] md:h-[550px] filter drop-shadow-lg"
              />

              <motion.div
                initial={{ opacity: 0, y: -100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.8 }}
                className="h-[180px] w-[180px] absolute top-50 -left-3 border-green-700/25 border-[20px] rounded-full z-10"
              />

              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.8 }}
                className="absolute -top-2 left-[240px] z-[1]"
              >
                <h1 className="text-[110px] scale-150 font-bold text-[#e6ffdb] leading-none">Fit Balance</h1>
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: -100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 1.2 }}
                className="text-gray-600 mt-[100px] md:mt-0 p-4 space-y-28"
              >
                <h1 className="opacity-0 text-gray-800 text-7xl font-bold leading-tight ml-14">{hero.name}</h1>
                <div className="relative">
                  <div className="relative z-10 space-y-4">
                    <h1 className="text-2xl font-bold">{hero.rightTitle}</h1>
                    <h1 className="text-sm opacity-55 leading-loose">{hero.rightDescription}</h1>
                  </div>
                  <div className="absolute -top-6 -left-10 w-[250px] h-[190px] bg-[#e6ffdb] ml-8" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Hero
