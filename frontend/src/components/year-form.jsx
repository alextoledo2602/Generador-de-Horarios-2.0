import { useState, useEffect } from "react";
import { yearsApi, careersApi } from "../api/tasks.api";
import { useNavigate, useLocation } from "react-router-dom";

const YEAR_NUMBERS = [
  { value: 1, label: "Primer año" },
  { value: 2, label: "Segundo año" },
  { value: 3, label: "Tercer año" },
  { value: 4, label: "Cuarto año" },
  { value: 5, label: "Quinto año" },
];

export function YearForm() {
  const [number, setNumber] = useState(1);
  const [career, setCareer] = useState("");
  const [careers, setCareers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    careersApi.getAll().then(res => setCareers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!career) {
      setError("Debe seleccionar una carrera");
      return;
    }
    try {
      await yearsApi.create({
        number,
        career,
      });
      if (location.state && location.state.from) {
        navigate(location.state.from);
      } else {
        navigate("/mapa-horarios");
      }
    } catch (err) {
      let msg = "Error al crear el año.";
      if (err.response && err.response.data) {
        msg = Object.values(err.response.data).flat().join(" ");
      }
      setError(msg);
    }
  };

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-2xl font-bold text-[#006599] mb-2">Añadir Nuevo Año</h1>
        <p className="text-gray-600 mb-8">Crear un nuevo año académico</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Número de Año
            </label>
            <select
              value={number}
              onChange={e => setNumber(Number(e.target.value))}
              className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
            >
              {YEAR_NUMBERS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Carrera
            </label>
            <select
              value={career}
              onChange={e => setCareer(e.target.value)}
              className={`w-full bg-gray-300 border-2 ${error && !career ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
            >
              <option value="">Seleccione una carrera</option>
              {careers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
              Guardar Año
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
