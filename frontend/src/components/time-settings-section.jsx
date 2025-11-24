"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, ArrowLeft, ArrowRightCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultTimeSettings } from "@/data/timeSettingsData";
import { activitysApi } from "@/api/tasks.api";

function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("lg");
  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setBreakpoint("sm");
      else if (window.innerWidth < 1024) setBreakpoint("md");
      else setBreakpoint("lg");
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return breakpoint;
}

const preventWheelChange = (e) => {
  e.target.blur();
};

export default function TimeSettingsSection({ data, updateData, onComplete }) {
  const subjects = data.basicInfo?.subjectObjects || [];
  const weeks = data.basicInfo?.weeks || 14;
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    activitysApi
      .getAll()
      .then((response) => {
        const formattedActivities = response.data.map((activity) => ({
          id: activity.id,
          name: activity.name,
          abbreviation: activity.symbology.toString(),
        }));
        setActivities(formattedActivities);
      })
      .catch((error) => {
        console.error("Error al cargar actividades:", error);
      })
      .finally(() => {
        setLoadingActivities(false);
      });
  }, []);

  // Estado para la configuración de cada asignatura
  const [subjectSettings, setSubjectSettings] = useState(() => {
    const initialSettings = {};
    subjects.forEach((subject) => {
      initialSettings[subject.id] = data.timeSettings?.[subject.id] || {
        ...defaultTimeSettings,
        timeBase: subject.hours_found || defaultTimeSettings.timeBase,
        weeklyDistribution: {
          above: Array(weeks).fill(6), // Cambiado a 6
          below: Array(weeks).fill(0), // Cambiado a 0
        },
      };
    });
    return initialSettings;
  });

  useEffect(() => {
    // Actualizar subjectSettings cuando cambian las asignaturas o las semanas
    setSubjectSettings((prev) => {
      const newSettings = { ...prev };
      subjects.forEach((subject) => {
        if (!newSettings[subject.id]) {
          newSettings[subject.id] = {
            ...defaultTimeSettings,
            timeBase: subject.hours_found || defaultTimeSettings.timeBase,
            weeklyDistribution: {
              above: Array(weeks).fill(6), // Cambiado a 6
              below: Array(weeks).fill(0), // Cambiado a 0
            },
          };
        } else {
          // Ajustar la longitud de weeklyDistribution si cambian las semanas
          newSettings[subject.id].weeklyDistribution.above = adjustArrayLength(
            newSettings[subject.id].weeklyDistribution.above,
            weeks,
            6 // Cambiado a 6
          );
          newSettings[subject.id].weeklyDistribution.below = adjustArrayLength(
            newSettings[subject.id].weeklyDistribution.below,
            weeks,
            0 // Cambiado a 0
          );
          // Actualizar timeBase si cambió en la BD
          if (
            subject.hours_found &&
            subject.hours_found !== newSettings[subject.id].timeBase
          ) {
            newSettings[subject.id].timeBase = subject.hours_found;
          }
        }
      });
      Object.keys(newSettings).forEach((id) => {
        if (!subjects.find((s) => s.id === Number(id))) {
          delete newSettings[id];
        }
      });
      return newSettings;
    });
  }, [subjects, weeks]);

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [autoFillValue, setAutoFillValue] = useState({
    hoursPerEncounter: 2,
    weeklyDistributionAbove: 6, // Valor por defecto cambiado a 6
    weeklyDistributionBelow: 0, // Valor por defecto cambiado a 0
  });
  const [selectedActivities, setSelectedActivities] = useState([]);

  const currentSubject = subjects[currentSubjectIndex];
  const currentSettings = currentSubject
    ? subjectSettings[currentSubject.id] || {
        ...defaultTimeSettings,
        weeklyDistribution: {
          above: Array(weeks).fill(2),
          below: Array(weeks).fill(4),
        },
      }
    : {};

  const breakpoint = useBreakpoint();

  const inputNumberNoArrows =
    breakpoint === "sm" || breakpoint === "md"
      ? {
          MozAppearance: "textfield",
          appearance: "textfield",
        }
      : {};

  const inputNumberNoArrowsClass =
    breakpoint === "sm" || breakpoint === "md"
      ? "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      : "";

  const handleSettingChange = (field, value, index = null) => {
    if (!currentSubject) return;
    let val = value;
    if (field === "encounters" && val > 800) val = 800;
    else if (field === "timeBase" && val > 999) val = 999; // Cambiado a 999
    else if (field === "hoursPerEncounter" && index !== null && val > 12)
      val = 12;

    const newSettings = {
      ...subjectSettings,
      [currentSubject.id]: {
        ...subjectSettings[currentSubject.id],
        [field]:
          index !== null
            ? subjectSettings[currentSubject.id][field].map((v, i) =>
                i === index ? Number.parseInt(val) || 0 : v
              )
            : Number.parseInt(val) || 0,
      },
    };

    if (field === "encounters") {
      const newEncounters = Number.parseInt(val) || 0;
      newSettings[currentSubject.id].hoursPerEncounter = adjustArrayLength(
        newSettings[currentSubject.id].hoursPerEncounter,
        newEncounters,
        2
      );
      newSettings[currentSubject.id].activitiesPerEncounter = adjustArrayLength(
        newSettings[currentSubject.id].activitiesPerEncounter ||
          Array(newEncounters).fill(""),
        newEncounters,
        ""
      );
    }

    setSubjectSettings(newSettings);
    updateData(newSettings);
  };

  const handleActivityChange = (index, value) => {
    if (!currentSubject) return;
    const newSettings = {
      ...subjectSettings,
      [currentSubject.id]: {
        ...subjectSettings[currentSubject.id],
        activitiesPerEncounter: (
          subjectSettings[currentSubject.id].activitiesPerEncounter ||
          Array(currentSettings.encounters).fill("")
        ).map((v, i) => (i === index ? value : v)),
      },
    };
    setSubjectSettings(newSettings);
    updateData(newSettings);
  };

  const handleWeeklyDistributionChange = (type, index, value) => {
    if (!currentSubject) return;
    let val = value;
    if (val > 12) val = 12;
    setSubjectSettings((prev) => ({
      ...prev,
      [currentSubject.id]: {
        ...prev[currentSubject.id],
        weeklyDistribution: {
          ...prev[currentSubject.id].weeklyDistribution,
          [type]: prev[currentSubject.id].weeklyDistribution[type].map((v, i) =>
            i === index ? Number.parseInt(val) || 0 : v
          ),
        },
      },
    }));
  };

  const navigateSubject = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(currentSubjectIndex + 1, subjects.length - 1)
        : Math.max(currentSubjectIndex - 1, 0);
    setCurrentSubjectIndex(newIndex);
  };

  const validateSettings = () => {
    const newErrors = {};
    subjects.forEach((subject) => {
      const settings = subjectSettings[subject.id];
      if (!settings.timeBase || settings.timeBase < 1)
        newErrors[`${subject.id}_timeBase`] = "El fondo de horas es obligatorio";
      if (!settings.encounters || settings.encounters < 1)
        newErrors[`${subject.id}_encounters`] =
          "El campo encuentros es obligatorio";
      if (
        settings.hoursPerEncounter &&
        settings.hoursPerEncounter.some((h) => h < 1)
      )
        newErrors[`${subject.id}_hours`] =
          "Las horas por encuentro deben ser mayores a 0";
      // Validación adicional: suma de valores 'abajo' <= encuentros
      const sumaAbajo = (settings.weeklyDistribution?.below || []).reduce(
        (acc, v) => acc + (Number(v) || 0),
        0
      );
      if (sumaAbajo > (settings.encounters || 0)) {
        newErrors[`${subject.id}_weeklyDistributionBelow`] = `La suma de los valores 'Abajo' (${sumaAbajo}) no puede ser mayor que la cantidad de encuentros (${settings.encounters}) para la asignatura '${subject.name}'.`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setGlobalError("Ha ocurrido un error en la configuración. Por favor, revisa los campos de todas las asignaturas.");
    } else {
      setGlobalError("");
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateSettings()) {
      updateData(subjectSettings);
      onComplete();
    }
  };

  const handleAutoFill = (field) => {
    if (!currentSubject) return;
    const newSettings = { ...subjectSettings };
    let value = autoFillValue[field];
    if (value > 12) value = 12;

    if (field === "hoursPerEncounter") {
      newSettings[currentSubject.id].hoursPerEncounter = Array(
        currentSettings.encounters
      ).fill(value);
    } else if (field === "weeklyDistributionAbove") {
      newSettings[currentSubject.id].weeklyDistribution.above =
        Array(weeks).fill(value);
    } else if (field === "weeklyDistributionBelow") {
      newSettings[currentSubject.id].weeklyDistribution.below =
        Array(weeks).fill(value);
    }

    setSubjectSettings(newSettings);
    updateData(newSettings);
  };

  const handleActivityToggle = (activityId) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const applySelectedActivitiesToInput = (index) => {
    if (selectedActivities.length === 0) return;
    const activityValues = selectedActivities
      .map((id) => activities.find((a) => a.id === id)?.abbreviation)
      .filter(Boolean)
      .join(","); // Cambiado de '/' a ','
    handleActivityChange(index, activityValues);
  };

  // Helper para ajustar longitud de arrays
  function adjustArrayLength(arr, newLength, defaultValue) {
    if (!arr) arr = [];
    if (arr.length < newLength) {
      return [...arr, ...Array(newLength - arr.length).fill(defaultValue)];
    } else if (arr.length > newLength) {
      return arr.slice(0, newLength);
    }
    return arr;
  }

  if (subjects.length === 0) {
    return (
      <Card className="bg-white shadow-xl border-2 border-white rounded-xl">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground text-lg font-medium">
            Por favor, selecciona asignaturas en la sección de Información Básica.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-xl border-2 border-white rounded-xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="w-2 h-14 bg-[#12a6b9] rounded-full mt-1"></span>
            <div>
              <CardTitle className="text-[#006599] text-2xl font-bold mb-1">
                Configuración de Horarios
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg font-medium">
                Configura los parámetros requeridos para cada asignatura
                seleccionada
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Bloque: Selección y datos básicos de asignatura */}
          <div className="bg-gradient-to-r from-[#12a6b9]/10 to-[#006599]/10 border border-[#12a6b9]/20 rounded-lg px-4 py-4 space-y-4">
            {/* Quitar la línea vertical aquí */}
            <h3 className="text-[#006599] text-xl font-bold mb-2">
              Asignatura y parámetros principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 text-lg font-semibold">
                  Asignatura
                </Label>
                <Select
                  value={currentSubject?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const idx = subjects.findIndex(
                      (s) => s.id.toString() === value
                    );
                    setCurrentSubjectIndex(idx);
                  }}
                >
                  <SelectTrigger className="bg-gray-300 border-2 border-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200">
                    <SelectValue
                      placeholder="Selecciona asignatura"
                      className="text-base font-medium"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                        className="text-base font-medium"
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 text-lg font-semibold">
                  Simbología
                </Label>
                <Input
                  value={currentSubject?.symbology || ""}
                  readOnly
                  className="bg-gray-300 border-2 border-gray-300 h-12 text-base font-medium px-4 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="timeBase"
                  className="text-gray-700 text-lg font-semibold"
                >
                  Fondo de horas
                </Label>
                <Input
                  id="timeBase"
                  type="number"
                  min="1"
                  max="999"
                  value={currentSettings.timeBase}
                  onChange={(e) =>
                    handleSettingChange("timeBase", e.target.value)
                  }
                  onWheel={preventWheelChange}
                  className={`bg-gray-300 border-2 border-gray-300 h-12 text-base font-medium px-4 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${
                    errors[`${currentSubject?.id}_timeBase`]
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {errors[`${currentSubject?.id}_timeBase`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`${currentSubject?.id}_timeBase`]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="encounters"
                  className="text-gray-700 text-lg font-semibold"
                >
                  Encuentros
                </Label>
                <Input
                  id="encounters"
                  type="number"
                  min="0"
                  max="800"
                  value={
                    currentSettings.encounters === 0 ||
                    currentSettings.encounters === undefined
                      ? ""
                      : currentSettings.encounters
                  }
                  onChange={(e) =>
                    handleSettingChange("encounters", e.target.value)
                  }
                  onWheel={preventWheelChange}
                  className={`bg-gray-300 border-2 border-gray-300 h-12 text-base font-medium px-4 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${
                    errors[`${currentSubject?.id}_encounters`]
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {errors[`${currentSubject?.id}_encounters`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`${currentSubject?.id}_encounters`]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bloque: Horas y actividades por encuentro */}
          <div className="bg-gradient-to-r from-[#12a6b9]/10 to-[#006599]/10 border border-[#12a6b9]/20 rounded-lg px-4 py-4 space-y-4">
            {/* Quitar la línea vertical aquí */}
            <h3 className="text-[#006599] text-xl font-bold mb-2">
              Horas y actividades por encuentro
            </h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <Label className="text-gray-700 text-base sm:text-lg font-semibold">
                Horas y actividades por encuentro
              </Label>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Input
                  type="number"
                  min="0"
                  max="12"
                  value={autoFillValue.hoursPerEncounter}
                  onChange={(e) =>
                    setAutoFillValue((prev) => ({
                      ...prev,
                      hoursPerEncounter: Math.min(
                        Number.parseInt(e.target.value) || 0,
                        12
                      ),
                    }))
                  }
                  onWheel={preventWheelChange}
                  className="w-20 text-base font-medium"
                />
                <Button
                  onClick={() => handleAutoFill("hoursPerEncounter")}
                  size="sm"
                  className="bg-[#12a6b9] hover:bg-[#0e8a9c] text-white whitespace-nowrap"
                >
                  Auto Llenar
                </Button>
              </div>
            </div>
            <div
              className="border-2 border-gray-300 rounded-md overflow-x-auto bg-white/80"
              style={{
                WebkitOverflowScrolling: "touch",
                minWidth: "100%",
                width: "100%",
                boxSizing: "border-box",
                maxWidth: "100%",
              }}
            >
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-base font-semibold bg-gray-100">
                      Tipo
                    </TableHead>
                    {Array.from(
                      { length: currentSettings.encounters || 0 },
                      (_, i) => (
                        <TableHead
                          key={i}
                          className="text-center min-w-[64px] text-base font-semibold bg-gray-100"
                        >
                          {i + 1}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-base bg-white">
                      Horas
                    </TableCell>
                    {(currentSettings.hoursPerEncounter || [])
                      .slice(0, currentSettings.encounters)
                      .map((hours, index) => (
                        <TableCell key={index} className="p-0 bg-white">
                          <div className="px-1 py-2 flex justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="12"
                              value={hours}
                              onChange={(e) =>
                                handleSettingChange(
                                  "hoursPerEncounter",
                                  e.target.value,
                                  index
                                )
                              }
                              onWheel={preventWheelChange}
                              className={`w-full max-w-[64px] text-center py-1 text-base font-medium border-2 border-gray-300 bg-gray-100 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${inputNumberNoArrowsClass} ${
                                errors[`${currentSubject?.id}_hours`]
                                  ? "border-red-500"
                                  : ""
                              }`}
                              style={{
                                height: "36px",
                                ...inputNumberNoArrows,
                              }}
                            />
                          </div>
                        </TableCell>
                      ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-base bg-white">
                      Actividades
                    </TableCell>
                    {(
                      currentSettings.activitiesPerEncounter ||
                      Array(currentSettings.encounters).fill("")
                    )
                      .slice(0, currentSettings.encounters)
                      .map((activity, index) => (
                        <TableCell key={index} className="p-0 bg-white">
                          <div className="px-1 py-2 flex justify-center">
                            <Input
                              type="text"
                              value={activity}
                              onChange={(e) =>
                                handleActivityChange(index, e.target.value)
                              }
                              onClick={() =>
                                applySelectedActivitiesToInput(index)
                              }
                              className="w-full max-w-[64px] text-center py-1 text-base font-medium border-2 border-gray-300 bg-gray-100 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200"
                              style={{ height: "36px" }}
                            />
                          </div>
                        </TableCell>
                      ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            {/* Activity Selector */}
            <div className="mt-4 p-4 border rounded-md bg-white/80">
              <Label className="mb-2 block text-gray-700 text-lg font-semibold">
                Selecciona las actividades (haz clic en las celdas para aplicar)
              </Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {loadingActivities ? (
                  <p className="text-gray-500">Cargando actividades...</p>
                ) : activities.length === 0 ? (
                  <p className="text-red-500">
                    No hay actividades definidas. Por favor, agrega las
                    actividades si desea declararlas en los turnos.
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`activity-${activity.id}`}
                        checked={selectedActivities.includes(activity.id)}
                        onCheckedChange={() =>
                          handleActivityToggle(activity.id)
                        }
                      />
                      <Label
                        htmlFor={`activity-${activity.id}`}
                        className="cursor-pointer text-gray-700 text-base font-medium"
                      >
                        {activity.name} ({activity.abbreviation})
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bloque: Distribución semanal */}
          <div className="bg-gradient-to-r from-[#12a6b9]/10 to-[#006599]/10 border border-[#12a6b9]/20 rounded-lg px-4 py-4 space-y-4">
            {/* Quitar la línea vertical aquí */}
            <h3 className="text-[#006599] text-xl font-bold mb-2">
              Distribución semanal
            </h3>
            {/* Mostrar error de suma de abajo aquí */}
            {errors[`${currentSubject?.id}_weeklyDistributionBelow`] && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-base font-medium">
                {errors[`${currentSubject?.id}_weeklyDistributionBelow`]}
              </div>
            )}
            <div
              className={
                breakpoint === "sm"
                  ? "flex flex-col gap-2 mb-2"
                  : "flex flex-col sm:flex-row justify-end gap-2 sm:space-x-4 mb-2"
              }
            >
              <div className="flex items-center space-x-2">
                <Label className="text-sm sm:text-base font-medium whitespace-nowrap">Arriba:</Label>
                <Input
                  type="number"
                  min="0"
                  max="12"
                  value={autoFillValue.weeklyDistributionAbove}
                  onChange={(e) =>
                    setAutoFillValue((prev) => ({
                      ...prev,
                      weeklyDistributionAbove: Math.min(
                        Number.parseInt(e.target.value) || 0,
                        12
                      ),
                    }))
                  }
                  onWheel={preventWheelChange}
                  className="w-16 sm:w-20 text-sm sm:text-base font-medium"
                />
                <Button
                  onClick={() => handleAutoFill("weeklyDistributionAbove")}
                  size="sm"
                  className="bg-[#12a6b9] hover:bg-[#0e8a9c] text-white whitespace-nowrap text-xs sm:text-sm"
                >
                  Auto Llenar
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm sm:text-base font-medium whitespace-nowrap">Abajo:</Label>
                <Input
                  type="number"
                  min="0"
                  max="12"
                  value={autoFillValue.weeklyDistributionBelow}
                  onChange={(e) =>
                    setAutoFillValue((prev) => ({
                      ...prev,
                      weeklyDistributionBelow: Math.min(
                        Number.parseInt(e.target.value) || 0,
                        12
                      ),
                    }))
                  }
                  onWheel={preventWheelChange}
                  className="w-16 sm:w-20 text-sm sm:text-base font-medium"
                />
                <Button
                  onClick={() => handleAutoFill("weeklyDistributionBelow")}
                  size="sm"
                  className="bg-[#12a6b9] hover:bg-[#0e8a9c] text-white whitespace-nowrap text-xs sm:text-sm"
                >
                  Auto Llenar
                </Button>
              </div>
            </div>
            <div
              className="border-2 border-gray-300 rounded-md overflow-x-auto bg-white/80"
              style={{
                WebkitOverflowScrolling: "touch",
                minWidth: "100%",
                width: "100%",
                boxSizing: "border-box",
                maxWidth: "100%",
              }}
            >
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold bg-gray-100">
                      Planificación
                    </TableHead>
                    {Array.from({ length: weeks }, (_, i) => (
                      <TableHead
                        key={i}
                        className="text-center min-w-[64px] text-base font-semibold bg-gray-100"
                      >
                        S{String(i + 1).padStart(2, "0")}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-base bg-white">
                      Arriba
                    </TableCell>
                    {(currentSettings.weeklyDistribution?.above || [])
                      .slice(0, weeks)
                      .map((value, index) => (
                        <TableCell key={index} className="p-0 bg-white">
                          <div className="px-1 py-2 flex justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="12"
                              value={value}
                              onChange={(e) =>
                                handleWeeklyDistributionChange(
                                  "above",
                                  index,
                                  e.target.value
                                )
                              }
                              onWheel={preventWheelChange}
                              className={`w-full max-w-[64px] text-center py-1 text-base font-medium border-2 border-gray-300 bg-gray-100 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${inputNumberNoArrowsClass}`}
                              style={{
                                height: "36px",
                                ...inputNumberNoArrows,
                              }}
                            />
                          </div>
                        </TableCell>
                      ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-base bg-white">
                      Abajo
                    </TableCell>
                    {(currentSettings.weeklyDistribution?.below || [])
                      .slice(0, weeks)
                      .map((value, index) => (
                        <TableCell key={index} className="p-0 bg-white">
                          <div className="px-1 py-2 flex justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="12"
                              value={value}
                              onChange={(e) =>
                                handleWeeklyDistributionChange(
                                  "below",
                                  index,
                                  e.target.value
                                )
                              }
                              onWheel={preventWheelChange}
                              className={`w-full max-w-[64px] text-center py-1 text-base font-medium border-2 border-gray-300 bg-gray-100 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${inputNumberNoArrowsClass}`}
                              style={{
                                height: "36px",
                                ...inputNumberNoArrows,
                              }}
                            />
                          </div>
                        </TableCell>
                      ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => navigateSubject("prev")}
              disabled={currentSubjectIndex === 0}
              className="w-full sm:w-auto text-sm sm:text-base font-medium"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
              <span className="hidden sm:inline">Asignatura anterior</span>
              <span className="sm:hidden">Anterior</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateSubject("next")}
              disabled={currentSubjectIndex === subjects.length - 1}
              className="w-full sm:w-auto text-sm sm:text-base font-medium"
            >
              <span className="hidden sm:inline">Siguiente asignatura</span>
              <span className="sm:hidden">Siguiente</span>
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {globalError && (
          <div className="mb-4 w-full text-center p-2 bg-red-100 text-red-700 rounded text-base font-semibold">
            {globalError}
          </div>
        )}
        <Button
          onClick={handleSubmit}
          className="bg-[#006599] hover:bg-[#005080] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
        >
          Continuar <ArrowRightCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
