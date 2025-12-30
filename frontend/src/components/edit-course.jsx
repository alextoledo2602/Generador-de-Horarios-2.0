import { useState, useEffect } from "react";
import { coursesApi } from "../api/tasks.api";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export function EditCourse() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    coursesApi.get(id)
      .then(res => setName(res.data.name))
      .catch(() => setError("No se pudo cargar el curso."));
  }, [id]);

  const validateCourseName = (value) => {
    if (!value.trim()) return "El nombre del curso es requerido";
    if (!/^\d{4}-\d{4}$/.test(value)) return "Formato debe ser YYYY-YYYY";
    const [start, end] = value.split("-").map(Number);
    if (end !== start + 1) return "El segundo año debe ser el siguiente al primero";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateCourseName(name);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    try {
      await coursesApi.update(id, { name });
      if (location.state && location.state.from) {
        navigate(location.state.from);
      } else {
        navigate("/mapa-horarios");
      }
    } catch (err) {
      let msg = "Error al actualizar el curso.";
      if (err.response && err.response.data) {
        msg = Object.values(err.response.data).flat().join(" ");
      }
      setError(msg);
    }
  };

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-2xl font-bold text-[#006599] mb-2">Editar Curso</h1>
        <p className="text-gray-600 mb-8">Modificar los datos del curso académico</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Nombre del Curso
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full bg-gray-300 border-2 ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
              placeholder="Ej: 2024-2025"
              maxLength={9}
            />
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
