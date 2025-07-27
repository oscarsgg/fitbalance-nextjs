"use client"

import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

export default function HorizontalCard() {
  const [nutritionist, setNutritionist] = useState(null)
  const [recentPatient, setRecentPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nutRes, patientRes] = await Promise.all([
          fetch("/api/nutritionist/me"),
          fetch("/api/dashboard/recent-patients"),
        ])

        if (nutRes.ok) {
          const nutData = await nutRes.json()
          setNutritionist(nutData.nutritionist)
        }

        if (patientRes.ok) {
          const patientData = await patientRes.json()
          setRecentPatient(patientData.recentPatients?.[0] || null)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="bg-white border border-gray-200 h-[15rem] w-full max-w-[48rem] flex-row">
      <CardHeader
        shadow={false}
        floated={false}
        className="m-0 w-2/5 shrink-0 rounded-r-none"
      >
        <img
          src="/card-image.png"
          alt="card-image"
          className="h-full w-full object-cover"
        />
      </CardHeader>
      <CardBody>

        {/* <Typography
            variant="h6"
            color="gray"
            className="mb-2 uppercase text-sm md:text-base"
        >
            Dashboard
        </Typography> */}

        {/* <Typography
            variant="h4"
            color="blue-gray"
            className="mb-2 text-base md:text-lg lg:text-xl"
        >
            {nutritionist ? `Welcome back, ${nutritionist.name}` : "Welcome back"}
        </Typography> */}

        <Typography
            variant="h4"
            color="blue-gray"
            className="mb-2 text-base md:text-lg lg:text-2xl"
        >
            {`Your latest changes`}
        </Typography>

        {!loading && (
          recentPatient ? (
            <Typography color="gray" className="font-normal text-lg md:text-base">
              New patient: {recentPatient.name}
            </Typography>
          ) : (            
            <Typography color="gray" className="font-normal text-sm md:text-base">
              No recent info to show. Try registering a new patient!
            </Typography>
          )
        )}
      </CardBody>
    </Card>
  )
}