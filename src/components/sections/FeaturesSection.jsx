import { Users, Calendar, LineChart, Scale, Salad, Clock } from "lucide-react"
import FeatureCard from "../ui/FeatureCard"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-green-600" />,
      title: "Patient Management",
      description: "Manage complete patient profiles, medical history, and progress tracking all in one place.",
    },
    {
      icon: <Salad className="h-10 w-10 text-green-600" />,
      title: "Meal Plans",
      description: "Create personalized plans with drag and drop, automatically adjusting macronutrients and calories.",
    },
    {
      icon: <Scale className="h-10 w-10 text-green-600" />,
      title: "Scale Integration",
      description: "Integration with smart scales to measure food and calculate calories with precision.",
    },
    {
      icon: <LineChart className="h-10 w-10 text-green-600" />,
      title: "Analytics & Statistics",
      description: "Visualize your patients' progress with detailed charts and customizable reports.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-green-600" />,
      title: "Integrated Calendar",
      description: "Manage appointments, send automatic reminders, and reduce no-shows.",
    },
    {
      icon: <Clock className="h-10 w-10 text-green-600" />,
      title: "Time Saving",
      description: "Automate repetitive tasks and dedicate more time to what really matters: your patients.",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything you need for your nutritional practice</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            FitBalance brings together all the tools a modern nutritionist needs in one intuitive and powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  )
}
