"use client";
import {
  facultiesApi,
  careersApi,
  coursesApi,
  yearsApi,
  periodsApi,
  subjectsApi,
} from "../api/tasks.api";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";

export default function BasicInfoSection({ data, updateData, onComplete }) {
  const [localData, setLocalData] = useState({ ...data });
  const [errors, setErrors] = useState({});
  const [faculties, setFaculties] = useState([]);
  const [careers, setCareers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  // Obtener facultades desde el backend
  useEffect(() => {
    facultiesApi
      .getAll()
      .then((response) => {
        setFaculties(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener facultades:", error);
      });
  }, []);

  // Obtener carreras filtradas por facultad
  useEffect(() => {
    if (localData.faculty) {
      careersApi
        .getAll()
        .then((response) => {
          const filteredCareers = response.data.filter(
            (career) => career.faculty === localData.faculty
          );
          setCareers(filteredCareers);
        })
        .catch((error) => {
          console.error("Error al obtener carreras:", error);
        });
    } else {
      setCareers([]);
    }
  }, [localData.faculty]);

  // Obtener cursos desde el backend
  useEffect(() => {
    coursesApi
      .getAll()
      .then((response) => {
        const sortedCourses = response.data.sort((a, b) => b.id - a.id);
        setCourses(sortedCourses);
      })
      .catch((error) => {
        console.error("Error al obtener cursos:", error);
      });
  }, []);

  // Obtener años filtrados por carrera
  useEffect(() => {
    if (localData.career) {
      yearsApi
        .getAll()
        .then((response) => {
          // Filtrar los años según la carrera seleccionada por ID
          const filteredYears = response.data.filter(
            (year) => year.career === localData.career
          );
          setYears(filteredYears);
        })
        .catch((error) => {
          console.error("Error al obtener años:", error);
        });
    } else {
      setYears([]);
    }
  }, [localData.career]);

  // Obtener periodos filtrados por curso
  useEffect(() => {
    if (localData.courseId) {
      periodsApi
        .getAll()
        .then((response) => {
          const filteredPeriods = response.data.filter(
            (period) => period.course === localData.courseId
          );
          setPeriods(filteredPeriods);
        })
        .catch((error) => {
          console.error("Error al obtener periodos:", error);
        });
    } else {
      setPeriods([]);
    }
  }, [localData.courseId]);

  // Obtener asignaturas filtradas por carrera y año
  useEffect(() => {
    if (localData.career && localData.year) {
      subjectsApi
        .getAll()
        .then((response) => {
          // Filtrar asignaturas por carrera y año
          const filteredSubjects = response.data.filter(
            (subject) =>
              subject.career === localData.career &&
              subject.year === localData.year
          );
          setSubjects(filteredSubjects);
        })
        .catch((error) => {
          console.error("Error al obtener asignaturas:", error);
          setSubjects([]);
        });
    } else {
      setSubjects([]);
    }
  }, [localData.career, localData.year]);

  // Actualizar localData cuando cambia data
  useEffect(() => {
    setLocalData({ ...data });
  }, [data]);

  const handleChange = (field, value) => {
    // Aplicar restricciones a los valores
    if (field === "weeks" && value > 24) {
      value = 24;
    }

    const newData = { ...localData, [field]: value };

    // Reset dependent fields when parent field changes
    if (field === "faculty") {
      newData.career = "";
      newData.year = "";
      newData.subjects = [];
      newData.courseId = "";
      newData.courseName = "";
      newData.period = ""; // Reiniciar periodo
    } else if (field === "career") {
      newData.year = "";
      newData.subjects = [];
      newData.period = ""; // Reiniciar periodo
    } else if (field === "year") {
      newData.subjects = [];
      newData.period = ""; // Reiniciar periodo
    }

    setLocalData(newData);
    updateData(newData);
  };

  // Manejar cambio de curso
  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find((course) => course.id === courseId);
    if (selectedCourse) {
      const newData = {
        ...localData,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        period: "", // Solo reiniciar el periodo
      };
      setLocalData(newData);
      updateData(newData);
    }
  };

  // Manejar cambio de periodo
  const handlePeriodChange = async (periodId) => {
    if (!periodId) {
      handleChange("period", "");
      // Limpiar weeks si se borra el periodo
      setLocalData((prevData) => ({
        ...prevData,
        period: "",
        weeks: "",
      }));
      updateData({
        ...localData,
        period: "",
        weeks: "",
      });
      return;
    }
    setPeriodLoading(true);
    try {
      const response = await periodsApi.get(periodId);
      const periodData = response.data;
      const weeks = periodData.number_of_weeks_excluding_unavailable;
      // Actualiza period y weeks en localData
      const newData = {
        ...localData,
        period: periodId,
        weeks: weeks,
      };
      setLocalData(newData);
      updateData(newData);
    } catch (error) {
      console.error("Error al obtener periodo:", error);
    } finally {
      setPeriodLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId) => {
    const currentSubjects = [...localData.subjects];
    const index = currentSubjects.indexOf(subjectId);

    if (index === -1) {
      currentSubjects.push(subjectId);
    } else {
      currentSubjects.splice(index, 1);
    }
    const selectedSubjectObjects = subjects.filter((s) =>
      currentSubjects.includes(s.id)
    );
    const newData = {
      ...localData,
      subjects: currentSubjects,
      subjectObjects: selectedSubjectObjects,
    };
    setLocalData(newData);
    updateData(newData);
  };

  // Traducción de errores
  const errorMessages = {
    faculty: "La facultad es obligatoria",
    career: "La carrera es obligatoria",
    year: "El año es obligatorio",
    semester: "El semestre es obligatorio",
    course: "El curso es obligatorio",
    weeks: "Debe indicar un número de semanas válido",
    subjects: "Debe seleccionar al menos una asignatura",
    period: "El período es obligatorio",
  };

  const validateForm = () => {
    const newErrors = {};

    if (!localData.faculty) newErrors.faculty = errorMessages.faculty;
    if (!localData.career) newErrors.career = errorMessages.career;
    if (!localData.year) newErrors.year = errorMessages.year;
    if (!localData.semester) newErrors.semester = errorMessages.semester;
    if (!localData.courseId) newErrors.course = errorMessages.course;
    if (!localData.weeks || localData.weeks < 1)
      newErrors.weeks = errorMessages.weeks;
    if (localData.subjects.length === 0)
      newErrors.subjects = errorMessages.subjects;
    if (!localData.period) newErrors.period = errorMessages.period;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      updateData(localData);
      onComplete();
    }
  };

  // Get available subjects based on current selections
  const availableSubjects = subjects;

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-xl border-2 border-white rounded-xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="w-2 h-14 bg-[#12a6b9] rounded-full mt-1"></span>
            <div>
              <CardTitle className="text-[#006599] text-2xl font-bold mb-1">
                Información Básica
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg font-medium">
                Seleccione la facultad, carrera y año para generar un horario específico
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Faculty Selection */}
            <div className="space-y-2">
              <Label htmlFor="faculty" className="text-gray-700 text-lg font-semibold">Facultad</Label>
              <Select
                value={localData.faculty}
                onValueChange={(value) => handleChange("faculty", value)}
              >
                <SelectTrigger
                  id="faculty"
                  className={`bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 transition-all duration-200 text-base font-medium ${
                    errors.faculty ? "border-red-500" : ""
                  } focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)]`}
                >
                  <SelectValue placeholder="Seleccione facultad" className="text-base font-medium" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id} className="text-base font-medium">
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.faculty && (
                <p className="text-red-500 text-sm">{errors.faculty}</p>
              )}
            </div>

            {/* Career Selection - Only enabled if faculty is selected */}
            <div className="space-y-2">
              <Label htmlFor="career" className="text-gray-700 text-lg font-semibold">Carrera</Label>
              <Select
                value={localData.career}
                onValueChange={(value) => handleChange("career", value)}
                disabled={!localData.faculty}
              >
                <SelectTrigger
                  id="career"
                  className={`bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 transition-all duration-200 text-base font-medium ${
                    errors.career ? "border-red-500" : ""
                  } focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)]`}
                >
                  <SelectValue
                    placeholder={
                      localData.faculty
                        ? "Seleccione carrera"
                        : "Seleccione primero la facultad"
                    }
                    className="text-base font-medium"
                  />
                </SelectTrigger>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.id} className="text-base font-medium">
                      {career.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.career && (
                <p className="text-red-500 text-sm">{errors.career}</p>
              )}            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-gray-700 text-lg font-semibold">Año</Label>
              <Select
                value={localData.year ? localData.year.toString() : ""}
                onValueChange={(value) =>
                  handleChange("year", Number.parseInt(value))
                }
                disabled={!localData.career}
              >
                <SelectTrigger
                  id="year"
                  className={`bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 transition-all duration-200 text-base font-medium ${
                    errors.year ? "border-red-500" : ""
                  } focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)]`}
                >
                  <SelectValue
                    placeholder={
                      localData.career
                        ? "Seleccione año"
                        : "Seleccione primero la carrera"
                    }
                    className="text-base font-medium"
                  />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()} className="text-base font-medium">
                      {year.number_choice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.year && (
                <p className="text-red-500 text-sm">{errors.year}</p>
              )}
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="courseId" className="text-gray-700 text-lg font-semibold">Curso</Label>
              <Select
                value={localData.courseId ? localData.courseId.toString() : ""}
                onValueChange={(value) => handleCourseChange(parseInt(value))}
              >
                <SelectTrigger
                  id="courseId"
                  className={`bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 transition-all duration-200 text-base font-medium ${
                    errors.course ? "border-red-500" : ""
                  } focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)]`}
                >
                  <SelectValue placeholder="Seleccione curso" className="text-base font-medium" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()} className="text-base font-medium">
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="text-red-500 text-sm">{errors.course}</p>
              )}
            </div>

            {/* Period Selection - Only enabled if course is selected */}
            <div className="space-y-2">
              <Label htmlFor="period" className="text-gray-700 text-lg font-semibold">Período</Label>
              <Select
                value={localData.period ? localData.period.toString() : ""}
                onValueChange={(value) =>
                  handlePeriodChange(Number.parseInt(value))
                }
                disabled={!localData.courseId}
              >
                <SelectTrigger
                  id="period"
                  className={`bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 transition-all duration-200 text-base font-medium ${
                    errors.period ? "border-red-500" : ""
                  } focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)]`}
                >
                  <SelectValue
                    placeholder={
                      localData.courseId
                        ? "Seleccione período"
                        : "Seleccione primero el curso"
                    }
                    className="text-base font-medium"
                  />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()} className="text-base font-medium">
                      {period.name} ({period.start} - {period.end})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.period && (
                <p className="text-red-500 text-sm">{errors.period}</p>
              )}
            </div>

            {/* Weeks */}
            <div className="space-y-2">
              <Label htmlFor="weeks" className="text-gray-700 text-lg font-semibold">Semanas</Label>
              <div className="relative">
                <Input
                  id="weeks"
                  type="number"
                  min="1"
                  max="24"
                  value={localData.period && localData.weeks ? localData.weeks : ""}
                  disabled={!localData.period || periodLoading}
                  readOnly // Bloquea la edición manual
                  className={`bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] h-12 transition-all duration-200 text-base font-medium ${
                    errors.weeks ? "border-red-500" : ""
                  } focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)]`}
                  placeholder={
                    !localData.period
                      ? "Seleccione primero el período"
                      : periodLoading
                        ? "Cargando semanas..."
                        : undefined
                  }
                />
              </div>
              {periodLoading && (
                <p className="text-gray-500 text-sm">Cargando semanas...</p>
              )}
              {errors.weeks && (
                <p className="text-red-500 text-sm">{errors.weeks}</p>
              )}
            </div>
          </div>

          {/* Subjects - Only shown if year is selected */}
          {localData.year && (
            <div className="space-y-3 pt-4 bg-gradient-to-r from-[#12a6b9]/10 to-[#006599]/10 border border-[#12a6b9]/20 rounded-lg px-4 py-3">
              <Label className="text-[#006599] font-semibold text-lg">
                Asignaturas para{" "}
                {localData.career && localData.year
                  ? (() => {
                      const careerObj = careers.find(c => c.id === localData.career);
                      const yearObj = years.find(y => y.id === localData.year);
                      return careerObj && yearObj
                        ? `${careerObj.name}, ${yearObj.number_choice}`
                        : "";
                    })()
                  : ""}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 border border-transparent hover:border-[#12a6b9] hover:shadow-none"
                  >
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={localData.subjects.includes(subject.id)}
                      onCheckedChange={() => handleSubjectToggle(subject.id)}
                      className="data-[state=checked]:bg-[#12a6b9] data-[state=checked]:border-[#12a6b9] transition-all duration-200"
                    />
                    <Label
                      htmlFor={`subject-${subject.id}`}
                      className="cursor-pointer text-gray-700 text-base font-medium"
                    >
                      {subject.name} ({subject.symbology})
                    </Label>
                  </div>
                ))}
              </div>
              {errors.subjects && (
                <p className="text-red-500 text-sm">{errors.subjects}</p>
              )}
              {availableSubjects.length === 0 && localData.year && (
                <p className="text-amber-500 text-sm">
                  No hay asignaturas disponibles para esta selección. Revise la combinación de facultad, carrera y año.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          className="bg-[#006599] hover:bg-[#005080] text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Continuar <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
