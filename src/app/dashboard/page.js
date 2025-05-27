"use client"

import { useEffect, useState } from "react"
import Sidebar from "../../components/layout/Sidebar"
import DashboardStats from "../../components/dashboard/DashboardStats"
import RecentActivity from "../../components/dashboard/RecentActivity"
import QuickActions from "../../components/dashboard/QuickActions"
import UpcomingAppointments from "../../components/dashboard/UpcomingAppointments"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate user data loading
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/user/me')
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Error loading user data:", error)
        // Set default user even if there's an error
        setUser({ name: "Doctor" })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
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
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || "Doctor"}</p>
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