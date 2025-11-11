import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  facultiesApi,
  careersApi,
  yearsApi,
  subjectsApi,
} from "../api/tasks.api";
import { API_BASE_URL } from "../config";


export function SubjectForm() {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    name: "",
    symbology: "",
    hours_found: 80,
    type: "simple",
    faculty_id: "",
    career_id: "",
    year_id: "",
    teachers: [],
  });

  // Estados para las opciones de los selects
  const [faculties, setFaculties] = useState([]);
  const [careers, setCareers] = useState([]);
  const [years, setYears] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Definir los tipos de asignatura directamente
  const subjectTypes = [
    { value: "simple", label: "Simple" },
    { value: "optativa", label: "Optativa" },
    { value: "electiva", label: "Electiva" }
  ];

  const navigate = useNavigate();

  // Cargar facultades al montar el componente
  useEffect(() => {
    facultiesApi
      .getAll()
      .then((response) => {
        setFaculties(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar facultades:", error);
      });

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

  // Cargar carreras cuando se selecciona una facultad
  useEffect(() => {
    if (!formData.faculty_id) {
      setCareers([]);
      return;
    }

    const fetchCareers = async () => {
      try {
        // Suponiendo que la API soporta filtrado por facultad_id
        const response = await careersApi.getAll();
        const filteredCareers = response.data.filter(
          (career) => career.faculty === parseInt(formData.faculty_id)
        );
        setCareers(filteredCareers);
      } catch (error) {
        console.error("Error al cargar carreras:", error);
      }
    };

    fetchCareers();
  }, [formData.faculty_id]);

  // Cargar años cuando se selecciona una carrera
  useEffect(() => {
    if (!formData.career_id) {
      setYears([]);
      return;
    }

    const fetchYears = async () => {
      try {
        // Suponiendo que la API soporta filtrado por career_id
        const response = await yearsApi.getAll();
        const filteredYears = response.data.filter(
          (year) => year.career === parseInt(formData.career_id)
        );
        setYears(filteredYears);
      } catch (error) {
        console.error("Error al cargar años:", error);
      }
    };

    fetchYears();
  }, [formData.career_id]);

  // Filtrar profesores cuando se busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const results = teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(results);
  }, [searchTerm, teachers]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset dependent fields when parent field changes
    if (name === "faculty_id") {
      setFormData({
        ...formData,
        [name]: value,
        career_id: "",
        year_id: "",
      });
    } else if (name === "career_id") {
      setFormData({
        ...formData,
        [name]: value,
        year_id: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleTeacherSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTeacherSelect = (teacher) => {
    // Verificar si el profesor ya está seleccionado
    if (!selectedTeachers.some((t) => t.id === teacher.id)) {
      const updatedTeachers = [...selectedTeachers, teacher];
      setSelectedTeachers(updatedTeachers);
      setFormData({
        ...formData,
        teachers: updatedTeachers.map((t) => t.id),
      });
    }
    setSearchTerm("");
    setIsSearching(false);
  };

  const handleTeacherRemove = (teacherId) => {
    const updatedTeachers = selectedTeachers.filter((t) => t.id !== teacherId);
    setSelectedTeachers(updatedTeachers);
    setFormData({
      ...formData,
      teachers: updatedTeachers.map((t) => t.id),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones según el modelo Subject
    if (!formData.name) newErrors.name = "El nombre de la asignatura es requerido";
    if (!formData.symbology) newErrors.symbology = "La simbología es requerida";
    if (!formData.hours_found) newErrors.hours_found = "El fondo de horas es requerido";
    if (!formData.faculty_id) newErrors.faculty = "La facultad es requerida";
    if (!formData.career_id) newErrors.career = "La carrera es requerida";
    if (!formData.year_id) newErrors.year = "El año es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      // Preparar los datos para enviar
      const subjectData = {
        name: formData.name,
        symbology: formData.symbology,
        hours_found: formData.hours_found,
        type: formData.type,
        career: formData.career_id,
        year: formData.year_id,
        teachers: formData.teachers,
      };

      // Enviar los datos
      await subjectsApi.create(subjectData);

      // Redirigir instantáneamente a la lista de asignaturas
      navigate("/subjects-details");
    } catch (error) {
      console.error("Error al crear la asignatura:", error);
      let msg = "Error al crear la asignatura.";
      if (error.response && error.response.data) {
        // Mostrar errores del backend si existen
        msg = Object.values(error.response.data).flat().join(" ");
      }
      setSubmitError(msg);
    }
  };

  // Ref para el contenedor del selector de profesores
  const teacherSelectorRef = useRef(null);

  // Cerrar el dropdown si se hace clic fuera del selector de profesores
  useEffect(() => {
    if (!isSearching) return;
    const handleClickOutside = (event) => {
      if (
        teacherSelectorRef.current &&
        !teacherSelectorRef.current.contains(event.target)
      ) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearching]);

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-2xl font-bold text-[#006599] mb-2">Añadir Nueva Asignatura</h1>
        <p className="text-gray-600 mb-8">Crear una nueva asignatura para el horario</p>

        {/* Mensajes de error y éxito */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{submitError}</div>
        )}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{submitSuccess}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Primera fila: Nombre, Simbología y Fondo de Horas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Nombre de la Asignatura
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-gray-300 border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
                placeholder="Nombre de la asignatura"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Simbología/Código
              </label>
              <input
                type="text"
                name="symbology"
                value={formData.symbology}
                onChange={handleChange}
                maxLength={4}
                className={`w-full bg-gray-300 border-2 ${errors.symbology ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
                placeholder="Código"
              />
              {errors.symbology && <p className="text-red-500 text-sm mt-1">{errors.symbology}</p>}
            </div>

            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Fondo de Horas
              </label>
              <input
                type="number"
                name="hours_found"
                value={formData.hours_found}
                onChange={handleChange}
                min="1"
                className={`w-full bg-gray-300 border-2 ${errors.hours_found ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
                placeholder="Horas"
              />
              {errors.hours_found && <p className="text-red-500 text-sm mt-1">{errors.hours_found}</p>}
            </div>
          </div>

          {/* Segunda fila: Facultad, Carrera y Año */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Facultad
              </label>
              <select
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
                className={`w-full bg-gray-300 border-2 ${errors.faculty ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900 ${!formData.faculty_id ? 'text-gray-500' : ''}`}
              >
                <option value="" hidden>Seleccionar facultad</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              {errors.faculty && <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>}
            </div>

            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Carrera
              </label>
              <select
                name="career_id"
                value={formData.career_id}
                onChange={handleChange}
                disabled={!formData.faculty_id}
                className={`w-full bg-gray-300 border-2 ${errors.career ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900 ${!formData.career_id ? 'text-gray-500' : ''}`}
              >
                <option value="" hidden>
                  {formData.faculty_id ? "Seleccionar carrera" : "Seleccione una facultad primero"}
                </option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
              {errors.career && <p className="text-red-500 text-sm mt-1">{errors.career}</p>}
            </div>

            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Año
              </label>
              <select
                name="year_id"
                value={formData.year_id}
                onChange={handleChange}
                disabled={!formData.career_id}
                className={`w-full bg-gray-300 border-2 ${errors.year ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900 ${!formData.year_id ? 'text-gray-500' : ''}`}
              >
                <option value="" hidden>
                  {formData.career_id ? "Seleccionar año" : "Seleccione una carrera primero"}
                </option>
                {years.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.number_choice}
                  </option>
                ))}
              </select>
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>
          </div>

          {/* Tercera fila: Tipo de Asignatura y Profesores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Tipo de Asignatura
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
              >
                {subjectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#006599] font-semibold mb-2 text-lg">
                Profesores
              </label>
              {/* Contenedor con ref para detectar clics fuera */}
              <div className="relative" ref={teacherSelectorRef}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleTeacherSearch}
                  onFocus={() => setIsSearching(true)}
                  placeholder="Buscar profesor..."
                  className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
                />
                {isSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleTeacherSelect(teacher)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-sm">
                                {teacher.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {teacher.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {teacher.department || "Departamento"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profesores seleccionados */}
              <div className="mt-3">
                {selectedTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="inline-flex items-center bg-[#e3f6fa] text-[#006599] rounded-full px-3 py-1 text-sm mr-2 mb-2 border border-[#12a6b9]"
                  >
                    <span>{teacher.name}</span>
                    <button
                      type="button"
                      onClick={() => handleTeacherRemove(teacher.id)}
                      className="ml-1 text-[#12a6b9] hover:text-[#006599] focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base font-medium"
              onClick={() => navigate("/subjects-details")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#006599] hover:bg-[#005080] text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
            >
              Guardar Asignatura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
