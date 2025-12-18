import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/logo.png";
import { Button } from "@/components/ui/button";
import { Phone, Info } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006599] to-[#12a6b9] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow-delayed"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center text-white relative z-10">
        <img
          src={logo}
          alt="Logo HorarioUCF"
          className="mx-auto mb-6 h-40 w-40 rounded-xl animate-float"
          style={{ objectFit: "contain" }}
        />
        <h1 className="text-5xl font-bold mb-6 animate-fade-in">Bienvenido a HorarioUCF</h1>
        <p className="text-xl mb-12 text-gray-100 animate-fade-in-delayed">
          Sistema de generación automática de horarios académicos para la
          Universidad de Cienfuegos
        </p>
        
        {/* Botón principal para ir a horarios */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/mapa-horarios")}
            className="bg-white text-[#006599] hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold 
                     shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Ir a Horarios
          </Button>
        </div>

        {/* Enlaces adicionales */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 animate-slide-up">
          <button
            onClick={() => navigate("/contacto")}
            className="group flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm 
                     hover:bg-white/20 rounded-xl border border-white/30 transition-all duration-300
                     transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Contacto</span>
          </button>
          
          <button
            onClick={() => navigate("/info")}
            className="group flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm 
                     hover:bg-white/20 rounded-xl border border-white/30 transition-all duration-300
                     transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <Info className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Información</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulse-slow 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
