import { Phone, Mail, MapPin, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/logo.png";

export function ContactPage() {
  const contactSections = [
    {
      title: "Nodo Central",
      icon: Building2,
      items: [
        { icon: Phone, text: "43 500112", type: "phone" },
        { icon: Mail, text: "servicios@ucf.edu.cu", type: "email" }
      ]
    },
    {
      title: "Departamento de Informática",
      icon: Building2,
      items: [
        { icon: Phone, text: "43 500172", type: "phone" }
      ]
    },
    {
      title: "Departamento de Planificación",
      icon: Building2,
      items: [
        { icon: Phone, text: "43 500159", type: "phone" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#006599] via-[#0e8aad] to-[#12a6b9] relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header con logo y título */}
        <div className="text-center mb-16 animate-fade-in">
          <Link to="/inicio" className="inline-block mb-6 hover:scale-110 transition-transform duration-300">
            <img
              src={logo}
              alt="Logo HorarioUCF"
              className="mx-auto h-24 w-24 rounded-xl shadow-2xl"
              style={{ objectFit: "contain" }}
            />
          </Link>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Contáctanos
          </h1>
          <div className="w-32 h-1 bg-white/60 mx-auto rounded-full"></div>
          <p className="text-xl text-white/90 mt-6 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contacta con nosotros a través de cualquiera de nuestros canales
          </p>
        </div>

        {/* Grid de secciones de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
          {contactSections.map((section, idx) => (
            <div
              key={idx}
              className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl 
                         transform hover:-translate-y-2 transition-all duration-300 border border-white/20
                         hover:bg-white/15 animate-slide-up"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                  <section.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl 
                               hover:bg-white/20 transition-all duration-200 group/item"
                  >
                    <div className="p-2 bg-white/20 rounded-lg group-hover/item:scale-110 transition-transform duration-200">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    {item.type === "email" ? (
                      <a
                        href={`mailto:${item.text}`}
                        className="text-white font-medium hover:text-white/80 transition-colors"
                      >
                        {item.text}
                      </a>
                    ) : item.type === "phone" ? (
                      <a
                        href={`tel:${item.text.replace(/\s/g, '')}`}
                        className="text-white font-medium hover:text-white/80 transition-colors"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-white font-medium">{item.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sección de ubicación destacada */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-xl rounded-3xl p-10 
                          shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300
                          transform hover:scale-[1.02] animate-fade-in"
               style={{ animationDelay: "450ms" }}>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <div className="p-6 bg-white/20 rounded-3xl">
                  <MapPin className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Sede Carlos Rafael Rodríguez
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Carretera a Rodas, km 4, Cuatro Caminos, Ciudad de Cienfuegos, Cienfuegos, CP - 59430
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="text-center mt-12">
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
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
