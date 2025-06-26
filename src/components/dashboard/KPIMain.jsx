import React from "react";
import { useEffect, useState } from "react"

// @material-tailwind/react
import {
  Button,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Card,
  CardBody,
} from "@material-tailwind/react";
import { User, ChevronDown, ChevronUp } from "lucide-react";

export function KpiCard({
  title,
  total,
  icon,
}) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200 !rounded-lg">
      <CardBody className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <Typography
              className="!font-medium !text-xs text-gray-600"
            >
              {title}
            </Typography>
            <Typography
              color="blue-gray"
              className="mt-1 font-bold text-2xl"
            >
              {total}
            </Typography>
          </div>

          <div className="flex items-center gap-1">
            <div className="bg-gradient-to-br from-green-300 to-teal-400 p-2 rounded-xl">
              {icon}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}



function KPIMain() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const data = [
    {
      title: "Total Patients",
      total: stats?.totalPatients || 0,
      icon: <User className="w-10 h-10 text-white" />,
    },
    {
      title: "Today's Appointments",
      total: stats?.todayAppointments || 0,
      icon: <ChevronUp className="w-10 h-10 text-white" />,
    },
    {
      title: "Completed This Month",
      total: stats?.completedAppointments || 0,
      icon: <ChevronUp className="w-10 h-10 text-white" />,
    },
  ];

  return (
    <section className="container mx-auto ">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 items-center md:gap-2.5 gap-4">
        {data.map((props, key) => (
          <KpiCard key={key} {...(props)} />
        ))}
      </div>
    </section>
  );
}

export default KPIMain;
