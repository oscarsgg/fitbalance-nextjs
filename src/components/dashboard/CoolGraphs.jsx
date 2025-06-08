import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";

export default function Home() {
  return (
    <main className="container mx-auto pt-2 pb-6">
      <div className="grid grid-cols-10 gap-4">
        {/* Columna izquierda: 4/10 */}
        <div className="col-span-10 md:col-span-4">
          <BarChart />
        </div>

        {/* Columna derecha: 6/10 */}
        <div className="col-span-10 md:col-span-6">
          <LineChart />
        </div>
      </div>
    </main>
  );
}
