'use client'

import React from 'react'
import { FaFacebook, FaGoogle, FaInstagram, FaPhone, FaTelegram } from 'react-icons/fa'
import { FaMapLocation } from 'react-icons/fa6'
import { motion } from 'framer-motion'

const Footer = ({ dictionary }) => {
  const { footer } = dictionary.landing

  return (
    <div className="bg-gradient-to-r from-[#8bbd76] to-[#c5ebb5] pt-8 pb-8 text-white">
      <div className="md:mt-0 p-4 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold">{footer.teamTitle}</h1>
            <p className="text-sm max-w-[300px]">{footer.projectDescription}</p>
            <div>
              <p className="flex items-center gap-2">
                <FaPhone />
                +52 123 456 7890
              </p>
              <p className="flex items-center gap-2 mt-2">
                <FaMapLocation />
                Tijuana, Baja California
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold">{footer.quickLinksTitle}</h1>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <ul>
                  {footer.links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.9 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold">{footer.followUsTitle}</h1>
            <div className="flex items-center gap-3">
              <FaFacebook className="text-3xl hover:scale-105 duration-300" />
              <FaInstagram className="text-3xl hover:scale-105 duration-300" />
              <FaGoogle className="text-3xl hover:scale-105 duration-300" />
              <FaTelegram className="text-3xl hover:scale-105 duration-300" />
            </div>
          </motion.div>
        </div>
        <div className="border-t border-white pt-6">
          <p className="text-sm text-center">
            &copy; {new Date().getFullYear()} FitBalance. {footer.copyright}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer
