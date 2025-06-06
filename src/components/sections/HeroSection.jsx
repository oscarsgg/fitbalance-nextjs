import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to FitBalance — your nutrition management system
          </h1>
          <p className="text-lg text-white mb-8">
            FitBalance helps you manage patients, create personalized meal plans, and organize your appointments.
          </p>

          {/* <div className="space-y-3 mb-8">
            {[
              "Comprehensive patient management",
              "Personalized meal plans",
              "IoT scale integration",
              "Automatic calorie calculation",
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div> */}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-center"
            >
              Register now!
            </Link>
            {/* <button className="px-6 py-3 border border-green-600 text-green-600 rounded-md font-medium hover:bg-green-50 transition-colors">
              Login
            </button> */}
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="relative">
            <img
              src="/nutrition.jpg?height=500&width=600"
              alt="FitBalance Dashboard"
              className="rounded-lg shadow-xl relative z-10 border border-gray-200"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
