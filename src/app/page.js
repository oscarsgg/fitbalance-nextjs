'use client'

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import LoginForm from "../components/auth/LoginForm"
import HeroSection from "../components/sections/HeroSection"
import FeaturesSection from "../components/sections/FeaturesSection"
import CtaSection from "../components/sections/CtaSection"

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar onLoginClick={() => setShowLogin(true)} />

      {/* Main Content */}
      <main>
        {showLogin ? (
          <div className="max-w-md mx-auto my-16 px-4">
            <button
              onClick={() => setShowLogin(false)}
              className="mb-4 text-green-600 flex items-center hover:underline"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Back</span>
            </button>
            <LoginForm />
          </div>
        ) : (
          <>
            <HeroSection />
            <FeaturesSection />
            <CtaSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}