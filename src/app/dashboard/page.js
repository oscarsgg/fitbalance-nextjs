"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import Sidebar from "../../components/layout/Sidebar"
import DashboardStats from "../../components/dashboard/DashboardStats"
import RecentActivity from "../../components/dashboard/RecentActivity"
import QuickActions from "../../components/dashboard/QuickActions"
import UpcomingAppointments from "../../components/dashboard/UpcomingAppointments"

export default function Dashboard() {
  const [nutritionist, setNutritionist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for success message from registration
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(message)
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    }
  }, [searchParams])

  useEffect(() => {
    // Fetch nutritionist data
    const loadNutritionistData = async () => {
      try {
        const response = await fetch("/api/nutritionist/me")
        if (response.ok) {
          const data = await response.json()
          setNutritionist(data.nutritionist)
        } else {
          // If can't fetch data, set default
          setNutritionist({ name: "Doctor" })
        }
      } catch (error) {
        console.error("Error loading nutritionist data:", error)
        setNutritionist({ name: "Doctor" })
      } finally {
        setLoading(false)
      }
    }

    loadNutritionistData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
              <button onClick={() => setSuccessMessage("")} className="text-green-400 hover:text-green-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {nutritionist?.name || "Doctor"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Add New Patient
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <DashboardStats />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left Column - Recent Activity */}
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>

              {/* Right Column - Quick Actions & Appointments */}
              <div className="space-y-6">
                <QuickActions />
                <UpcomingAppointments />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
