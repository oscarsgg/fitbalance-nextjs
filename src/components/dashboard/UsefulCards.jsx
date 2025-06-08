import HorizontalCard from "@/components/dashboard/HorizontalCard";
import NextAppointment from "@/components/dashboard/NextAppointment";

export default function Home() {
  return (
    <main className="container mx-auto py-6">
      <div className="grid grid-cols-10 gap-4">
        {/* Columna izquierda: 6/10 */}
        <div className="col-span-10 md:col-span-6">
          <HorizontalCard />
        </div>

        {/* Columna derecha: 4/10 */}
        <div className="col-span-10 md:col-span-4">
          <NextAppointment
          />
        </div>
      </div>
    </main>
  );
}
