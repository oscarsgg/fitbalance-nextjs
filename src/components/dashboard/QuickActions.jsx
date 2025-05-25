import { UserPlus, Calendar, FileText } from "lucide-react"

export default function QuickActions() {
  const actions = [
    {
      title: "Add Patient",
      description: "Register a new patient",
      icon: UserPlus,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Create Meal Plan",
      description: "Design a new meal plan",
      icon: FileText,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Schedule Appointment",
      description: "Book a new appointment",
      icon: Calendar,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                className={`w-full ${action.color} text-white p-4 rounded-lg transition-colors flex items-center space-x-3`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
