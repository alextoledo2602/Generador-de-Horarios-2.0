"use client";
import ScheduleGenerator from "@/components/schedule-generator";

export function Home() {
  return (
    <div className="container mx-auto pt-2 pb-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-0 text-center text-[#006599] leading-tight">
        Generador de Horarios
      </h1>
      <h2 className="text-lg md:text-xl font-medium text-center text-gray-700 mb-2">
        Crea tu horario académico de manera fácil y rápido.
      </h2>
      <div className="mt-2">
        <ScheduleGenerator />
      </div>
    </div>
  );
}
