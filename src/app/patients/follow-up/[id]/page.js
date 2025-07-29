"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, Calendar, Activity } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import WeightChart from "@/components/patients/WeightChart"
import HeightChart from "@/components/patients/HeightChart"
import { useRouter } from "next/navigation"

export default function PatientFollowUpPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [followUpData, setFollowUpData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/patients/${id}`);
  };

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Cargar datos del paciente
        const patientResponse = await fetch(`/api/patients/${id}`)
        if (patientResponse.ok) {
          const patientData = await patientResponse.json()
          setPatient(patientData.patient)
        }

        // Cargar datos de seguimiento
        const followUpResponse = await fetch(`/api/patients/${id}/follow-up`)
        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json()
          setFollowUpData(followUpData.data)
        }
      } catch (error) {
        console.error("Error loading patient data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadPatientData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Patient not found</p>
            <Link href="/patients" className="text-green-600 hover:underline mt-2 inline-block">
              Return to patients list
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 rounded-xl min-h-screen">
          {/* Header */}
          <header className="pt-7 pb-2 px-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/patients" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{patient.name} - Follow Up</h1>
                    <p className="text-gray-600">Patient Progress Tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info Card - Same as in patient details */}
                <div className="lg:col-span-1">
                  <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Image
                            className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover"
                            src="/user-alt.png"
                            alt={patient.name}
                            width={80}
                            height={80}
                          />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{patient.name}</h2>
                          <p className="text-green-100 text-sm mt-1">{patient.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Age</p>
                              <p className="text-2xl font-bold text-gray-900">{patient.age}</p>
                              <p className="text-xs text-gray-400">years old</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/70 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500 font-medium">BMI</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {(patient.weight_kg / (patient.height_cm / 100) ** 2).toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-400">kg/m²</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                              <Activity className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Stats */}
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Follow-up Summary</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Weight Records:</span>
                              <span className="font-medium">{followUpData?.totalWeightRecords || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Recent Meal Logs:</span>
                              <span className="font-medium">{followUpData?.totalMealLogs || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Current Weight:</span>
                              <span className="font-medium">{patient.weight_kg} kg</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Current Height:</span>
                              <span className="font-medium">{patient.height_cm} cm</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Patient Objective</h3>
                          <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
                            <p className="text-blue-800 font-medium capitalize">{patient.objective}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button 
                            onClick={handleRedirect}
                            className="flex-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors py-2 px-4 font-medium">
                              Create a weekly plan
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Height Chart */}
                      <HeightChart patientId={id} />
                      
                      {/* Weight Chart */}
                      <WeightChart patientId={id} />
                    </div>

                    {/* Recent Activity Summary */}
                    <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-500 rounded-lg flex items-center justify-center text-white mr-4">
                          <Activity className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                          <p className="text-sm text-gray-600">Last 30 days meal logging activity</p>
                        </div>
                      </div>

                      {followUpData?.totalMealLogs > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{followUpData.totalMealLogs}</div>
                            <div className="text-sm text-green-700">Meal Logs</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{followUpData.totalWeightRecords}</div>
                            <div className="text-sm text-blue-700">Weight Records</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.round((followUpData.totalMealLogs / 30) * 10) / 10}
                            </div>
                            <div className="text-sm text-purple-700">Avg. Daily Logs</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                          <Activity className="h-12 w-12 mb-4 text-gray-300" />
                          <h4 className="text-lg font-medium mb-2">No Recent Activity</h4>
                          <p className="text-sm text-center">No meal logs have been recorded in the last 30 days.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
