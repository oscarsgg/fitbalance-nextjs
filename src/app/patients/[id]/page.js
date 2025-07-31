"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { User, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import DietManagement from "@/components/patients/DietManagement"
import { useRouter } from "next/navigation"

export default function PatientDetailsPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/patients/follow-up/${id}`);
  };

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${id}`)
        if (response.ok) {
          const data = await response.json()
          setPatient(data.patient)
        }
      } catch (error) {
        console.error("Error loading patient:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPatient()
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
                  <User className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                      {`${patient.name} ${patient.lastName || ""} ${patient.secondLastName || ""}`.trim()}
                    </h1>
                    <p className="text-gray-600">Patient Details</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info Card */}
                <div className="lg:col-span-1">
                  {/* Professional Patient Profile Card */}
                  <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Image
                            className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover"
                            //default  user img from /public/user-alt.png, patient.image not implemented
                            src="/user-alt.png"
                            // src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                            alt={`${patient.name} ${patient.lastName || ""} ${patient.secondLastName || ""}`}
                            width={80}
                            height={80}
                          />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">
                            {`${patient.name} ${patient.lastName || ""} ${patient.secondLastName || ""}`.trim()}
                          </h2>
                          {/* <p className="text-green-100 text-sm">ID: #{patient._id?.slice(-6) || "N/A"}</p> */}
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
                              <svg
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
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
                              <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Info */}
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Personal information</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Gender:</span>
                              <span className="font-medium capitalize">{patient.gender}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{patient.phone || "not provided"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Height:</span>
                              <span className="font-medium">{patient.height_cm} cm</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium">{patient.weight_kg} kg</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Patients objective</h3>
                          <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
                            <p className="text-blue-800 font-medium capitalize">{patient.objective}</p>
                          </div>
                        </div>

                        {/* Allergies and Restrictions */}
                        {(patient.allergies?.length > 0 || patient.dietary_restrictions?.length > 0) && (
                          <div className="border-l-4 border-red-500 pl-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Medical restriction</h3>

                            {patient.allergies?.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-2">Allergy:</p>
                                <div className="flex flex-wrap gap-2">
                                  {patient.allergies.map((allergy, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                                    >
                                      {allergy}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {patient.dietary_restrictions?.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Dietary Restrictions:</p>
                                <div className="flex flex-wrap gap-2">
                                  {patient.dietary_restrictions.map((restriction, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                                    >
                                      {restriction}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button 
                            onClick={handleRedirect}
                            className="flex-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors py-2 px-4 font-medium">
                              Follow-up patient
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diet Management */}
                <div className="lg:col-span-2">
                  <DietManagement patientId={id} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
