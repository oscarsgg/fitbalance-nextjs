'use client'

import React from "react";
import Hero from "../components/hero/Hero"
import Services from "../components/services/Services"
import Footer from "../components/footer/Footer"

export default function LandingPage() {

  return (
    <div className="overflow-x-hidden">
        <Hero />
        <Services />
        <Footer />
    </div>
  )
}