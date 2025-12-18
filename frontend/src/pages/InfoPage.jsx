import { Github, Code2, Heart, Sparkles, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/logo.png";

export function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#006599] via-[#0e8aad] to-[#12a6b9] relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-white/5 rounded-full blur-2xl animate-pulse-slow-delayed"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header con logo */}
        <div className="text-center animate-fade-in">
          <Link to="/inicio" className="inline-block mb-6 hover:scale-110 transition-transform duration-300">
            <img
              src={logo}
              alt="Logo HorarioUCF"
              className="mx-auto h-24 w-24 rounded-xl shadow-2xl"
              style={{ objectFit: "contain" }}
            />
          </Link>
            
        </div>

        {/* Card principal del desarrollador */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 
                          hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]
                          animate-slide-up">
            
            {/* Icono de código decorativo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-8 bg-white/20 rounded-full">
                  <Code2 className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>

            {/* Nombre del desarrollador */}
            <div className="text-center mb-8">
              <p className="text-white/80 text-lg mb-3 font-medium tracking-wide">Creado por</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                
              </div>
              <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">
                Alex Manuel Montero Magariño
              </h2>
              <div className="flex items-center justify-center space-x-2 text-white/70 text-lg">
                
              </div>
            </div>

            {/* Botón de GitHub destacado */}
            <div className="flex justify-center mb-8">
              <a
                href="https://github.com/ManuelAlex18"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center space-x-4 px-10 py-5 
                         bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold text-xl
                         rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300
                         transform hover:scale-110 hover:-translate-y-1 overflow-hidden"
              >
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <Github className="w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Ver Perfil de GitHub</span>
                
                {/* Indicador visual */}
                <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-400 rounded-full"></div>
              </a>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300
                            transform hover:-translate-y-1">
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-white/90 font-medium">Universidad de Cienfuegos</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300
                            transform hover:-translate-y-1">
                <div className="text-4xl mb-2">💻</div>
                <p className="text-white/90 font-medium">Sistema de Horarios Académicos</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300
                            transform hover:-translate-y-1">
                <div className="text-4xl mb-2">⚡</div>
                <p className="text-white/90 font-medium">Django + React</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="text-center">
          <Link
            to="/inicio"
            className="inline-flex items-center px-8 py-4 bg-white text-[#006599] font-semibold 
                     rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-300
                     transform hover:scale-105"
          >
            <span className="mr-2">←</span>
            Volver al Inicio
          </Link>
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulse-slow 5s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
