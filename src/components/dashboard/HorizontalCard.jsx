"use client"

import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react"
import { useEffect, useState } from "react"

export default function HorizontalCard() {
  const [nutritionist, setNutritionist] = useState(null)
  const [recentPatients, setRecentPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...")

        const [nutRes, patientRes] = await Promise.all([
          fetch("/api/nutritionist/me"),
          fetch("/api/dashboard/recent-patients"),
        ])

        if (nutRes.ok) {
          const nutData = await nutRes.json()
          setNutritionist(nutData.nutritionist)
          console.log("Nutritionist data loaded:", nutData.nutritionist?.name)
        } else {
          console.error("Failed to fetch nutritionist data")
        }

        if (patientRes.ok) {
          const patientData = await patientRes.json()
          console.log("Patient data received:", patientData)
          setRecentPatients(patientData.recentPatients || [])
        } else {
          console.error("Failed to fetch recent patients")
          const errorData = await patientRes.json()
          setError(errorData.error || "Failed to load patients")
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="bg-white border border-gray-200 h-[15rem] w-full max-w-[48rem] flex-row">
      <CardHeader shadow={false} floated={false} className="m-0 w-2/5 shrink-0 rounded-r-none">
        <img src="/card-image.png" alt="card-image" className="h-full w-full object-cover" />
      </CardHeader>
      <CardBody>
        <Typography variant="h4" color="blue-gray" className="mb-2 text-base md:text-lg lg:text-2xl">
          {loading ? "Loading your updates..." : error ? "Unable to load updates" : "Your latest patients"}
        </Typography>

        {loading ? (
          <Typography color="gray" className="font-normal text-sm md:text-base animate-pulse">
            Please wait while we fetch your latest information
          </Typography>
        ) : error ? (
          <Typography color="red" className="font-normal text-sm md:text-base">
            {error}
          </Typography>
        ) : recentPatients.length > 0 ? (
          recentPatients.map((patient, index) => (
            <Typography key={index} color="gray" className="font-normal text-sm md:text-base">
              {patient.name} ({formatDate(patient.registration_date)})
            </Typography>
          ))
        ) : (
          <Typography color="gray" className="font-normal text-sm md:text-base">
            No recent info to show. Try registering a new patient!
          </Typography>
        )}

        
      </CardBody>
    </Card>
  )
}
