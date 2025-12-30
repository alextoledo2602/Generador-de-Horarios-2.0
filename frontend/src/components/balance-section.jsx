"use client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRightCircle } from "lucide-react";
import { periodsApi, calculateBalanceApi } from "../api/tasks.api";

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

export default function BalanceSection({ data, updateData, onComplete }) {
  const weeks = data.basicInfo?.weeks || 14;
  const subjects = data.basicInfo?.subjectObjects || [];
  const timeSettings = data.timeSettings || {};

  const [balanceData, setBalanceData] = useState({
    balanceValue: 50,
    weeklyBalance: Array(weeks).fill(36),
  });

  const [autoFillValue, setAutoFillValue] = useState(36);

  const navigate = useNavigate();

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

  const preventWheelChange = (e) => {
    e.target.blur();
  };

  useEffect(() => {
    async function fetchMaxWeeklyHours() {
      if (
        !data.basicInfo?.period ||
        !data.basicInfo?.career ||
        !data.basicInfo?.year ||
        !data.basicInfo?.subjects ||
        subjects.length === 0
      ) {
        return;
      }

      const formData = {
        subjectsSymbology: subjects.map((subject) => subject.symbology),
        weeksCount: weeks,
        encountersList: subjects.map(
          (subject) => timeSettings[subject.id]?.encounters || 0
        ),
        timeBaseList: subjects.map(
          (subject) => timeSettings[subject.id]?.timeBase || 0
        ),
        activitiesList: subjects.map((subject) => {
          const activities = timeSettings[subject.id]?.activitiesPerEncounter || [];
          return activities;
        }),
        aboveList: subjects.map((subject) => {
          const above = timeSettings[subject.id]?.weeklyDistribution?.above || [];
          return above;
        }),
        belowList: subjects.map((subject) => {
          const below = timeSettings[subject.id]?.weeklyDistribution?.below || [];
          return below;
        }),
        periodId: data.basicInfo?.period || null,
        careerId: data.basicInfo?.career || null,
        yearId: data.basicInfo?.year || null,
        subjectIds: data.basicInfo?.subjects || [],
      };

      try {
        const periodResp = await periodsApi.get(data.basicInfo.period);
        const daysNotAvailableByWeek = periodResp.data.days_not_available_by_week || [];
        const opciones_turnos = [1, 2, 3, 4, 5, 6];
        let turnos_por_dia = 3;
        const dias_por_semana = 5;
        const horas_por_turno = 2;
        const fondo_horas = formData.timeBaseList;
        const turnos_asignaturas = fondo_horas.map((ele) => Math.floor(ele / 2));
        const fondo_Total_asignaturas = turnos_asignaturas.reduce((a, b) => a + b, 0) * 2;
        let t = 1;
        for (let i = 0; i < opciones_turnos.length; i++) {
          const capacidad =
            opciones_turnos[i] *
              dias_por_semana *
              horas_por_turno *
              weeks -
            daysNotAvailableByWeek.length * 2 * opciones_turnos[i];
          if (capacidad >= fondo_Total_asignaturas) {
            turnos_por_dia = opciones_turnos[i];
            t = opciones_turnos[i];
            break;
          }
        }
        let turnos_por_semana = Array(weeks).fill(turnos_por_dia * dias_por_semana * 2);
        daysNotAvailableByWeek.forEach((semana_info) => {
          const semana_dic = semana_info.numero_semana;
          if (semana_dic - 1 >= 0 && semana_dic - 1 < turnos_por_semana.length) {
            turnos_por_semana[semana_dic - 1] -= turnos_por_dia * 2;
          }
        });
        setBalanceData((prev) => ({
          ...prev,
          weeklyBalance: turnos_por_semana,
        }));
        setAutoFillValue(turnos_por_dia * dias_por_semana * 2);
      } catch (error) {
        console.error("No se pudo precargar los valores máximos de horas por semana:", error);
      }
    }
    fetchMaxWeeklyHours();
  }, [data.basicInfo?.period, data.basicInfo?.career, data.basicInfo?.year, data.basicInfo?.subjects, weeks, subjects.length]);

  useEffect(() => {
    setBalanceData((prev) => ({
      ...prev,
      weeklyBalance: adjustArrayLength(
        prev.weeklyBalance,
        weeks,
        autoFillValue
      ),
    }));
  }, [weeks, autoFillValue]);

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setBalanceData((prev) => ({
      ...prev,
      [field]: Number.parseInt(value) || 0,
    }));
  };

  const handleWeeklyBalanceChange = (index, value) => {
    if (value > 99) {
      value = 99;
    }
    setBalanceData((prev) => ({
      ...prev,
      weeklyBalance: prev.weeklyBalance.map((v, i) =>
        i === index ? Number.parseInt(value) || 0 : v
      ),
    }));
  };

  const applyMaxLoadToAll = () => {
    setBalanceData((prev) => ({
      ...prev,
      weeklyBalance: Array(weeks).fill(prev.maxLoad),
    }));
  };

  const calculateBalance = async () => {
    // Recopilar y mostrar los datos solicitados
    const formData = {
      // Enviar lista de simbologías en vez de cantidad de asignaturas
      subjectsSymbology: subjects.map((subject) => subject.symbology),
      weeksCount: weeks,
      encountersList: subjects.map(
        (subject) => timeSettings[subject.id]?.encounters || 0
      ),
      timeBaseList: subjects.map(
        (subject) => timeSettings[subject.id]?.timeBase || 0
      ),
      activitiesList: subjects.map((subject) => {
        const activities = timeSettings[subject.id]?.activitiesPerEncounter || [];
        return activities;
      }),
      aboveList: subjects.map((subject) => {
        const above = timeSettings[subject.id]?.weeklyDistribution?.above || [];
        return above;
      }),
      belowList: subjects.map((subject) => {
        const below = timeSettings[subject.id]?.weeklyDistribution?.below || [];
        return below;
      }),
      balanceBelowList: balanceData.weeklyBalance,
      tabuIterations: balanceData.balanceValue,
      periodId: data.basicInfo?.period || null,
      careerId: data.basicInfo?.career || null,
      yearId: data.basicInfo?.year || null,
      subjectIds: data.basicInfo?.subjects || [],
      group: data.basicInfo?.group || null,
      classRoom: data.basicInfo?.class_room || null,
    };


    try {
      const response = await calculateBalanceApi(formData);
      if (response.data && response.data.schedule_id) {
        navigate(`/calendario/${response.data.schedule_id}`);
      } else {
        alert("Balance calculated! Check the console for backend response.");
      }
    } catch (error) {
      console.error("=== ERROR DEL BACKEND ===");
      console.error("Error completo:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("=========================");
      
      const errorMsg = error.response?.data?.error || 
                      JSON.stringify(error.response?.data) || 
                      "Failed to calculate balance.";
      alert(`Error: ${errorMsg}`);
    }
  };

 
  const adjustArrayLength = (arr, newLength, defaultValue) => {
    if (arr.length < newLength) {
      return [...arr, ...Array(newLength - arr.length).fill(defaultValue)];
    } else if (arr.length > newLength) {
      return arr.slice(0, newLength);
    }
    return arr;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!balanceData.balanceValue || balanceData.balanceValue < 1 || balanceData.balanceValue > 999)
      newErrors.balanceValue = "El valor debe estar entre 1 y 999";
    if (balanceData.weeklyBalance.some((v) => v === undefined || v === null || v < 0))
      newErrors.weeklyBalance = "No se permiten valores negativos o vacíos en las semanas";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      updateData(balanceData);
      onComplete();
    }
  };

  const handleAutoFill = () => {
    setBalanceData((prev) => ({
      ...prev,
      weeklyBalance: Array(weeks).fill(autoFillValue),
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-xl border-2 border-white rounded-xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="w-2 h-14 bg-[#12a6b9] rounded-full mt-1"></span>
            <div>
              <CardTitle className="text-[#006599] text-2xl font-bold mb-1">
                Balance Semanal
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg font-medium">
                Configura los parámetros de balance para cada semana
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Bloque: Tabla de balance semanal */}
          <div className="bg-gradient-to-r from-[#12a6b9]/10 to-[#006599]/10 border border-[#12a6b9]/20 rounded-lg px-4 py-4 space-y-4">
            <h3 className="text-[#006599] text-xl font-bold mb-2">
              Balance máximo por semana
            </h3>
            <div className="flex justify-between items-center mb-2">
              {/* Quitar el label "Balance inferior" aquí */}
              <div />
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={autoFillValue}
                  onChange={(e) =>
                    setAutoFillValue(
                      Math.min(Number.parseInt(e.target.value) || 0, 99)
                    )
                  }
                  onWheel={preventWheelChange}
                  className={`w-20 text-base font-medium ${inputNumberNoArrowsClass}`}
                  style={inputNumberNoArrows}
                />
                <Button onClick={handleAutoFill} size="sm" className="bg-[#12a6b9] hover:bg-[#0e8a9c] text-white">
                  Auto Llenar
                </Button>
              </div>
            </div>
            <div className="border-2 border-gray-300 rounded-md overflow-x-auto bg-white/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 min-w-[96px] text-center align-middle text-base font-semibold bg-gray-100"></TableHead>
                    {Array.from({ length: weeks }, (_, i) => (
                      <TableHead
                        key={i}
                        className="w-16 min-w-[64px] text-center align-middle text-base font-semibold bg-gray-100"
                        style={{ padding: 0 }}
                      >
                        S{String(i + 1).padStart(2, "0")}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium w-24 min-w-[96px] text-center align-middle text-base bg-white" style={{ padding: 0 }}>
                      Horas
                    </TableCell>
                    {balanceData.weeklyBalance.map((value, index) => (
                      <TableCell
                        key={index}
                        className="w-16 min-w-[64px] text-center align-middle bg-white"
                        style={{ verticalAlign: "middle", padding: 0 }}
                      >
                        <div className="px-1 py-2 flex justify-center">
                          <Input
                            type="number"
                            min="0"
                            max="99"
                            value={value}
                            onChange={(e) =>
                              handleWeeklyBalanceChange(index, e.target.value)
                            }
                            onWheel={preventWheelChange}
                            className={`w-full max-w-[64px] text-center text-base font-medium border-2 border-gray-300 bg-gray-100 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${inputNumberNoArrowsClass} ${errors.weeklyBalance ? "border-red-500" : ""}`}
                            style={{ height: "36px", ...inputNumberNoArrows }}
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            {errors.weeklyBalance && (
              <p className="text-red-500 text-sm">{errors.weeklyBalance}</p>
            )}
          </div>

          {/* Bloque: Controles de balance */}
          <div className="bg-gradient-to-r from-[#12a6b9]/10 to-[#006599]/10 border border-[#12a6b9]/20 rounded-lg px-4 py-4 space-y-4">
            <h3 className="text-[#006599] text-xl font-bold mb-2">
              Control de balance
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Label htmlFor="balanceValue" className="whitespace-nowrap text-gray-700 text-base sm:text-lg font-semibold">
                  Iteraciones de optimización:
                </Label>
                <Input
                  id="balanceValue"
                  type="number"
                  min="1"
                  max="999"
                  className={`w-full sm:w-24 h-12 text-base font-medium px-4 border-2 border-gray-300 bg-gray-300 focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 ${inputNumberNoArrowsClass} ${errors.balanceValue ? "border-red-500" : ""}`}
                  value={balanceData.balanceValue}
                  onChange={(e) =>
                    handleChange("balanceValue", Math.min(Math.max(e.target.value, 1), 999))
                  }
                  onWheel={preventWheelChange}
                  style={inputNumberNoArrows}
                />
              </div>

            </div>
            {errors.balanceValue && (
              <p className="text-red-500 text-sm">{errors.balanceValue}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={async () => {
            if (validateForm()) {
              updateData(balanceData);
              await calculateBalance();
              onComplete();
            }
          }}
          className="bg-[#006599] hover:bg-[#005080] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
        >
          Generar horario <ArrowRightCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
