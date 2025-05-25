import { Users, Calendar, TrendingUp, Scale } from "lucide-react"

export default function DashboardStats() {
  const stats = [
    {
      title: "Total Patients",
      value: "127",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "This Week's Appointments",
      value: "24",
      change: "+8%",
      changeType: "increase",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Average Weight Loss",
      value: "2.3 kg",
      change: "+15%",
      changeType: "increase",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "Meals Tracked Today",
      value: "89",
      change: "-3%",
      changeType: "decrease",
      icon: Scale,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${stat.changeType === "increase" ? "text-green-600" : "text-red-600"}`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
