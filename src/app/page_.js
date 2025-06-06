'use client'

import { useState } from "react"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import HeroSection from "../components/sections/HeroSection"
import FeaturesSection from "../components/sections/FeaturesSection"
import CtaSection from "../components/sections/CtaSection"
import Header from "../components/sections/Header"

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white">
      
      {/* <Navbar/> */}
      <Header />
      
      <main>
            {/* <HeroSection /> */}
            <FeaturesSection />
            <CtaSection />
      </main>
      <Footer />
    </div>
  )
}