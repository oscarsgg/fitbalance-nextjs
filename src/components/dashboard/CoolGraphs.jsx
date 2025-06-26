import BarChart from "./BarChart"
import LineChart from "./LineChart"

export default function CoolGraphs() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <BarChart />
      <LineChart />
    </div>
  )
}
