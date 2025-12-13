"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Plus, ArrowLeft, ChevronRight } from "lucide-react";
import {
  facultiesApi,
  careersApi,
  coursesApi,
  yearsApi,
  periodsApi,

  schedulesApi, // <-- Agrega schedulesApi aquí
} from "../api/tasks.api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ucfLogo from "../assets/images/ucflogo.png";

export function MapaHorarios() {
  // Estados para cada nivel de la jerarquía
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [años, setAños] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const [selectedPath, setSelectedPath] = useState({
    curso: null,
    periodo: null,
    facultad: null,
    carrera: null,
    año: null,
  });

  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Para evitar restaurar varias veces
  const restoredRef = useRef(false);

  // Restaurar estado desde localStorage al montar
  useEffect(() => {
    if (restoredRef.current) return;
    const savedPath = localStorage.getItem("mapaHorarios_selectedPath");
    const savedBreadcrumb = localStorage.getItem("mapaHorarios_breadcrumb");
    if (savedPath && savedBreadcrumb) {
      try {
        setSelectedPath(JSON.parse(savedPath));
        setBreadcrumb(JSON.parse(savedBreadcrumb));
        restoredRef.current = true;
      } catch {
        // Si hay error, limpiar
        localStorage.removeItem("mapaHorarios_selectedPath");
        localStorage.removeItem("mapaHorarios_breadcrumb");
      }
    }
  }, []);

  // Guardar en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("mapaHorarios_selectedPath", JSON.stringify(selectedPath));
    localStorage.setItem("mapaHorarios_breadcrumb", JSON.stringify(breadcrumb));
  }, [selectedPath, breadcrumb]);

  // Limpiar localStorage al hacer "Inicio"
  const handleReset = () => {
    setSelectedPath({
      curso: null,
      periodo: null,
      facultad: null,
      carrera: null,
      año: null,
    });
    setBreadcrumb([]);
    localStorage.removeItem("mapaHorarios_selectedPath");
    localStorage.removeItem("mapaHorarios_breadcrumb");
  };

  // Cargar cursos al inicio
  useEffect(() => {
    setLoading(true);
    coursesApi
      .getAll()
      .then((res) => setCursos(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Cargar periodos cuando se selecciona un curso
  useEffect(() => {
    if (selectedPath.curso) {
      setLoading(true);
      periodsApi
        .getAll()
        .then((res) =>
          setPeriodos(res.data.filter((p) => p.course === selectedPath.curso.id))
        )
        .finally(() => setLoading(false));
    } else {
      setPeriodos([]);
    }
  }, [selectedPath.curso]);

  // Cargar facultades cuando se selecciona un periodo
  useEffect(() => {
    if (selectedPath.periodo) {
      setLoading(true);
      facultiesApi
        .getAll()
        .then((res) =>
          setFacultades(
            res.data.filter(
              (f) =>
                // Si tienes relación directa de facultad con periodo, usa f.period === selectedPath.periodo.id
                // Si no, muestra todas las facultades (ajusta según tu modelo)
                true
              // f.period === selectedPath.periodo.id
            )
          )
        )
        .finally(() => setLoading(false));
    } else {
      setFacultades([]);
    }
  }, [selectedPath.periodo]);

  // Cargar carreras cuando se selecciona una facultad
  useEffect(() => {
    if (selectedPath.facultad) {
      setLoading(true);
      careersApi
        .getAll()
        .then((res) =>
          setCarreras(
            res.data.filter((c) => c.faculty === selectedPath.facultad.id)
          )
        )
        .finally(() => setLoading(false));
    } else {
      setCarreras([]);
    }
  }, [selectedPath.facultad]);

  // Cargar años cuando se selecciona una carrera
  useEffect(() => {
    if (selectedPath.carrera) {
      setLoading(true);
      yearsApi
        .getAll()
        .then((res) =>
          setAños(
            res.data.filter(
              (a) => a.career === selectedPath.carrera.id
            )
          )
        )
        .finally(() => setLoading(false));
    } else {
      setAños([]);
    }
  }, [selectedPath.carrera]);

  // Cargar horarios cuando se selecciona un año
  useEffect(() => {
    if (selectedPath.año && selectedPath.periodo) {
      setLoading(true);
      schedulesApi
        .getAll()
        .then((res) => {
          // Filtra por año, carrera y periodo
          let filtered = res.data.filter(
            (h) =>
              h.year === selectedPath.año.id &&
              h.career === selectedPath.carrera.id &&
              h.period === selectedPath.periodo.id
          );
          setHorarios(filtered);
        })
        .finally(() => setLoading(false));
    } else {
      setHorarios([]);
    }
  }, [selectedPath.año, selectedPath.carrera, selectedPath.periodo]);

  const handleSelect = (level, item) => {
    const newPath = { ...selectedPath };
    const newBreadcrumb = [...breadcrumb];

    // Reset all levels below the current one
    const levels = ["curso", "periodo", "facultad", "carrera", "año"];
    const currentIndex = levels.indexOf(level);

    for (let i = currentIndex + 1; i < levels.length; i++) {
      newPath[levels[i]] = null;
    }

    // Set the current selection
    newPath[level] = item;

    // Update breadcrumb
    newBreadcrumb.splice(currentIndex);
    newBreadcrumb.push({ level, item });

    setSelectedPath(newPath);
    setBreadcrumb(newBreadcrumb);
  };

  const handleBack = (targetIndex) => {
    const newBreadcrumb = breadcrumb.slice(0, targetIndex + 1);
    const newPath = { ...selectedPath };

    const levels = ["curso", "periodo", "facultad", "carrera", "año"];

    // Reset levels after the target
    for (let i = targetIndex + 1; i < levels.length; i++) {
      newPath[levels[i]] = null;
    }

    setBreadcrumb(newBreadcrumb);
    setSelectedPath(newPath);
    // Guardar también en localStorage (opcional, pero mantiene sincronía)
    localStorage.setItem("mapaHorarios_selectedPath", JSON.stringify(newPath));
    localStorage.setItem("mapaHorarios_breadcrumb", JSON.stringify(newBreadcrumb));
  };

  const handleAction = async (action, item, level) => {
    console.log(`${action} ${level}:`, item);
    if (level === "horarios" && action === "ver") {
      navigate(`/calendario/${item.id}`);
      return;
    }
    // --------- ELIMINAR HORARIO ---------
    if (level === "horarios" && action === "eliminar") {
      if (window.confirm(`¿Está seguro que desea eliminar el horario "${item.to_string || item.__str__ || item.name || item.nombre}"? Esta acción no se puede deshacer.`)) {
        try {
          await schedulesApi.delete(item.id);
          setHorarios((prev) => prev.filter((h) => h.id !== item.id));
          alert("Horario eliminado correctamente.");
        } catch (err) {
          alert("No se pudo eliminar el horario. Verifique que no tenga elementos asociados.");
        }
      }
      return;
    }
    if (level === "facultades" && action === "editar") {
      navigate(`/facultades/${item.id}`, { state: { from: window.location.pathname } });
      return;
    }
    if (level === "facultades" && action === "eliminar") {
      if (window.confirm(`¿Está seguro que desea eliminar la facultad "${item.name}"? Esta acción no se puede deshacer.`)) {
        try {
          await facultiesApi.delete(item.id);
          // Refrescar la lista de facultades
          setFacultades((prev) => prev.filter((f) => f.id !== item.id));
        } catch (err) {
          alert("No se pudo eliminar la facultad. Verifique que no tenga elementos asociados.");
        }
      }
      return;
    }
    // --------- NUEVO: Editar periodo ---------
    if (level === "periodos" && action === "editar") {
      navigate(`/periodos/${item.id}`, { state: { from: window.location.pathname } });
      return;
    }
    // --------- NUEVO: Eliminar periodo ---------
    if (level === "periodos" && action === "eliminar") {
      if (window.confirm(`¿Está seguro que desea eliminar el período "${item.name}"? Esta acción no se puede deshacer.`)) {
        try {
          await periodsApi.delete(item.id);
          setPeriodos((prev) => prev.filter((p) => p.id !== item.id));
        } catch (err) {
          alert("No se pudo eliminar el período. Verifique que no tenga elementos asociados.");
        }
      }
      return;
    }
    // --------- NUEVO: Editar curso ---------
    if (level === "cursos" && action === "editar") {
      navigate(`/cursos/${item.id}`, { state: { from: window.location.pathname } });
      return;
    }
    // --------- NUEVO: Eliminar curso ---------
    if (level === "cursos" && action === "eliminar") {
      if (window.confirm(`¿Está seguro que desea eliminar el curso "${item.name}"? Esta acción no se puede deshacer.`)) {
        try {
          await coursesApi.delete(item.id);
          setCursos((prev) => prev.filter((c) => c.id !== item.id));
        } catch (err) {
          alert("No se pudo eliminar el curso. Verifique que no tenga elementos asociados.");
        }
      }
      return;
    }
    // --------- NUEVO: Editar carrera ---------
    if (level === "carreras" && action === "editar") {
      navigate(`/carreras/${item.id}`, { state: { from: window.location.pathname } });
      return;
    }
    // --------- NUEVO: Eliminar carrera ---------
    if (level === "carreras" && action === "eliminar") {
      if (window.confirm(`¿Está seguro que desea eliminar la carrera "${item.name}"? Esta acción no se puede deshacer.`)) {
        try {
          await careersApi.delete(item.id);
          setCarreras((prev) => prev.filter((c) => c.id !== item.id));
        } catch (err) {
          alert("No se pudo eliminar la carrera. Verifique que no tenga elementos asociados.");
        }
      }
      return;
    }
    // --------- NUEVO: Editar año ---------
    if (level === "años" && action === "editar") {
      navigate(`/años/${item.id}`, { state: { from: window.location.pathname } });
      return;
    }
    // --------- NUEVO: Eliminar año ---------
    if (level === "años" && action === "eliminar") {
      if (window.confirm(`¿Está seguro que desea eliminar el año "${item.number_choice || item.name}"? Esta acción no se puede deshacer.`)) {
        try {
          await yearsApi.delete(item.id);
          setAños((prev) => prev.filter((a) => a.id !== item.id));
        } catch (err) {
          alert("No se pudo eliminar el año. Verifique que no tenga elementos asociados.");
        }
      }
      return;
    }
    // Aquí implementarías las acciones reales
  };

  const handleCreate = (level) => {
    console.log(`Crear nuevo ${level}`);
    if (level === "facultades") {
      navigate("/facultades", { state: { from: window.location.pathname } });
      return;
    }
    // --------- NUEVO: Crear periodo ---------
    if (level === "periodos") {
      // Pasar el curso seleccionado
      const hierarchyData = {
        courseId: selectedPath.curso?.id || "",
        fromMapaHorarios: true
      };
      navigate("/periodos", { state: { from: window.location.pathname, hierarchyData } });
      return;
    }
    // --------- NUEVO: Crear curso ---------
    if (level === "cursos") {
      navigate("/cursos", { state: { from: window.location.pathname } });
      return;
    }
    // --------- NUEVO: Crear carrera ---------
    if (level === "carreras") {
      // Pasar la facultad seleccionada
      const hierarchyData = {
        facultyId: selectedPath.facultad?.id || "",
        fromMapaHorarios: true
      };
      navigate("/carreras", { state: { from: window.location.pathname, hierarchyData } });
      return;
    }
    // --------- NUEVO: Crear año ---------
    if (level === "años") {
      // Pasar la carrera seleccionada
      const hierarchyData = {
        careerId: selectedPath.carrera?.id || "",
        fromMapaHorarios: true
      };
      navigate("/años", { state: { from: window.location.pathname, hierarchyData } });
      return;
    }
    // --------- NUEVO: Crear horario ---------
    if (level === "horarios") {
      // Pasar los datos de la jerarquía seleccionada al crear horario
      const hierarchyData = {
        faculty: selectedPath.facultad?.id || "",
        career: selectedPath.carrera?.id || "",
        year: selectedPath.año?.id || "",
        courseId: selectedPath.curso?.id || "",
        period: selectedPath.periodo?.id || "",
        fromMapaHorarios: true // Flag para indicar que viene del mapa de horarios
      };
      navigate("/schedule", { state: { from: window.location.pathname, hierarchyData } });
      return;
    }
    // Aquí implementarías la creación
  };

  const handleCardClick = (item, currentLevel, event) => {
    if (event.target.closest("button")) {
      return;
    }
    // Para horarios, navegar directamente al calendario
    if (currentLevel === "horarios") {
      navigate(`/calendario/${item.id}`);
      return;
    }
    if (currentLevel !== "horarios") {
      const levelMap = {
        cursos: "curso",
        periodos: "periodo",
        facultades: "facultad",
        carreras: "carrera",
        años: "año",
      };
      handleSelect(levelMap[currentLevel], item);
    }
  };

  // Determina el nivel y los datos actuales según el path seleccionado
  const getCurrentData = () => {
    if (!selectedPath.curso)
      return { level: "cursos", data: cursos };
    if (!selectedPath.periodo)
      return { level: "periodos", data: periodos };
    if (!selectedPath.facultad)
      return { level: "facultades", data: facultades };
    if (!selectedPath.carrera)
      return { level: "carreras", data: carreras };
    if (!selectedPath.año)
      return { level: "años", data: años };
    return { level: "horarios", data: horarios };
  };

  const { level, data } = getCurrentData();

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
  const hasRole = userRole && userRole !== "user";

  const ActionButtons = ({ item, currentLevel }) => (
    <div className="flex gap-1 sm:gap-2">
      {/* Solo mostrar editar/eliminar si tiene rol */}
      {hasRole && currentLevel !== "horarios" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAction("editar", item, currentLevel);
            }}
            className="h-8 w-8 p-0 hover:bg-amber-50 hover:border-amber-300"
          >
            <Edit className="h-4 w-4 text-amber-600" />
          </Button>
        </>
      )}
      {/* Eliminar solo si tiene rol */}
      {hasRole && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAction("eliminar", item, currentLevel);
          }}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      )}
    </div>
  );

  const getLevelTitle = (level) => {
    const titles = {
      cursos: "Cursos Disponibles",
      periodos: "Períodos",
      facultades: "Facultades",
      carreras: "Carreras",
      años: "Años Disponibles",
      horarios: "Horarios",
    };
    return titles[level] || level;
  };

  const getCreateButtonText = (level) => {
    const texts = {
      cursos: "Crear Curso",
      periodos: "Crear Período",
      facultades: "Crear Facultad",
      carreras: "Crear Carrera",
      años: "Crear Año",
      horarios: "Crear Horario",
    };
    return texts[level] || "Crear";
  };

  const renderBreadcrumb = () => {
    if (breadcrumb.length === 0) return null;

    return (
      <div className="mb-6 p-3 sm:p-4 bg-white/80 border border-[#12a6b9]/20 rounded-xl shadow-sm">
        {/* Versión móvil - vertical */}
        <div className="flex flex-col gap-2 sm:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 self-start text-[#006599] font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1 text-[#006599]" />
            <span className="text-[#006599]">Inicio</span>
          </Button>
          {breadcrumb.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2 ml-4">
              <div className="w-4 h-px bg-[#12a6b9]/30"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBack(index)}
                className="h-8 px-2 font-semibold text-left flex-1 justify-start text-[#006599]"
              >
                <span className="text-[#006599]">
                  {crumb.level === "año"
                    ? crumb.item.number_choice || crumb.item.name || crumb.item.nombre
                    : crumb.level === "horarios"
                    ? crumb.item.to_string || crumb.item.__str__ || crumb.item.name || crumb.item.nombre
                    : crumb.item.name || crumb.item.nombre}
                </span>
              </Button>
            </div>
          ))}
        </div>

        {/* Versión desktop - horizontal con wrap */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 mb-1 text-[#006599] font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1 text-[#006599]" />
            <span className="text-[#006599]">Inicio</span>
          </Button>
          {breadcrumb.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-[#12a6b9] mb-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBack(index)}
                className="h-8 px-2 font-semibold mb-1 text-[#006599]"
              >
                <span className="text-[#006599]">
                  {crumb.level === "año"
                    ? crumb.item.number_choice || crumb.item.name || crumb.item.nombre
                    : crumb.level === "horarios"
                    ? crumb.item.to_string || crumb.item.__str__ || crumb.item.name || crumb.item.nombre
                    : crumb.item.name || crumb.item.nombre}
                </span>
              </Button>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderItemCard = (item) => {
    const isClickable = level !== "horarios";
    return (
      <Card
        key={item.id}
        className={`
          transition-all duration-200 border-2 border-gray-200 bg-white rounded-xl shadow-md
          ${isClickable
            ? "hover:shadow-xl hover:scale-[1.025] cursor-pointer hover:border-[#12a6b9]"
            : "hover:shadow-lg"}
          relative overflow-hidden
        `}
        onClick={(e) => handleCardClick(item, level, e)}
        style={{ minHeight: 110 }}
      >
        {/* Acento de color a la izquierda */}
        <div className="absolute left-0 top-0 h-full w-2 bg-[#12a6b9] rounded-l-xl" />
        <CardHeader className="pb-3 pl-6">
          {level !== "horarios" ? (
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg font-bold text-[#006599] truncate pr-2">
                {level === "años"
                  ? item.number_choice || item.name || item.nombre
                  : item.name || item.nombre}
              </CardTitle>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500 font-medium">
                  Toca para seleccionar
                </p>
                <div className="flex gap-1 sm:gap-2">
                  <ActionButtons item={item} currentLevel={level} />
                </div>
              </div>
            </div>
          ) : (
            // Para horarios: nombre arriba, botones abajo a la derecha
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg font-bold text-[#006599] truncate pr-2">
                {item.to_string || item.__str__ || item.name || item.nombre}
              </CardTitle>
              <div className="flex justify-end mt-2">
                <div className="flex gap-1 sm:gap-2">
                  <ActionButtons item={item} currentLevel={level} />
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-300 p-6 relative overflow-hidden">
      
      <div 
        className="fixed pointer-events-none z-0"
        style={{
          right: '-120px',
          top: '60%', 
          transform: 'translateY(-50%)',
          width: '500px',
          height: '500px',
        }}
      >
        <img 
          src={ucfLogo} 
          alt="UCF Logo" 
          className="w-full h-full object-contain opacity-10 grayscale"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#006599] drop-shadow-sm">
            Mapa de Horarios Académicos
          </h1>
          <p className="text-gray-700 text-lg font-medium">
            Navegue por la jerarquía de cursos, períodos, facultades, carreras,
            años y horarios
          </p>
        </div>

        {renderBreadcrumb()}

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#006599]">{getLevelTitle(level)}</h2>
            {hasRole && (
              <Button
                onClick={() => handleCreate(level)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 self-start sm:self-auto font-semibold text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                {getCreateButtonText(level)}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 text-lg font-medium">Cargando...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((item) => renderItemCard(item))}
            </div>
          )}
        </div>

        {!loading && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4 font-medium">
              No hay elementos disponibles en este nivel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
