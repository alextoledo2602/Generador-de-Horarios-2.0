import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Clock,
  LogOut,
  Building2,
  ListChecks,
} from "lucide-react";
import { useEffect, useRef } from "react";
import logo from "@/assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarRef = useRef(null);

  // Obtener el rol del usuario desde el token JWT
  let userRole = null;
  const token = localStorage.getItem("access");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.groups && decoded.groups.length > 0) {
        userRole = decoded.groups[0];
      }
    } catch (err) {
      userRole = null;
    }
  }

  // Considerar sin rol si es null, vacío o 'user'
  const hasRole = userRole && userRole !== "user";
  const isAdmin = userRole === "administrador" || userRole === "admin";

  const menuItems = [
    {
      title: "Horario",
      href: "/mapa-horarios",
      icon: BookOpen,
      show: true,
    },
    {
      title: "Período",
      href: "/periodos",
      icon: Clock,
      show: hasRole,
    },
    {
      title: "Asignaturas",
      href: "/subjects-details",
      icon: BookOpen,
      show: hasRole,
    },
    {
      title: "Profesores",
      href: "/profesores-details",
      icon: Users,
      show: hasRole,
    },
    {
      title: "Locales",
      href: "/locales",
      icon: Building2,
      show: hasRole,
    },
    {
      title: "Actividades",
      href: "/actividades",
      icon: ListChecks,
      show: hasRole,
    },
    // Solo para admin
    ...(isAdmin
      ? [
          {
            title: "Usuarios",
            href: "/admin-usuarios",
            icon: Users,
            show: true,
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-[#23272f] shadow-lg transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center border-b border-[#12a6b9] px-4">
        <Link to="/" className="flex items-center gap-3 font-semibold text-white text-xl">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg shadow" />
          <span>HorarioUCF</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-base font-semibold">
          {menuItems.map((item) =>
            item.show ? (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-3 my-1 transition-all",
                  location.pathname === item.href
                    ? "bg-white text-[#006599] shadow font-bold"
                    : "text-white hover:bg-[#353b48] hover:text-white"
                )}
                style={{ fontSize: "1.18rem" }}
              >
                <item.icon className="h-6 w-6" />
                {item.title}
              </Link>
            ) : null
          )}
        </nav>
      </div>
      {/* Botón cerrar sesión fijo abajo */}
      <div className="absolute bottom-0 left-0 w-full p-4">
        <Button
          variant="outline"
          className="w-full justify-start bg-red-600 text-white hover:bg-red-700 hover:text-white font-semibold border-none"
          onClick={() => {
            // Elimina los tokens del navegador
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            logout();
            window.location.reload();
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
