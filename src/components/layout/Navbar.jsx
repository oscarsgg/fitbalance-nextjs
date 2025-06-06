"use client"

import { Scale } from "lucide-react"
import Link from "next/link"

export default function Navbar({ onLoginClick }) {
  return (
    <nav className="px-4 sm:px-6 md:px-18 py-3 flex items-center justify-between bg-black/25 backdrop-blur-md rounded-b-xl">
      <div className="flex items-center">
        <img
          src="/logo1.png"
        
          alt="Logo FitBalance"
          className="h-14 w-14 rounded-full border border-white"
        />
        <span className="ml-2 text-xl font-bold text-white">FitBalance</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="px-4 py-2 text-white font-medium hover:text-green-700">
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-white text-green-700 rounded-md font-medium hover:bg-green-200 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}
