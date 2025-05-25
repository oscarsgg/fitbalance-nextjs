import Link from "next/link"

export default function CtaSection() {
  return (
    <section className="bg-green-50 py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Start transforming your nutritional practice today</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Join hundreds of nutritionists who are already optimizing their work and improving their patients' results
          with FitBalance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-center"
          >
            14-day free trial
          </Link>
          <button className="px-6 py-3 border border-green-600 text-green-600 rounded-md font-medium hover:bg-green-50 transition-colors">
            Request demo
          </button>
        </div>
      </div>
    </section>
  )
}
