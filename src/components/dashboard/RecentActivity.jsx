import { Clock, User, FileText, Calendar } from "lucide-react"

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "patient_added",
      message: "New patient Sarah Johnson was added",
      time: "2 hours ago",
      icon: User,
      color: "bg-blue-500",
    },
    {
      id: 2,
      type: "meal_plan",
      message: "Meal plan updated for John Doe",
      time: "4 hours ago",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      id: 3,
      type: "appointment",
      message: "Appointment scheduled with Maria Garcia",
      time: "6 hours ago",
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      id: 4,
      type: "weight_update",
      message: "Weight update received from IoT scale for Patient #127",
      time: "8 hours ago",
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      id: 5,
      type: "meal_plan",
      message: "Meal plan created for new patient Alex Smith",
      time: "1 day ago",
      icon: FileText,
      color: "bg-green-500",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`${activity.color} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6">
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">View all activity</button>
        </div>
      </div>
    </div>
  )
}
