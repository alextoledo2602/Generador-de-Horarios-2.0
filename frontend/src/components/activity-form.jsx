import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { activitysApi } from "@/api/tasks.api";

export function ActivityForm() {
  const [name, setName] = useState("");
  const [symbology, setSymbology] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e, continueAdding = false) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!symbology || isNaN(symbology)) {
      setError("La simbología debe ser un número");
      return;
    }
    try {
      await activitysApi.create({ name, symbology });
      if (continueAdding) {
        setSuccess("Actividad creada exitosamente");
        setName("");
        setSymbology("");
      } else {
        navigate("/actividades");
      }
    } catch (err) {
      let msg = "Error al crear la actividad.";
      if (err.response && err.response.data) {
        msg = Object.values(err.response.data).flat().join(" ");
      }
      setError(msg);
    }
  };

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-2xl font-bold text-[#006599] mb-2">Añadir Nueva Actividad</h1>
        <p className="text-gray-600 mb-8">Crear una nueva actividad</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
        )}
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Nombre de la Actividad
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full bg-gray-300 border-2 ${error && !name ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
              placeholder="Nombre de la actividad"
              maxLength={50}
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Simbología (número)
            </label>
            <input
              type="number"
              name="symbology"
              value={symbology}
              onChange={e => setSymbology(e.target.value)}
              className={`w-full bg-gray-300 border-2 ${error && (!symbology || isNaN(symbology)) ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
              placeholder="Ej: 1"
              min={1}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base font-medium order-2 sm:order-1"
              onClick={() => navigate("/actividades")}
            >
              Cancelar
            </button>
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#12a6b9] hover:bg-[#0e8a9c] text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold whitespace-nowrap"
              >
                Guardar y Crear Otro
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-[#006599] hover:bg-[#005080] text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
              >
                Guardar Actividad
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
