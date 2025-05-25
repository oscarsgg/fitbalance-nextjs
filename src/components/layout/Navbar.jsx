"use client"

import { Scale } from "lucide-react"
import Link from "next/link"

export default function Navbar({ onLoginClick }) {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src="/logo1.png"
          
          alt="Logo FitBalance"
          className="h-10 w-10 rounded-full border border-green-600"
        />
        <span className="ml-2 text-xl font-bold text-green-600">FitBalance</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="px-4 py-2 text-green-600 font-medium hover:text-green-700">
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}
