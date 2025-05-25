import { Clock } from "lucide-react"

export default function UpcomingAppointments() {
  const appointments = [
    {
      id: 1,
      patient: "Sarah Johnson",
      time: "10:00 AM",
      type: "Follow-up",
      avatar: "SJ",
    },
    {
      id: 2,
      patient: "Mike Chen",
      time: "2:30 PM",
      type: "Initial Consultation",
      avatar: "MC",
    },
    {
      id: 3,
      patient: "Emma Davis",
      time: "4:00 PM",
      type: "Progress Review",
      avatar: "ED",
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Today's Appointments</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">{appointment.avatar}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{appointment.patient}</p>
                <p className="text-xs text-gray-500">{appointment.type}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {appointment.time}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">View all appointments</button>
        </div>
      </div>
    </div>
  )
}
