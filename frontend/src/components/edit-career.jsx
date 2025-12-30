import { useState, useEffect } from "react";
import { careersApi, facultiesApi } from "../api/tasks.api";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const COURSE_TYPES = [
  { value: "CD", label: "Curso Diurno" },
  { value: "CE", label: "Curso por Encuentro" },
];

export function EditCareer() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [courseType, setCourseType] = useState("CD");
  const [faculty, setFaculty] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    facultiesApi.getAll().then(res => setFaculties(res.data));
    careersApi.get(id)
      .then(res => {
        setName(res.data.name);
        setCourseType(res.data.course_type);
        setFaculty(res.data.faculty);
      })
      .catch(() => setError("No se pudo cargar la carrera."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("El nombre de la carrera es requerido");
      return;
    }
    if (!faculty) {
      setError("Debe seleccionar una facultad");
      return;
    }
    try {
      await careersApi.update(id, {
        name,
        course_type: courseType,
        faculty,
      });
      if (location.state && location.state.from) {
        navigate(location.state.from);
      } else {
        navigate("/mapa-horarios");
      }
    } catch (err) {
      let msg = "Error al actualizar la carrera.";
      if (err.response && err.response.data) {
        msg = Object.values(err.response.data).flat().join(" ");
      }
      setError(msg);
    }
  };

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-2xl font-bold text-[#006599] mb-2">Editar Carrera</h1>
        <p className="text-gray-600 mb-8">Modificar los datos de la carrera</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Nombre de la Carrera
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full bg-gray-300 border-2 ${error && !name ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
              placeholder="Nombre de la carrera"
              maxLength={100}
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Tipo de Curso
            </label>
            <select
              value={courseType}
              onChange={e => setCourseType(e.target.value)}
              className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
            >
              {COURSE_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Facultad
            </label>
            <select
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              className={`w-full bg-gray-300 border-2 ${error && !faculty ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
            >
              <option value="">Seleccione una facultad</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base font-medium"
              onClick={() => navigate("/mapa-horarios")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#006599] hover:bg-[#005080] text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
