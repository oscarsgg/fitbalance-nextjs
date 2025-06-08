import React from 'react'
import { useRouter } from 'next/navigation';
import Navbar from "../navbar/Navbar"
import { motion } from "framer-motion"

const bgImage = {
    backgroundImage: 'url(/bg-slate.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
};

const Hero = () => {

    const router = useRouter();

  return (
    <main style={bgImage}>
        {/* max-h-[660px] */}
        <section className="min-h-[700px] w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
                {/* navbar section */}
                <Navbar />

                {/* hero section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center min-h-[700px]">

                    {/* text content section - OJO min 13 */}
                    <div className='text-gray-600 mt-[100px] md:mt-0 p-4 space-y-28'>
                        <motion.h1 
                            initial={{opacity: 0, y: -100}}
                            whileInView={{opacity: 1, y: 0}} 
                            transition={{type: "spring", stiffness: 100, damping: 10, delay: 1}}                       
                            className='text-gray-800 text-7xl font-bold leading-tight ml-14'>
                            FitBalance
                        </motion.h1>
                        <motion.div 
                            initial={{opacity: 0, y: -100}}
                                whileInView={{opacity: 1, y: 0}} 
                                transition={{type: "spring", stiffness: 100, damping: 10, delay: 1.2}}
                            className='relative'>
                            <div className="relative z-10 space-y-4">
                                <h1 className='text-2xl font-bold'>
                                    Welcome to FitBalance — your nutrition management system
                                </h1>
                                <h1 className='text-sm opacity-55 leading-loose'>
                                    FitBalance helps you manage patients, create personalized meal plans, and organize your appointments.
                                </h1>
                                <div>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="mt-6 px-6 py-3 bg-[#9ed18a] hover:bg-[#8cbd78] text-white text-sm font-semibold rounded-md transition duration-300"
                                >
                                    Register now!
                                </button>
                                </div>

                            </div>
                            <div className='absolute -top-6 -left-10 w-[250px] h-[190px] bg-[#d5f3c8] ml-8'>

                            </div>
                        </motion.div>
                    </div>
                    
                    {/* hero image section */}
                    <div className="relative">
                        <motion.img 
                            initial={{opacity: 0, scale: 0}}
                            whileInView={{opacity: 1, scale: 1}} 
                            transition={{type: "spring", stiffness: 100, damping: 10, delay: 0.4}}
                            src="/manzana.png" 
                            alt="" 
                            className="relative z-40 h-[400px] md:h-[550px] filter drop-shadow-lg" 
                        />
                        
                        {/* green ring circle */}
                        <motion.div 
                            initial={{opacity: 0, y: -100}}
                            whileInView={{opacity: 1, y: 0}} 
                            transition={{type: "spring", stiffness: 100, damping: 10, delay: 0.8}}
                            className='h-[180px] w-[180px] absolute top-50 -left-3 border-green-700/25 border-[20px] rounded-full z-10'>
                        </motion.div>
                        
                        {/* big text section */}
                        <motion.div 
                            initial={{opacity: 0, x: -100}}
                            whileInView={{opacity: 1, x: 0}} 
                            transition={{type: "spring", stiffness: 100, damping: 10, delay: 0.8}}
                            className='absolute -top-2 left-[240px] z-[1]'>
                            <h1 className='text-[110px] scale-150 font-bold text-[#e6ffdb] leading-none'>
                            Fit Balance
                            </h1>
                        </motion.div>
                    </div>



                    {/* third div section */}
                    <div className='hidden lg:block'>
                        <motion.div 
                        initial={{opacity: 0, y: -100}}
                                    whileInView={{opacity: 1, y: 0}} 
                                    transition={{type: "spring", stiffness: 100, damping: 10, delay: 1.2}}
                        className='text-gray-600 mt-[100px] md:mt-0 p-4 space-y-28'>
                            <h1 className='opacity-0 text-gray-800 text-7xl font-bold leading-tight ml-14'>
                                FitBalance
                            </h1>
                            <div className='relative'>
                                <div className="relative z-10 space-y-4">
                                    <h1 className='text-2xl font-bold'>
                                        Nutrition made simple. 

                                    </h1>
                                    <h1 className='text-sm opacity-55 leading-loose'>
                                        FitBalance brings all the tools a  nutritionist needs in one powerful platform.
                                    </h1>
                                </div>
                                <div className='absolute -top-6 -left-10 w-[250px] h-[190px] bg-[#e6ffdb] ml-8'>

                                </div>
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
