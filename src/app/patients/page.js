"use client"

import { useState, useEffect } from "react"
import { Users, Search, ArrowUpDown, Calendar, TrendingUp } from "lucide-react"
import Sidebar from "../../components/layout/Sidebar"
import AddPatientForm from "../../components/patients/AddPatientForm"
import { useRouter } from "next/navigation"

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedGender, setSelectedGender] = useState("all")
  const [selectedObjective, setSelectedObjective] = useState("all")
  const router = useRouter()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSuccess = () => {
    setShowAddPatient(false)
    loadPatients()
  }

  const filteredPatients = patients
    .filter((patient) => {
      const fullName = `${patient.name} ${patient.lastName || ""} ${patient.secondLastName || ""}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGender = selectedGender === "all" || patient.gender === selectedGender
      const matchesObjective = selectedObjective === "all" || patient.objective === selectedObjective

      return matchesSearch && matchesGender && matchesObjective
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "age":
          comparison = a.age - b.age
          break
        case "date":
          comparison = new Date(b.registration_date) - new Date(a.registration_date)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const objectives = [
    "lose weight",
    "gain weight",
    "maintain weight",
    "gain muscle mass",
    "improve health",
    "control diabetes",
    "control hypertension",
    "other",
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#d1ffbe] to-[#85ff9b]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="m-5 bg-white/65 rounded-xl min-h-screen">
          {/* Header */}
          <header className="pt-7 pb-2 px-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Patients</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700">Manage your patients</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddPatient(true)}
                  className=" bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700/88 transition-colors text-sm sm:text-base"
                >
                  Add New Patient
                </button>
              </div>
            </div>
          </header>

          {/* Filters and Search */}
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/60 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="bg-white/60 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={selectedObjective}
                  onChange={(e) => setSelectedObjective(e.target.value)}
                  className="bg-white/60 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Objectives</option>
                  {objectives.map((objective) => (
                    <option key={objective} value={objective}>
                      {objective.charAt(0).toUpperCase() + objective.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Loading patients...</span>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedGender !== "all" || selectedObjective !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first patient"}
                </p>
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add New Patient
                </button>
              </div>
            ) : (
              <div className="bg-white/60 rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Patient Name
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("age")}
                      >
                        <div className="flex items-center">
                          Age
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Objective
                      </th>
                      <th
                        className="px-6 py-3  text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Registration Date
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white rounded divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-full w-full rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium">
                                  {`${patient.name} ${patient.lastName || ""} ${patient.secondLastName || ""}`
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {`${patient.name} ${patient.lastName || ""} ${patient.secondLastName || ""}`.trim()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{patient.age} years</div>
                          <div className="text-sm text-gray-500">
                            BMI: {(patient.weight_kg / (patient.height_cm / 100) ** 2).toFixed(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{patient.email}</div>
                          <div className="text-sm text-gray-500">{patient.phone || "No phone"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {patient.objective.charAt(0).toUpperCase() + patient.objective.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(patient.registration_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/patients/${patient._id}`)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Weekly Plan
                            </button>
                            <button
                              onClick={() => router.push(`/patients/follow-up/${patient._id}`)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200 transition-colors"
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Follow Up
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>

          {/* Add Patient Modal */}
          <AddPatientForm
            isOpen={showAddPatient}
            onClose={() => setShowAddPatient(false)}
            onSuccess={handlePatientSuccess}
          />
        </div>
      </div>
    </div>
  )
}