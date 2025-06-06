import React from 'react'
import {
    FaFacebook,
    FaGoogle,
    FaInstagram,
    FaPhone,
    FaTelegram    
} from "react-icons/fa"
import { FaMapLocation } from "react-icons/fa6"
import { motion } from "framer-motion"

const Footer = () => {
  return (
    <div className='bg-gradient-to-r from-[#8bbd76] to-[#c5ebb5] pt-8 pb-8 text-white'>
        <div className=' md:mt-0 p-4 space-y-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
                {/* company details section */}
                <motion.div 
                initial={{opacity: 0, y: -100}}
                whileInView={{opacity: 1, y: 0}}
                transition={{type: "spring", stiffness: 100, damping: 10, delay: 0.2}}
                viewport={{ once: true }}
                className='space-y-6'> 
                    <h1 className='text-3xl font-bold'>FitBalance Team</h1>
                    <p className='text-sm max-w-[300px]'>
                        An academical project
                    </p>
                    <div>
                    <p className='flex items-center gap-2'>
                        <FaPhone />
                        +52 123 456 7890
                    </p>
                    <p className='flex items-center gap-2 mt-2'>
                        <FaMapLocation />
                        Tijuana, Baja California
                    </p>
                    </div>
                </motion.div>
                {/* footer links section */}
                <motion.div 
                initial={{opacity: 0, y: -100}}
                whileInView={{opacity: 1, y: 0}}
                transition={{type: "spring", stiffness: 100, damping: 10, delay: 0.6}}
                viewport={{ once: true }} 
                className='space-y-6'>
                    <h1 className='text-3xl font-bold'>Quick Links</h1>
                    <div className='grid grid-cols-2 gap-3'>
                        {/* first col section */}
                        <div className='space-y-2'>
                            <ul>
                                <li>Home</li>
                                <li>About</li>
                                <li>Contact us</li>
                            </ul>
                        </div>

                        {/* second col section */}
                        {/* <div className='space-y-2'>
                            <ul>
                                <li>Home</li>
                                <li>About</li>
                                <li>Contact us</li>
                            </ul>
                        </div> */}

                    </div>
                </motion.div> 

                {/* social links section */}
                <motion.div 
                initial={{opacity: 0, y: -100}}
                whileInView={{opacity: 1, y: 0}}
                transition={{type: "spring", stiffness: 100, damping: 10, delay: 0.9}}
                viewport={{ once: true }} className='space-y-6'>
                    <h1 className='text-3xl font-bold'>Follow us</h1>
                    <div className='flex items-center gap-3'>
                        <FaFacebook className='text-3xl hover:scale-105 duration-300' />
                        <FaInstagram className='text-3xl hover:scale-105 duration-300' />
                        <FaGoogle className='text-3xl hover:scale-105 duration-300' />
                        <FaTelegram className='text-3xl hover:scale-105 duration-300' />

                    </div>
                </motion.div>
            </div>
            {/* Copyright section */}
            <div className='border-t border-white pt-6'>
                <p className='text-sm text-center'>
                    &copy; {new Date().getFullYear()} FitBalance. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    
  )
}

export default Footer
