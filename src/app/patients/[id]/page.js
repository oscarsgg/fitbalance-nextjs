"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import DietManagement from "@/components/patients/DietManagement"

export default function PatientDetailsPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadPatient()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-screen bg-gray-50">
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/patients"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Link>
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{patient.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{patient.height_cm} cm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{patient.weight_kg} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">BMI</p>
                      <p className="font-medium">
                        {((patient.weight_kg / (patient.height_cm / 100) ** 2).toFixed(1))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Health Objective</p>
                      <p className="font-medium capitalize">{patient.objective}</p>
                    </div>
                  </div>

                  {patient.allergies?.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {patient.dietary_restrictions?.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-2">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.dietary_restrictions.map((restriction, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
  )
}
