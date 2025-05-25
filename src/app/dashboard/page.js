"use client"

import { useEffect, useState } from "react"
import Sidebar from "../../components/layout/Sidebar"
import DashboardStats from "../../components/dashboard/DashboardStats"
import RecentActivity from "../../components/dashboard/RecentActivity"
import QuickActions from "../../components/dashboard/QuickActions"
import UpcomingAppointments from "../../components/dashboard/UpcomingAppointments"

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Fetch user data from MongoDB
    fetch("/api/user")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        setUser(data)
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
      })    
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Welcome back, INSERTE NOMBRE XD</p>
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
