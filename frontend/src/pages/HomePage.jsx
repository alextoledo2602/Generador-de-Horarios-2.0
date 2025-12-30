import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/logo.png";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006599] to-[#12a6b9] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <img
          src={logo}
          alt="Logo HorarioUCF"
          className="mx-auto mb-6 h-40 w-40 rounded-xl"
          style={{ objectFit: "contain" }}
        />
        <h1 className="text-5xl font-bold mb-6">Bienvenido a HorarioUCF</h1>
        <p className="text-xl mb-12 text-gray-100">
          Sistema de generación automática de horarios académicos para la
          Universidad de Cienfuegos
        </p>
        {/* Botón principal para ir a horarios */}
        <Button
          onClick={() => navigate("/mapa-horarios")}
          className="bg-white text-[#006599] hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Ir a Horarios
        </Button>
      </div>
    </div>
  );
}
