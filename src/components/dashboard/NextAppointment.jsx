"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react"

export default function NextAppointment() {
  const [nextAppointment, setNextAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchNextAppointment = async () => {
      try {
        const response = await fetch("/api/dashboard/next-appointment")
        if (response.ok) {
          const data = await response.json()
          setNextAppointment(data.nextAppointment)
        }
      } catch (error) {
        console.error("Error fetching next appointment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNextAppointment()
  }, [])

  const formatAppointmentTime = (date, time) => {
  const dateUTC = new Date(date)
  const [hours, minutes] = time.split(":").map(Number)

  // ✅ Usa fecha como UTC, pero construye una fecha local real
  const appointmentDate = new Date(
    dateUTC.getUTCFullYear(),
    dateUTC.getUTCMonth(),
    dateUTC.getUTCDate(),
    hours,
    minutes
  )

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  let dateText = ""
  if (isSameDay(appointmentDate, today)) {
    dateText = "Today"
  } else if (isSameDay(appointmentDate, tomorrow)) {
    dateText = "Tomorrow"
  } else {
    dateText = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  const timeText = appointmentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return `${dateText} at ${timeText}`
}


  const handleCardClick = () => {
    router.push("/appointments")
  }

  if (loading) {
    return (
      <Card
        shadow={false}
        className="relative grid h-[15rem] w-full max-w-[28rem] items-end justify-center overflow-hidden text-center cursor-pointer animate-pulse"
      >
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="absolute inset-0 m-0 h-full w-full rounded-none bg-gray-300"
        >
          <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
        </CardHeader>
        <CardBody className="relative py-14 px-6 md:px-12">
          <div className="h-6 bg-gray-400 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-5 bg-gray-400 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-5 bg-gray-400 rounded w-2/3 mx-auto"></div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card
      shadow={false}
      className="relative grid h-[15rem] w-full max-w-[28rem] items-end justify-center overflow-hidden text-center cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={handleCardClick}
    >
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="absolute inset-0 m-0 h-full w-full rounded-none bg-[url('/nutriologo.jpg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/50" />
      </CardHeader>
      <CardBody className="relative py-14 px-6 md:px-12">
        {nextAppointment ? (
          <>
            <Typography
              variant="h2"
              color="white"
              className="mb-4 font-medium leading-[1.5] text-lg sm:text-xl md:text-2xl lg:text-3xl"
            >
              Next Appointment
            </Typography>
            <Typography variant="h5" className="mb-2 text-white text-base sm:text-md md:text-lg lg:text-xl">
              {nextAppointment.patient_name}
            </Typography>
            <Typography variant="h5" className="mb-2 text-white text-base sm:text-md md:text-lg lg:text-xl">
              {formatAppointmentTime(nextAppointment.appointment_date, nextAppointment.appointment_time)}
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="h2"
              color="white"
              className="mb-4 font-medium leading-[1.5] text-lg sm:text-xl md:text-2xl lg:text-3xl"
            >
              No Upcoming Appointments
            </Typography>
            <Typography variant="h5" className="mb-2 text-white text-base sm:text-md md:text-lg lg:text-xl">
              Your schedule is clear
            </Typography>
            <Typography variant="h6" className="text-white/80 text-sm sm:text-base">
              Click to manage appointments
            </Typography>
          </>
        )}
      </CardBody>
    </Card>
  )
}
