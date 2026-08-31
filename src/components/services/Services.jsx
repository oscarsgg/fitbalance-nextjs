'use client'

import React from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 10,
      ease: 'easeInOut',
    },
  },
}

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.6,
      staggerChildren: 0.4,
    },
  },
}

const bannerStyle = {
  backgroundImage: 'url(/app-banner.png)',
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100%',
  width: '100%',
}

const Services = ({ dictionary }) => {
  const { services } = dictionary.landing

  return (
    <div className="text-gray-600 md:mt-0 p-4 space-y-14 my-10">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.2 }}
          className="mt-13 text-3xl font-bold text-gray-800"
        >
          {services.title} <span className="text-green-600">{services.highlight}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.6 }}
        >
          {services.description}
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.02 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
      >
        {services.cards.map((service) => (
          <motion.div variants={cardVariants} key={service.id} className="text-center p-4 space-y-6">
            <img
              src={service.image}
              alt=""
              className="max-h-[200px] object-contain mx-auto hover:scale-110 duration-300 cursor-pointer rounded"
            />

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-600">{service.title}</h1>
              <p className="text-gray-800">{service.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        className="my-18"
      >
        <div
          style={bannerStyle}
          className="aspect-[1200/628] w-full max-w-5xl mx-auto rounded-xl overflow-hidden drop-shadow-lg"
        />
      </motion.div>
    </div>
  )
}

export default Services
