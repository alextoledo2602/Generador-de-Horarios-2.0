"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Save, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  format,
  addDays,
  parseISO,
  startOfWeek,
  addWeeks,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  schedulesApi,
  periodsApi,
  coursesApi,
  subjectsApi,
  class_times,
  days_not_availableApi,
  weeks_not_availableApi,
  teachersApi,
  exportarHorarioPdfApi,
  activitysApi,
} from "../api/tasks.api";
import { BalanceCargaTable } from "@/components/load-balance-table";
import { jwtDecode } from "jwt-decode";

// Componente para un turno individual que puede ser arrastrado y editado
const TurnoItem = ({
  turno,
  isEditing,
  isDragging,
  semana,
  dia,
  posicion,
  onDragStart,
  onDragEnd,
  onDragOver,
  fecha,
  subjectsMap,
  conflictoProfesor, // NUEVO
  onEdit, // NUEVO: función para editar asignatura/profesor
  activitiesMap, // NUEVO: mapa id actividad -> simbología
}) => {
  const elementRef = useRef(null);
  const [touchStarted, setTouchStarted] = useState(false);

  // Manejadores para eventos táctiles
  const handleTouchStart = (e) => {
    if (!isEditing || !turno) return;

    setTouchStarted(true);
    onDragStart(turno.id);

    // Añadir clase visual para feedback
    if (elementRef.current) {
      elementRef.current.classList.add("opacity-50");
    }

    // Prevenir scroll mientras se arrastra
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isEditing || !touchStarted) return;

    // Obtener la posición del toque
    const touch = e.touches[0];
    const { clientX, clientY } = touch;

    // Encontrar el elemento en la posición actual del toque
    const elementsAtTouch = document.elementsFromPoint(clientX, clientY);

    // Buscar si hay un elemento turno o espacio vacío bajo el toque
    const targetElement = elementsAtTouch.find(
      (el) => el.getAttribute("data-turno-cell") === "true"
    );

    if (targetElement) {
      const targetSemana = Number.parseInt(
        targetElement.getAttribute("data-semana")
      );
      const targetDia = targetElement.getAttribute("data-dia");
      const targetPosicion = Number.parseInt(
        targetElement.getAttribute("data-posicion")
      );

      onDragOver(targetSemana, targetDia, targetPosicion);

      // Añadir efecto visual al elemento destino
      targetElement.classList.add("bg-blue-50", "border-blue-500");
    }

    // Prevenir scroll mientras se arrastra
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!isEditing || !touchStarted) return;

    setTouchStarted(false);
    onDragEnd();

    // Restaurar apariencia visual
    if (elementRef.current) {
      elementRef.current.classList.remove("opacity-50");
    }

    // Eliminar efectos visuales de todos los elementos
    document.querySelectorAll("[data-turno_cell='true']").forEach((el) => {
      el.classList.remove("bg-blue-50", "border-blue-500");
    });

    // Prevenir comportamientos no deseados
    e.preventDefault();
  };

  // Utilidad para obtener la simbología de las actividades asociadas
  const getActivitiesSymbology = () => {
    if (!turno.activities || !activitiesMap) return "";
    // Soporta tanto array de ids como array de objetos
    let ids = turno.activities;
    if (Array.isArray(ids) && ids.length > 0 && typeof ids[0] === "object") {
      ids = ids.map((a) => a.id);
    }
    const syms = (ids || [])
      .map((id) => activitiesMap[id]?.symbology)
      .filter(Boolean);
    return syms.length > 0 ? syms.join("/") : "";
  };

  // Si no hay turno, mostrar un cuadro vacío
  if (!turno) {
    if (isEditing) {
      return (
        <div
          ref={elementRef}
          data-turno-cell="true"
          data-semana={semana}
          data-dia={dia}
          data-posicion={posicion}
          className="h-8 border border-dashed border-gray-200"
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver(semana, dia, posicion);
          }}
          onDrop={(e) => {
            e.preventDefault();
            onDragEnd();
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>
      );
    }
    return <div className="h-8"></div>;
  }

  // Mostrar turno (visualización y edición)
  const subjectSymb = subjectsMap[turno.subject]?.symbology || turno.subject;
  const activitiesSymb = getActivitiesSymbology();
  const displayText = activitiesSymb
    ? `${subjectSymb}/${activitiesSymb}`
    : subjectSymb;

  if (!isEditing) {
    return (
      <div className="h-8 flex items-center justify-center border border-gray-200">
        {displayText}
      </div>
    );
  }

  // Versión arrastrable cuando está en modo edición
  return (
    <div
      ref={elementRef}
      data-turno-cell="true"
      data-semana={semana}
      data-dia={dia}
      data-posicion={posicion}
      draggable={isEditing}
      onDragStart={() => onDragStart(turno.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(semana, dia, posicion);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`h-8 flex items-center justify-center border ${
        isDragging || touchStarted
          ? "border-blue-500 bg-blue-50"
          : conflictoProfesor
          ? "border-red-500 bg-red-50"
          : "border-gray-200"
      } ${isEditing ? "cursor-move" : ""}`}
      title={conflictoProfesor ? "Conflicto de profesor en este turno" : ""}
    >
      {displayText}
      {conflictoProfesor && (
        <span className="ml-1 text-red-500" title="Conflicto de profesor">
          &#9888;
        </span>
      )}
    </div>
  );
};

