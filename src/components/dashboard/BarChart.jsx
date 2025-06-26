"use client"

import { useEffect, useState } from "react"
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react"
import dynamic from "next/dynamic"
import { BarChart3 } from "lucide-react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function BarChartComponent() {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/dashboard/charts")
        if (response.ok) {
          const data = await response.json()
          setChartData(data.chartData)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  const chartConfig = {
    type: "bar",
    height: 240,
    series: [
      {
        name: "Appointments",
        data: chartData?.appointments || [0, 0, 0, 0, 0, 0],
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#10B981"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 2,
        },
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: chartData?.months || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "dark",
      },
    },
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
        >
          <div className="w-max rounded-lg bg-gray-300 p-5">
            <div className="h-6 w-6 bg-gray-400 rounded"></div>
          </div>
          <div>
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
        </CardHeader>
        <CardBody className="px-2 pb-0">
          <div className="h-60 bg-gray-200 rounded"></div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
      >
        <div className="w-max rounded-lg bg-gradient-to-br from-green-300 to-teal-400 p-5 text-white">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <Typography variant="h6" color="blue-gray">
            Monthly Appointments
          </Typography>
          <Typography variant="small" color="gray" className="max-w-sm font-normal">
            Track your appointment trends over the last 6 months
          </Typography>
        </div>
      </CardHeader>
      <CardBody className="px-2 pb-0">
        <Chart {...chartConfig} />
      </CardBody>
    </Card>
  )
}
