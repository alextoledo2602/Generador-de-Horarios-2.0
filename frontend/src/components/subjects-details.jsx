"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  facultiesApi,
  careersApi,
  yearsApi,
  subjectsApi,
} from "../api/tasks.api";

// Definir API_BASE_URL directamente desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function SubjectsDetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [careers, setCareers] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [availableCareers, setAvailableCareers] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const navigate = useNavigate();

  // Cargar todas las facultades
  useEffect(() => {
    facultiesApi.getAll().then(res => setFaculties(res.data));
  }, []);

  // Cargar todas las carreras
  useEffect(() => {
    careersApi.getAll().then(res => setCareers(res.data));
  }, []);

  useEffect(() => {
    yearsApi.getAll().then(res => setYears(res.data));
  }, []);

  useEffect(() => {
    subjectsApi.getAll().then(res => setSubjects(res.data));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access");
    fetch(`${API_BASE_URL}/tasks/api/v1/teachers/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) return [];
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setTeachers(data);
        else setTeachers([]);
      })
      .catch(() => setTeachers([]));
  }, []);

  // Actualizar carreras disponibles cuando cambia la facultad
  useEffect(() => {
    if (selectedFaculty) {
      setAvailableCareers(
        careers.filter((career) => String(career.faculty) === String(selectedFaculty))
      );
      setSelectedCareer("");
      setSelectedYear("");
    } else {
      setAvailableCareers([]);
      setSelectedCareer("");
      setSelectedYear("");
    }
  }, [selectedFaculty, careers]);

  // Actualizar años disponibles cuando cambia la carrera
  useEffect(() => {
    if (selectedCareer) {
      setAvailableYears(
        years.filter((year) => String(year.career) === String(selectedCareer))
      );
      setSelectedYear("");
    } else {
      setAvailableYears([]);
      setSelectedYear("");
    }
  }, [selectedCareer, years]);

  useEffect(() => {
    let result = subjects;

    if (selectedFaculty) {
      const careerIds = availableCareers.map(c => c.id);
      result = result.filter(subject =>
        careerIds.includes(subject.career)
      );
    }

    if (selectedCareer) {
      result = result.filter(subject => String(subject.career) === String(selectedCareer));
    }

    if (selectedYear) {
      result = result.filter(subject => String(subject.year) === String(selectedYear));
    }

    if (searchTerm) {
      result = result.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubjects(result);
  }, [searchTerm, selectedFaculty, selectedCareer, selectedYear, subjects, availableCareers]);

  // Métodos auxiliares para obtener nombres
  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => String(f.id) === String(facultyId));
    return faculty ? faculty.name : "Desconocido";
  };

  const getCareerName = (careerId) => {
    const career = careers.find(c => String(c.id) === String(careerId));
    return career ? career.name : "Desconocido";
  };

  const getYearName = (yearId) => {
    const year = years.find(y => String(y.id) === String(yearId));
    return year ? year.number_choice || year.number : "Desconocido";
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "simple":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "optativa":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "electiva":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Obtener profesores como string (siempre nombres)
  const getProfessorsStr = (subject) => {
    if (subject.teachers_str) return subject.teachers_str;
    if (Array.isArray(subject.teachers) && subject.teachers.length > 0 && Array.isArray(teachers)) {
      // Si son ids, buscar los nombres
      const names = subject.teachers
        .map((tid) => {
          const t = teachers.find((tt) => tt.id === tid);
          return t ? t.name : null;
        })
        .filter(Boolean);
      return names.length > 0 ? names.join(", ") : "Sin profesor";
    }
    return "Sin profesor";
  };

  // Editar/eliminar (simulado)
  const handleEditCourse = (subjectId) => {
    navigate(`/asignaturas/${subjectId}`);
  };

  const handleDeleteCourse = async (subjectId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta asignatura?")) {
      try {
        await subjectsApi.delete(subjectId);
        setFilteredSubjects(filteredSubjects.filter(s => s.id !== subjectId));
        setSubjects(subjects.filter(s => s.id !== subjectId));
      } catch (error) {
        alert("Error al eliminar la asignatura.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center text-[#006599]">
          Detalle de Asignaturas
        </h1>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/asignaturas")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Crear Asignatura
        </Button>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fila superior: Buscador y Facultad */}
          <div className="flex flex-col md:flex-row md:gap-4 col-span-1 md:col-span-2">
            <div className="relative flex-1 mb-4 md:mb-0">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Buscar asignatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-gray-900 dark:text-gray-100 bg-gray-300 border-2 border-gray-300 rounded-xl h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200"
              />
            </div>
            <div className="relative flex-1">
              <select
                value={selectedFaculty}
                onChange={e => setSelectedFaculty(e.target.value)}
                className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl h-12 px-4 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
              >
                <option value="">Facultad</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              {selectedFaculty && (
                <button
                  onClick={() => setSelectedFaculty("")}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Limpiar selección"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
          {/* Fila inferior: Carrera y Año */}
          <div className="flex flex-col md:flex-row md:gap-4 col-span-1 md:col-span-2">
            <div className="relative flex-1 mb-4 md:mb-0">
              <select
                value={selectedCareer}
                onChange={e => setSelectedCareer(e.target.value)}
                disabled={!selectedFaculty}
                className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl h-12 px-4 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
              >
                <option value="">Carrera</option>
                {availableCareers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
              {selectedCareer && (
                <button
                  onClick={() => setSelectedCareer("")}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Limpiar selección"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="relative flex-1">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                disabled={!selectedCareer}
                className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl h-12 px-4 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
              >
                <option value="">Año</option>
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.number_choice || year.number}
                  </option>
                ))}
              </select>
              {selectedYear && (
                <button
                  onClick={() => setSelectedYear("")}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Limpiar selección"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subjects list */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[1.25rem] font-semibold">{subject.name}</h3>
                  <Badge className={getTypeClass(subject.type)}>
                    {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 text-[1.08rem]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Facultad:
                    </span>
                    <span>{getFacultyName(
                      (careers.find(c => c.id === subject.career) || {}).faculty
                    )}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Carrera:
                    </span>
                    <span>{getCareerName(subject.career)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Año:
                    </span>
                    <span>{getYearName(subject.year)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Fondo de hora:
                    </span>
                    <span>{subject.hours_found} horas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Profesor(es):
                    </span>
                    <span className="text-right max-w-[60%]">
                      {getProfessorsStr(subject)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/asignaturas/${subject.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteCourse(subject.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron asignaturas con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