// Componente principal
export function HorarioAcademico({ scheduleId }) {
  const [schedule, setSchedule] = useState(null);
  const [classTimes, setClassTimes] = useState([]); // Se usará solo para mostrar, no para editar
  const [period, setPeriod] = useState(null);
  const [diasLibres, setDiasLibres] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const [originalTurnos, setOriginalTurnos] = useState([]); // copia inmutable
  const [editedTurnos, setEditedTurnos] = useState([]); // editable
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [semanasNoDisponibles, setSemanasNoDisponibles] = useState([]); // <--- NUEVO
  const [courseName, setCourseName] = useState(""); // Nuevo estado para el nombre del curso
  const [allClassTimes, setAllClassTimes] = useState([]); // NUEVO
  const [careerName, setCareerName] = useState(""); // <-- Nuevo para el nombre de la carrera
  const [yearLabel, setYearLabel] = useState(""); // <-- Nuevo para el año (ej: 1ro, 2do, etc.)
  const [teachersMap, setTeachersMap] = useState({}); // NUEVO: mapa de id -> nombre
  const [activitiesMap, setActivitiesMap] = useState({}); // NUEVO: mapa id -> simbología

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

  // Cargar el horario y sus datos asociados
  useEffect(() => {
    if (!scheduleId) return;
    const fetchSchedule = async () => {
      // Obtener el horario
      const { data: sched } = await schedulesApi.get(scheduleId);
      setSchedule(sched);

      // Obtener la carrera y el año para el título
      let careerNameValue = "";
      let yearLabelValue = "";
      try {
        if (sched.career) {
          const { data: career } = await import("../api/tasks.api").then(
            (m) => m.careersApi.get(sched.career)
          );
          careerNameValue = career.name;
        }
        if (sched.year) {
          const { data: year } = await import("../api/tasks.api").then(
            (m) => m.yearsApi.get(sched.year)
          );
          yearLabelValue = year.number_choice || year.name || "";
        }
      } catch {}
      setCareerName(careerNameValue);
      setYearLabel(yearLabelValue);

      // Obtener el periodo
      const { data: per } = await periodsApi.get(sched.period);
      setPeriod(per);

      // Obtener el nombre del curso asociado al periodo
      if (per && per.course) {
        try {
          const { data: course } = await coursesApi.get(per.course);
          setCourseName(course.name);
        } catch {
          setCourseName("");
        }
      } else {
        setCourseName("");
      }

      // Obtener las asignaturas (para mostrar simbología)
      const { data: subjects } = await subjectsApi.getAll();
      const map = {};
      subjects.forEach((s) => {
        map[s.id] = s;
      });
      setSubjectsMap(map);

      // NUEVO: Obtener todos los profesores y mapear id -> nombre
      const { data: teachers } = await teachersApi.getAll();
      const tmap = {};
      teachers.forEach((t) => {
        tmap[t.id] = t.name;
      });
      setTeachersMap(tmap);

      // Obtener las actividades y mapear id -> simbología
      const { data: activities } = await activitysApi.getAll();
      const amap = {};
      activities.forEach((a) => {
        amap[a.id] = a;
      });
      setActivitiesMap(amap);

      // Obtener los turnos (class_times)
      const { data: classTimesList } = await class_times.getAll();
      const filteredClassTimes = classTimesList.filter(
        (ct) => ct.schedule === Number(scheduleId)
      );
      setClassTimes(filteredClassTimes); // solo para mostrar
      setOriginalTurnos(JSON.parse(JSON.stringify(filteredClassTimes))); // copia inmutable
      setEditedTurnos(JSON.parse(JSON.stringify(filteredClassTimes))); // editable

      // Obtener días no disponibles SOLO del periodo actual
      const { data: diasNoDisponibles } = await days_not_availableApi.getAll();
      setDiasLibres(
        diasNoDisponibles.filter((d) => d.period === sched.period)
      );

      // Obtener semanas no disponibles SOLO del periodo actual
      const { data: semanasNoDisponibles } = await weeks_not_availableApi.getAll();
      setSemanasNoDisponibles(
        semanasNoDisponibles.filter((w) => w.period === sched.period)
      );

      // Calcular las semanas válidas (excluyendo semanas no disponibles)
      const startDate = parseISO(per.start);
      const endDate = parseISO(per.end);

      // Generar todas las semanas posibles
      let allWeeks = [];
      let current = startOfWeek(startDate, { weekStartsOn: 1 });
      let weekNum = 1;
      while (current <= endDate) {
        // Verificar si la semana está en semanas no disponibles
        const isUnavailable = semanasNoDisponibles.some(
          (w) =>
            parseISO(w.start_date) <= current && current <= parseISO(w.end_date)
        );
        if (!isUnavailable) {
          allWeeks.push({
            weekNum,
            start: current,
            end: addDays(current, 4),
          });
          weekNum++;
        }
        current = addWeeks(current, 1);
      }
      setWeeks(allWeeks);

      // NUEVO: Obtener todos los turnos de todos los horarios
      setAllClassTimes(classTimesList);
    };
    fetchSchedule();
  }, [scheduleId]);

  // Al entrar/salir de edición, sincronizar estados
  const startEditing = () => {
    setIsEditing(true);
    setEditedTurnos(JSON.parse(JSON.stringify(originalTurnos)));
    setDraggedId(null);
    setTargetPosition(null);
    setSaveError("");
  };
  const cancelarEdicion = () => {
    setEditedTurnos(JSON.parse(JSON.stringify(originalTurnos)));
    setIsEditing(false);
    setDraggedId(null);
    setTargetPosition(null);
    setSaveError("");
  };

  // Utilidad para buscar turno editable por id
  const findEditableTurno = (id) => editedTurnos.find((t) => t.id === id);

  // Drag & drop: solo intercambia asignatura, profesor y actividad
  const handleDragStart = (id) => setDraggedId(id);
  const handleDragOver = (semana, dia, posicion, fecha) => {
    if (!isEditing) return;
    setTargetPosition({ semana, dia, posicion, fecha });
  };
  const handleDragEnd = () => {
    if (!draggedId || !targetPosition) {
      setDraggedId(null);
      setTargetPosition(null);
      return;
    }
    // Buscar turno origen y destino (por id y por fecha+turno)
    const origen = findEditableTurno(draggedId);
    const destino = editedTurnos.find(
      (t) =>
        t.day === targetPosition.fecha.toISOString().slice(0, 10) &&
        t.number === targetPosition.posicion + 1
    );
    if (!origen) {
      setDraggedId(null);
      setTargetPosition(null);
      return;
    }
    let nuevosTurnos = [...editedTurnos];
    if (destino) {
      // Intercambiar solo asignatura, profesor y actividad
      nuevosTurnos = nuevosTurnos.map((t) => {
        if (t.id === origen.id) {
          return {
            ...t,
            subject: destino.subject,
            teacher: destino.teacher,
            activities: destino.activities,
          };
        }
        if (t.id === destino.id) {
          return {
            ...t,
            subject: origen.subject,
            teacher: origen.teacher,
            activities: origen.activities,
          };
        }
        return t;
      });
    } else {
      // Si no hay destino, mover el turno origen a la casilla vacía (crear uno nuevo en editedTurnos y eliminar el origen)
      const nuevaFecha = targetPosition.fecha.toISOString().slice(0, 10);
      const nuevoNumero = targetPosition.posicion + 1;
      // Eliminar el turno origen completamente
      nuevosTurnos = nuevosTurnos.filter((t) => t.id !== origen.id);
      // Crear nuevo turno (sin id, para que guardarCambios lo detecte como nuevo)
      const nuevoTurno = {
        ...origen,
        id: undefined, // sin id para que se detecte como nuevo
        day: nuevaFecha,
        number: nuevoNumero,
      };
      nuevosTurnos.push(nuevoTurno);
    }
    setEditedTurnos([...nuevosTurnos]);
    setDraggedId(null);
    setTargetPosition(null);
  };

  // Guardar cambios: solo enviar los turnos modificados en campos editables
  const guardarCambios = async () => {
    setSaving(true);
    setSaveError("");
    try {
      // 1. Crear un mapa de posiciones iniciales y editadas
      // clave: `${day}|${number}|${schedule}`
      const posKey = (t) => `${t.day}|${t.number}|${t.schedule}`;
      const origPosMap = {};
      originalTurnos.forEach((t) => {
        origPosMap[posKey(t)] = t;
      });
      const editPosMap = {};
      editedTurnos.forEach((t) => {
        editPosMap[posKey(t)] = t;
      });

      // 2. Detectar turnos a eliminar, crear y actualizar
      const turnosAEliminar = [];
      const turnosACrear = [];
      const turnosAActualizar = [];

      // a) Recorrer posiciones originales
      for (const key in origPosMap) {
        const orig = origPosMap[key];
        const edit = editPosMap[key];
        if (!edit) {
          // Antes había turno, ahora no hay: eliminar
          turnosAEliminar.push(orig);
        } else if (edit.id === orig.id) {
          // Mismo turno, comparar campos editables
          const origSubject =
            typeof orig.subject === "object" ? orig.subject.id : orig.subject;
          const currSubject =
            typeof edit.subject === "object" ? edit.subject.id : edit.subject;
          const origTeacher =
            typeof orig.teacher === "object"
              ? orig.teacher?.id
              : orig.teacher;
          const currTeacher =
            typeof edit.teacher === "object"
              ? edit.teacher?.id
              : edit.teacher;
          // --- Cambios aquí: comparar arrays de actividades ---
          const getActs = (acts) => {
            if (!acts) return [];
            if (Array.isArray(acts)) {
              if (acts.length > 0 && typeof acts[0] === "object") {
                return acts.map((a) => a.id);
              }
              return acts;
            }
            return [acts];
          };
          const origActs = getActs(orig.activities);
          const currActs = getActs(edit.activities);
          const actsChanged =
            origActs.length !== currActs.length ||
            origActs.some((id, i) => id !== currActs[i]);
          if (
            origSubject !== currSubject ||
            origTeacher !== currTeacher ||
            actsChanged
          ) {
            turnosAActualizar.push(edit);
          }
        } else {
          // Antes había un turno, ahora hay otro diferente: eliminar el original y crear el nuevo
          turnosAEliminar.push(orig);
          turnosACrear.push(edit);
        }
      }
      // b) Recorrer posiciones editadas que no estaban en original: crear
      for (const key in editPosMap) {
        if (!origPosMap[key]) {
          turnosACrear.push(editPosMap[key]);
        }
      }

      // 3. Ejecutar operaciones
      for (const t of turnosAEliminar) {
        await class_times.delete(t.id);
      }
      // --- Cambios aquí: enviar array de ids de actividades ---
      const getActsIds = (acts) => {
        if (!acts) return [];
        if (Array.isArray(acts)) {
          if (acts.length > 0 && typeof acts[0] === "object") {
            return acts.map((a) => a.id);
          }
          return acts;
        }
        return [acts];
      };
      for (const t of turnosACrear) {
        await class_times.create({
          day: t.day,
          number: t.number,
          schedule: t.schedule,
          subject: typeof t.subject === "object" ? t.subject.id : t.subject,
          teacher: typeof t.teacher === "object" ? t.teacher?.id : t.teacher,
          activities: getActsIds(t.activities),
        });
      }
      for (const t of turnosAActualizar) {
        await class_times.update(t.id, {
          day: t.day,
          number: t.number,
          schedule: t.schedule,
          subject: typeof t.subject === "object" ? t.subject.id : t.subject,
          teacher: typeof t.teacher === "object" ? t.teacher?.id : t.teacher,
          activities: getActsIds(t.activities),
        });
      }

      // Recargar los turnos desde la base de datos para reflejar los cambios
      const { data: classTimesList } = await class_times.getAll();
      const filteredClassTimes = classTimesList.filter(
        (ct) => ct.schedule === Number(scheduleId)
      );
      setClassTimes(filteredClassTimes);
      setOriginalTurnos(JSON.parse(JSON.stringify(filteredClassTimes)));
      setEditedTurnos(JSON.parse(JSON.stringify(filteredClassTimes)));
      setIsEditing(false);
    } catch (error) {
      let msg = "Error al guardar los cambios.";
      if (error.response && error.response.data) {
        msg = Object.values(error.response.data).flat().join(" ");
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar horario with confirmación
  const eliminarHorario = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    try {
      await schedulesApi.delete(scheduleId);
      alert("Horario eliminado correctamente.");
      // Opcional: redirigir o recargar la página
      window.location.href = "/"; // Cambia la ruta si quieres ir a otra página
    } catch (error) {
      alert("Error al eliminar el horario.");
    }
  };

  // Botón para exportar a PDF
  const handleExportarPDF = async () => {
    try {
      const response = await exportarHorarioPdfApi(scheduleId);
      // Crear un enlace para descargar el PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'horario.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar el horario a PDF');
    }
  };

  // Obtener los turnos para una fecha y posición específicos
  const getTurno = (fecha, posicion) => {
    const turnosArray = isEditing ? editedTurnos : classTimes;
    return (
      turnosArray.find(
        (t) => isSameDay(parseISO(t.day), fecha) && t.number === posicion + 1
      ) || null
    );
  };

  // Determinar si un día debe marcarse como libre (solo si no hay ningún turno planificado para ese día y está en días no disponibles)
  const esDiaLibre = (fecha) => {
    const hayTurnos = classTimes.some((t) => isSameDay(parseISO(t.day), fecha));
    const esNoDisponible = diasLibres.some((d) =>
      isSameDay(parseISO(d.day), fecha)
    );
    return !hayTurnos && esNoDisponible;
  };

  // Días de la semana (Lunes a Viernes)
  const diasSemana = [
    { nombre: "Lun", index: 0 },
    { nombre: "Mar", index: 1 },
    { nombre: "Mié", index: 2 },
    { nombre: "Jue", index: 3 },
    { nombre: "Vie", index: 4 },
  ];

  // NUEVO: Calcular el máximo global de turnos (number) en todos los classTimes
  const maxTurnosGlobal = Math.max(
    1,
    ...classTimes.map((t) => t.number || 1)
  );
  const maxTurnosPorDia = Math.min(maxTurnosGlobal, 6); // nunca más de 6

  // NUEVO: Para cada semana y día, crear una matriz de turnos (o null) por posición usando el máximo global
  const getTurnosSemanaDia = (week, dia) => {
    const fecha = addDays(week.start, dia.index);
    if (esDiaLibre(fecha)) return null;
    const turnosArray = Array(maxTurnosPorDia).fill(null);
    const fuente = isEditing ? editedTurnos : classTimes;
    const turnosDia = fuente
      .filter((t) => isSameDay(parseISO(t.day), fecha))
      .sort((a, b) => a.number - b.number);
    turnosDia.forEach((t) => {
      if (t.number >= 1 && t.number <= maxTurnosPorDia) {
        turnosArray[t.number - 1] = t;
      }
    });
    return turnosArray;
  };

  // NUEVO: Detección de conflicto de profesor en todos los horarios
  const tieneConflictoProfesor = (turno) => {
    if (!turno || !turno.teacher) return false;
    return allClassTimes.some(
      (t) =>
        t.id !== turno.id &&
        t.teacher === turno.teacher &&
        t.day === turno.day &&
        t.number === turno.number // <-- Corrección aquí
    );
  };

  // NUEVO: Construir leyenda de asignaturas con profesor correspondiente en este horario
  const leyendaAsignaturas = (() => {
    // Mapeo subjectId => { subject, teacherId }
    const map = {};
    classTimes.forEach((t) => {
      const subjectId = typeof t.subject === "object" ? t.subject.id : t.subject;
      // Solo tomar el primer profesor encontrado para esa asignatura en este horario
      if (!map[subjectId] && t.teacher) {
        let teacherId = typeof t.teacher === "object" ? t.teacher.id : t.teacher;
        map[subjectId] = {
          subject: subjectsMap[subjectId],
          teacherId: teacherId,
        };
      }
    });
    return Object.values(map)
      .filter(({ subject }) => subject)
      .map(({ subject, teacherId }) => ({
        subject,
        teacherName: teacherId ? teachersMap[teacherId] || "Sin profesor" : "Sin profesor",
      }))
      .sort((a, b) => a.subject.name.localeCompare(b.subject.name));
  })();

  if (!schedule || !period) return <div>Cargando horario...</div>;

  return (
    <div className="space-y-4 px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
        <div>
          <h1 className="text-[#006599] text-2xl font-bold mb-1 md:mb-0">
            {/* Título dinámico */}
            {careerName && yearLabel
              ? `Horario de ${careerName} ${yearLabel}`
              : "Horario Académico"}
          </h1>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full md:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Periodo: {format(parseISO(period.start), "dd/MM/yyyy")} -{" "}
                {format(parseISO(period.end), "dd/MM/yyyy")}
              </Button>
            </DialogTrigger>
            <DialogContent className="text-gray-800 p-0 bg-blue-50 rounded-xl shadow-lg max-w-lg">
              <DialogHeader className="p-0">
                <DialogTitle className="bg-blue-600 text-white rounded-t-xl px-6 py-4 text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  Periodo Seleccionado
                </DialogTitle>
                <DialogDescription className="hidden" />
                <div className="px-6 py-5">
                  <div className="mb-4 flex flex-col gap-2">
                    <span className="font-semibold text-blue-900 text-base flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-1 rounded font-bold text-sm">
                        {period.name}
                      </Badge>
                      <span className="ml-2 text-gray-700 font-normal text-sm">
                        ({format(parseISO(period.start), "dd/MM/yyyy")} - {format(parseISO(period.end), "dd/MM/yyyy")})
                      </span>
                    </span>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="font-semibold text-blue-800">Curso:</span>
                    <span className="bg-white border border-blue-200 rounded px-2 py-0.5 text-blue-900 font-medium">
                      {courseName || "No disponible"}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold text-blue-800 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                      Semanas no disponibles:
                    </span>
                    {semanasNoDisponibles.filter((w) => w.period === period.id).length === 0 ? (
                      <span className="ml-2 text-gray-500">Ninguna</span>
                    ) : (
                      <ul className="list-none ml-0 mt-2 space-y-1">
                        {semanasNoDisponibles
                          .filter((w) => w.period === period.id)
                          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                          .map((w) => (
                            <li key={w.id} className="flex items-center gap-2 bg-blue-100 border border-blue-200 rounded px-2 py-1">
                              <span className="font-medium text-blue-900">{w.reason}</span>
                              <span className="text-xs text-blue-700">
                                {format(parseISO(w.start_date), "dd/MM/yyyy")} - {format(parseISO(w.end_date), "dd/MM/yyyy")}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                      Días no disponibles:
                    </span>
                    {diasLibres.filter((d) => d.period === period.id).length === 0 ? (
                      <span className="ml-2 text-gray-500">Ninguno</span>
                    ) : (
                      <ul className="list-none ml-0 mt-2 space-y-1">
                        {diasLibres
                          .filter((d) => d.period === period.id)
                          .sort((a, b) => new Date(a.day) - new Date(b.day))
                          .map((d) => (
                            <li key={d.id} className="flex items-center gap-2 bg-blue-100 border border-blue-200 rounded px-2 py-1">
                              <span className="font-medium text-blue-900">{d.reason}</span>
                              <span className="text-xs text-blue-700">
                                {format(parseISO(d.day), "dd/MM/yyyy")}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {isEditing ? (
            <>
              <Button
                onClick={guardarCambios}
                variant="default"
                disabled={saving}
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                onClick={cancelarEdicion}
                variant="outline"
                disabled={saving}
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full md:w-auto"
              >
                Cancelar
              </Button>
            </>
          ) : (
            hasRole && (
              <Button
                onClick={startEditing}
                variant="outline"
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full md:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )
          )}
          <Button
            onClick={handleExportarPDF}
            variant="outline"
            className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar a PDF
          </Button>
          {hasRole && (
            <Button
              onClick={eliminarHorario}
              variant="outline"
              className="bg-white text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 w-full md:w-auto"
              title="Eliminar horario"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
      {saveError && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
          {saveError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weeks.map((week) => (
          <Card key={`semana-${week.weekNum}`} className="overflow-hidden">
            <CardHeader className="bg-blue-500 text-white p-2">
              <CardTitle className="text-center text-base">
                Semana {week.weekNum}
                <div className="text-xs font-normal">
                  {format(week.start, "dd/MM", { locale: es })} -{" "}
                  {format(week.end, "dd/MM", { locale: es })}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-5 divide-x bg-gray-100">
                {diasSemana.map((dia) => (
                  <div
                    key={`${week.weekNum}-${dia.nombre}`}
                    className="text-center text-xs font-medium p-1"
                  >
                    {dia.nombre}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 divide-x border-t">
                {diasSemana.map((dia) => {
                  const fecha = addDays(week.start, dia.index);
                  if (esDiaLibre(fecha)) {
                    return (
                      <div
                        key={`${week.weekNum}-${dia.nombre}-turnos`}
                        className="divide-y"
                      >
                        <div className="h-24 flex items-center justify-center text-gray-400">
                          Libre
                        </div>
                      </div>
                    );
                  }
                  // Obtener los turnos (o null) para cada posición de ese día usando el máximo global
                  const turnosArray = getTurnosSemanaDia(week, dia);
                  return (
                    <div
                      key={`${week.weekNum}-${dia.nombre}-turnos`}
                      className="divide-y"
                    >
                      {turnosArray.map((turno, posicion) => {
                        const isDragging = turno && draggedId === turno.id;
                        // NUEVO: calcular conflicto de profesor
                        const conflictoProfesor = tieneConflictoProfesor(turno);
                        return (
                          <div
                            key={`${week.weekNum}-${dia.nombre}-${posicion}`}
                          >
                            <TurnoItem
                              turno={turno}
                              isEditing={isEditing}
                              isDragging={!!isDragging}
                              semana={week.weekNum}
                              dia={dia.nombre}
                              posicion={posicion}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onDragOver={(sem, d, pos) =>
                                handleDragOver(
                                  week.weekNum,
                                  dia.nombre,
                                  pos,
                                  fecha
                                )
                              }
                              fecha={fecha}
                              subjectsMap={subjectsMap}
                              conflictoProfesor={conflictoProfesor} // NUEVO
                              onEdit={(field, value) => {
                                // NUEVO: Manejar edición directa de asignatura/profesor
                                setEditedTurnos((prev) =>
                                  prev.map((t) =>
                                    t.id === turno.id
                                      ? { ...t, [field]: value }
                                      : t
                                  )
                                );
                              }}
                              activitiesMap={activitiesMap} // NUEVO
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Leyenda de asignaturas y profesores SIEMPRE visible */}
      <div className="mt-8 flex flex-col md:flex-row gap-8">
        {/* Leyenda de asignaturas y profesores */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-[#006599]">
            Asignaturas y Profesores
          </h2>
          <div
            className="flex flex-col gap-1 rounded-lg border border-blue-200 bg-white shadow px-6 py-4 w-fit"
            style={{
              minWidth: "260px",
              maxWidth: "100%",
            }}
          >
            {leyendaAsignaturas.map(({ subject, teacherName }) => (
              <div
                key={subject.id}
                className="flex items-center justify-between py-1"
                style={{ minWidth: "210px" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono font-semibold text-blue-700 bg-blue-50 rounded px-2 py-0.5 border border-blue-200 text-center"
                    style={{
                      width: "2.7rem",
                      display: "inline-block",
                      fontSize: "1.1rem",
                    }}
                    title={subject.symbology}
                  >
                    {(subject.symbology || subject.name || "")
                      .toUpperCase()
                      .slice(0, 3)
                      .padEnd(3, " ")}
                  </span>
                  <span
                    className="text-gray-800"
                    style={{ fontSize: "1.08rem" }}
                  >
                    {subject.name}
                  </span>
                </div>
                <span
                  className="text-blue-900 text-sm font-medium whitespace-nowrap ml-4"
                  style={{
                    fontSize: "1.05rem",
                    minWidth: "80px",
                    textAlign: "right",
                  }}
                >
                  {teacherName}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Leyenda de actividades usadas en el horario */}
        {(() => {
          // Obtener IDs de actividades usadas en los turnos
          const actividadesUsadasIds = Array.from(
            new Set(
              classTimes.flatMap((t) => t.activities || [])
            )
          );
          // Mapear a objetos de actividad
          const actividadesUsadas = actividadesUsadasIds
            .map((id) => activitiesMap[id])
            .filter(Boolean);
          if (actividadesUsadas.length === 0) return null;
          return (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[#006599]">
                Actividades
              </h2>
              <div
                className="flex flex-col gap-1 rounded-lg border border-blue-200 bg-white shadow px-6 py-4 w-fit"
                style={{
                  minWidth: "210px",
                  maxWidth: "100%",
                }}
              >
                {actividadesUsadas.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="flex items-center justify-between py-1"
                    style={{ minWidth: "180px" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono font-semibold text-blue-700 bg-blue-50 rounded px-2 py-0.5 border border-blue-200 text-center"
                        style={{
                          width: "2.7rem",
                          display: "inline-block",
                          fontSize: "1.1rem",
                        }}
                        title={actividad.symbology}
                      >
                        {(actividad.symbology || "").toString().toUpperCase().slice(0, 3).padEnd(3, " ")}
                      </span>
                      <span
                        className="text-gray-800"
                        style={{ fontSize: "1.08rem" }}
                      >
                        {actividad.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
      {/* El balance de carga solo para usuarios con rol */}
      {hasRole && <BalanceCargaTable scheduleId={scheduleId} />}
    </div>
  );
}
