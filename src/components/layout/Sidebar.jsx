"use client"

import { useState } from "react"
import {
  Home,
  Users,
  Calendar,
  FileText,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Patients", href: "/patients" },
    { icon: FileText, label: "Meal Plans", href: "/meal-plans" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: Settings, label: "Schedule", href: "/schedule" },
    { icon: History, label: "History", href: "/history" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        router.push("/")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center">
              <img
                src="logo1.png"
                alt="Logo FitBalance"
                className="h-10 w-10 rounded-full border border-green-600"
              />
              <span className="ml-2 text-xl font-bold text-green-600">FitBalance</span>
            </div>
          ) : (
            <img
              src="logo1.png"
              alt="Logo FitBalance"
              className="h-8 w-8 rounded-full border border-green-600"
            />
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-gray-100">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={index}>
                <a
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-green-50 text-green-600 border-r-2 border-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-md transition-colors disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>}
        </button>
      </div>
    </div>
  )
}
