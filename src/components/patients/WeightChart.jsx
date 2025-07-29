"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Scale } from "lucide-react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function WeightChart({ patientId }) {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/patients/${patientId}/follow-up`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.weightHistory) {
            setChartData(data.data.weightHistory)
          } else {
            setError("No weight data available")
          }
        } else {
          setError("Failed to fetch weight data")
        }
      } catch (error) {
        console.error("Error fetching weight data:", error)
        setError("Error loading weight data")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchWeightData()
    }
  }, [patientId])

  const chartConfig = {
    type: "line",
    height: 180,
    series: [
      {
        name: "Weight (kg)",
        data:
          chartData
            ?.filter((d) => d.weight)
            .map((d) => ({
              x: new Date(d.date).getTime(),
              y: d.weight,
            })) || [],
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#10B981"],
      stroke: {
        lineCap: "round",
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 6,
        colors: ["#10B981"],
        strokeColors: "#fff",
        strokeWidth: 2,
      },
      xaxis: {
        type: "datetime",
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
          format: "MMM dd",
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
          formatter: (val) => val + " kg",
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
        x: {
          format: "dd MMM yyyy",
        },
        y: {
          formatter: (val) => val + " kg",
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
          <div>
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-48"></div>
          </div>
        </div>
        <div className="h-72 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error || !chartData || chartData.filter((d) => d.weight).length === 0) {
    return (
      <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-teal-400 rounded-lg flex items-center justify-center text-white mr-4">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
            <p className="text-sm text-gray-600">Track weight changes over time</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-72 text-gray-500">
          <Scale className="h-12 w-12 mb-4 text-gray-300" />
          <h4 className="text-lg font-medium mb-2">No Weight Data Available</h4>
          <p className="text-sm text-center">
            Weight data will appear here once weekly plans with weight measurements are created.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/63 rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-teal-400 rounded-lg flex items-center justify-center text-white mr-4">
          <Scale className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
          <p className="text-sm text-gray-600">
            Tracking {chartData.filter((d) => d.weight).length} weight measurements
          </p>
        </div>
      </div>
      <Chart {...chartConfig} />
    </div>
  )
}
