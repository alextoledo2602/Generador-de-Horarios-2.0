import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Calendar, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { coursesApi, periodsApi, days_not_availableApi, weeks_not_availableApi } from "../api/tasks.api";

export const EditPeriod = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState("");
  const [daysWithoutClasses, setDaysWithoutClasses] = useState([]);
  const [weeksWithoutClasses, setWeeksWithoutClasses] = useState([]);
  const [nombrePeriodo, setNombrePeriodo] = useState("");
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [weekRange, setWeekRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [weekReason, setWeekReason] = useState("");

  // Copias originales para detectar eliminaciones
  const [originalDays, setOriginalDays] = useState([]);
  const [originalWeeks, setOriginalWeeks] = useState([]);

  // Arrays para guardar los ids a eliminar
  const [daysToDelete, setDaysToDelete] = useState([]);
  const [weeksToDelete, setWeeksToDelete] = useState([]);

  const [dayReasonError, setDayReasonError] = useState("");
  const [weekReasonError, setWeekReasonError] = useState("");

  // Formatear fecha DD-MM-AAAA
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Formatear fecha YYYY-MM-DD para el backend
  const formatDateForBackend = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Cargar cursos y datos del periodo
  const fetchData = async () => {
    try {
      const [cursosRes, periodoRes, daysRes, weeksRes] = await Promise.all([
        coursesApi.getAll(),
        periodsApi.get(id),
        days_not_availableApi.getAll(),
        weeks_not_availableApi.getAll(),
      ]);
      setCursos(cursosRes.data);
      const periodo = periodoRes.data;
      setNombrePeriodo(periodo.name);
      setCursoId(periodo.course);

      // Asegura que las fechas sean Date válidas
      setStartDate(periodo.start ? new Date(periodo.start + "T00:00:00") : null);
      setEndDate(periodo.end ? new Date(periodo.end + "T00:00:00") : null);

      // Filtrar días y semanas por periodo actual
      const days = daysRes.data
        .filter((d) => d.period === periodo.id)
        .map((d) => ({
          id: d.id,
          date: d.day ? new Date(d.day + "T00:00:00") : null,
          formattedDate: formatDate(d.day),
          reason: d.reason,
        }));
      setDaysWithoutClasses(days);
      setOriginalDays(days);

      const weeks = weeksRes.data
        .filter((w) => w.period === periodo.id)
        .map((w) => ({
          id: w.id,
          startDate: w.start_date ? new Date(w.start_date + "T00:00:00") : null,
          endDate: w.end_date ? new Date(w.end_date + "T00:00:00") : null,
          formattedStartDate: formatDate(w.start_date),
          formattedEndDate: formatDate(w.end_date),
          reason: w.reason,
        }));
      setWeeksWithoutClasses(weeks);
      setOriginalWeeks(weeks);

      setLoading(false);
    } catch (error) {
      setSubmitError("Error al cargar los datos.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Validar que la fecha no sea domingo
  const isSunday = (date) => {
    if (!date) return false;
    return date.getDay() === 0;
  };

  // Cuando cambia la fecha de inicio, borra la fecha de fin y los días/semanas seleccionados
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setEndDate(null);
    setDaysWithoutClasses([]);
    setWeeksWithoutClasses([]);
    setSelectedDate(null);
    setReason("");
    setWeekRange({ startDate: null, endDate: null });
    setWeekReason("");
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    if (!nombrePeriodo) errors.nombrePeriodo = "El nombre del período es obligatorio.";
    if (!cursoId) errors.cursoId = "Debe seleccionar un curso.";
    if (!startDate) errors.startDate = "Debe seleccionar la fecha de inicio.";
    if (!endDate) errors.endDate = "Debe seleccionar la fecha de fin.";
    if (startDate && endDate && startDate >= endDate) errors.startDate = "La fecha de inicio debe ser anterior a la fecha de fin.";
    if (startDate && isSunday(startDate)) errors.startDate = "La fecha de inicio no puede ser domingo.";
    if (endDate && isSunday(endDate)) errors.endDate = "La fecha de fin no puede ser domingo.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar cambios
  const handleGuardarCambios = async () => {
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccess("");
    if (!validateForm()) return;
    try {
      // Actualizar periodo
      await periodsApi.update(id, {
        name: nombrePeriodo,
        course: Number(cursoId),
        start: formatDateForBackend(startDate),
        end: formatDateForBackend(endDate),
      });

      //Obtener días y semanas actuales desde la API
      const [daysRes, weeksRes] = await Promise.all([
        days_not_availableApi.getAll(),
        weeks_not_availableApi.getAll(),
      ]);
      const currentDays = daysRes.data.filter((d) => d.period === Number(id));
      const currentWeeks = weeksRes.data.filter((w) => w.period === Number(id));

      //Eliminar días que están en la BD pero no en el formulario
      for (const dbDay of currentDays) {
        const exists = daysWithoutClasses.some(
          (d) =>
            formatDateForBackend(d.date) === dbDay.day &&
            d.reason === dbDay.reason
        );
        if (!exists) {
          await days_not_availableApi.delete(dbDay.id);
        }
      }
      //Agregar días nuevos que están en el formulario pero no en la BD
      for (const formDay of daysWithoutClasses) {
        const exists = currentDays.some(
          (d) =>
            d.day === formatDateForBackend(formDay.date) &&
            d.reason === formDay.reason
        );
        if (!exists) {
          await days_not_availableApi.create({
            reason: formDay.reason,
            day: formatDateForBackend(formDay.date),
            period: Number(id),
          });
        }
      }

      // Eliminar semanas que están en la BD pero no en el formulario
      for (const dbWeek of currentWeeks) {
        const exists = weeksWithoutClasses.some(
          (w) =>
            formatDateForBackend(w.startDate) === dbWeek.start_date &&
            formatDateForBackend(w.endDate) === dbWeek.end_date &&
            w.reason === dbWeek.reason
        );
        if (!exists) {
          await weeks_not_availableApi.delete(dbWeek.id);
        }
      }
      // Agregar semanas nuevas que están en el formulario pero no en la BD
      for (const formWeek of weeksWithoutClasses) {
        const exists = currentWeeks.some(
          (w) =>
            w.start_date === formatDateForBackend(formWeek.startDate) &&
            w.end_date === formatDateForBackend(formWeek.endDate) &&
            w.reason === formWeek.reason
        );
        if (!exists) {
          await weeks_not_availableApi.create({
            reason: formWeek.reason,
            start_date: formatDateForBackend(formWeek.startDate),
            end_date: formatDateForBackend(formWeek.endDate),
            period: Number(id),
          });
        }
      }

      setLoading(true);
      setDaysToDelete([]);
      setWeeksToDelete([]);
      await fetchData();
      // Redireccionar inmediatamente
      if (location.state && location.state.from) {
        navigate(location.state.from);
      } else {
        navigate("/mapa-horarios");
      }
    } catch (error) {
      let msg = "Error al actualizar el período.";
      if (error.response && error.response.data) {
        msg = Object.values(error.response.data).flat().join(" ");
      }
      setSubmitError(msg);
    }
  };

  // Al agregar un día, motivo es obligatorio y fechas deben estar dentro del rango
  const handleAddDayWithoutClasses = () => {
    setDayReasonError("");
    if (!selectedDate) return;
    if (!reason.trim()) {
      setDayReasonError("El motivo es obligatorio.");
      return;
    }
    if (!startDate || !endDate || selectedDate < startDate || selectedDate > endDate) {
      setDayReasonError("La fecha debe estar dentro del rango del período.");
      return;
    }
    const exists = daysWithoutClasses.some(
      (d) =>
        d.date &&
        selectedDate &&
        d.date.toDateString() === selectedDate.toDateString() &&
        d.reason === reason
    );
    if (!exists) {
      setDaysWithoutClasses([
        ...daysWithoutClasses,
        {
          date: selectedDate,
          formattedDate: formatDate(selectedDate),
          reason: reason,
        },
      ]);
    }
    setSelectedDate(null);
    setReason("");
  };

  // Eliminar día (solo del estado, la eliminación real se hace en handleGuardarCambios)
  const handleRemoveDay = (index) => {
    setDaysWithoutClasses((prev) => prev.filter((_, i) => i !== index));
  };

  // Eliminar semana (solo del estado, la eliminación real se hace en handleGuardarCambios)
  const handleRemoveWeek = (index) => {
    setWeeksWithoutClasses((prev) => prev.filter((_, i) => i !== index));
  };

  // Al agregar una semana, motivo es obligatorio y fechas deben estar dentro del rango
  const handleAddWeekWithoutClasses = () => {
    setWeekReasonError("");
    if (!(weekRange.startDate && weekRange.endDate)) return;
    if (!weekReason.trim()) {
      setWeekReasonError("El motivo es obligatorio.");
      return;
    }
    if (
      !startDate ||
      !endDate ||
      weekRange.startDate < startDate ||
      weekRange.endDate > endDate
    ) {
      setWeekReasonError("Las fechas deben estar dentro del rango del período.");
      return;
    }
    const exists = weeksWithoutClasses.some(
      (w) =>
        w.startDate &&
        w.endDate &&
        weekRange.startDate &&
        weekRange.endDate &&
        w.startDate.toDateString() === weekRange.startDate.toDateString() &&
        w.endDate.toDateString() === weekRange.endDate.toDateString() &&
        w.reason === weekReason
    );
    if (!exists) {
      setWeeksWithoutClasses([
        ...weeksWithoutClasses,
        {
          startDate: weekRange.startDate,
          endDate: weekRange.endDate,
          formattedStartDate: formatDate(weekRange.startDate),
          formattedEndDate: formatDate(weekRange.endDate),
          reason: weekReason,
        },
      ]);
    }
    setWeekRange({ startDate: null, endDate: null });
    setWeekReason("");
  };

  const handleWeekRangeChange = (dates) => {
    const [start, end] = dates;
    setWeekRange({
      startDate: start,
      endDate: end,
    });
  };

  const CustomDatePickerInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <div className="relative w-full">
        <input
          ref={ref}
          className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-base"
          onClick={onClick}
          value={value}
          placeholder={placeholder}
          readOnly
        />
        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
    )
  );

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-3xl font-bold text-[#006599] mb-2">
          Editar Período
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Modifique el período académico y los días/semanas no disponibles
        </p>
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{submitError}</div>
        )}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{submitSuccess}</div>
        )}

        {/* Nombre del período */}
        <div className="mb-8">
          <label className="block text-[#006599] font-semibold mb-2 text-lg">
            Nombre del período
          </label>
          <input
            type="text"
            value={nombrePeriodo}
            onChange={(e) => setNombrePeriodo(e.target.value)}
            className={`w-full bg-gray-300 border-2 ${formErrors.nombrePeriodo ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900`}
            placeholder="Ej: Primer Semestre 2024"
          />
          {formErrors.nombrePeriodo && (
            <p className="text-red-500 text-sm">{formErrors.nombrePeriodo}</p>
          )}
        </div>

        {/* Selección de curso */}
        <div className="mb-8">
          <label className="block text-[#006599] font-semibold mb-2 text-lg">
            Curso
          </label>
          <select
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className={`w-full bg-gray-300 border-2 ${formErrors.cursoId ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900 bg-white`}
          >
            <option value="">Seleccione un curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id} className="text-gray-900 bg-white">
                {c.name}
              </option>
            ))}
          </select>
          {formErrors.cursoId && (
            <p className="text-red-500 text-sm">{formErrors.cursoId}</p>
          )}
        </div>

        {/* Rango de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Fecha de inicio
            </label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd-MM-yyyy"
              customInput={<CustomDatePickerInput placeholder="Seleccione fecha de inicio" />}
            />
            {formErrors.startDate && (
              <p className="text-red-500 text-sm">{formErrors.startDate}</p>
            )}
          </div>
          <div>
            <label className="block text-[#006599] font-semibold mb-2 text-lg">
              Fecha de fin
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              customInput={<CustomDatePickerInput placeholder="Seleccione fecha de fin" />}
              minDate={startDate}
              disabled={!startDate}
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-sm">{formErrors.endDate}</p>
            )}
          </div>
        </div>

        {/* Días sin clases */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#006599] mb-4">
            Días sin clases
          </h2>
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-[#006599] font-semibold mb-2 text-base">
                Fecha
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd-MM-yyyy"
                customInput={<CustomDatePickerInput placeholder="Seleccione fecha" />}
                minDate={startDate}
                maxDate={endDate}
                highlightDates={daysWithoutClasses.map((day) => day.date)}
                disabled={!startDate || !endDate}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#006599] font-semibold mb-2 text-base">
                Motivo
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de la ausencia"
                className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
                disabled={!startDate || !endDate}
              />
              {dayReasonError && (
                <p className="text-red-500 text-sm">{dayReasonError}</p>
              )}
            </div>
            <div className="flex-shrink-0 md:mb-0 mb-2" style={{ marginTop: 30 }}>
              <button
                onClick={handleAddDayWithoutClasses}
                className="bg-[#12a6b9] hover:bg-[#0e8a9c] text-white px-6 py-2 rounded-xl transition-colors text-base font-semibold w-full md:w-auto"
                disabled={!selectedDate || !startDate || !endDate}
                style={{ minWidth: 80 }}
              >
                Agregar
              </button>
            </div>
          </div>
          {/* Lista de días agregados */}
          {daysWithoutClasses.length > 0 && (
            <div className="mt-4 p-4 border border-[#12a6b9]/30 rounded-xl bg-[#e3f6fa] shadow-inner">
              <h3 className="font-bold mb-2 text-lg text-[#006599]">
                Días sin clases agregados:
              </h3>
              {daysWithoutClasses.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2 last:mb-0 py-2 border-b border-[#12a6b9]/20 last:border-0"
                >
                  <span className="text-[#006599] text-base font-medium break-words max-w-[70vw] md:max-w-[60%]">
                    {formatDate(day.date)}: {day.reason}
                  </span>
                  <button
                    onClick={() => handleRemoveDay(index)}
                    className="text-red-600 hover:text-red-800 flex items-center self-start md:self-auto"
                  >
                    <span className="mr-1">Eliminar</span>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Semanas sin clases */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#006599] mb-4">
            Semanas sin clases
          </h2>
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-[#006599] font-semibold mb-2 text-base">
                Rango de fechas
              </label>
              <DatePicker
                selected={weekRange.startDate}
                onChange={handleWeekRangeChange}
                startDate={weekRange.startDate}
                endDate={weekRange.endDate}
                selectsRange
                dateFormat="dd-MM-yyyy"
                customInput={<CustomDatePickerInput placeholder="Seleccione rango" />}
                minDate={startDate}
                maxDate={endDate}
                monthsShown={1}
                showWeekNumbers
                placeholderText="Seleccione rango de fechas"
                value={
                  weekRange.startDate && weekRange.endDate
                    ? `${formatDate(weekRange.startDate)} a ${formatDate(weekRange.endDate)}`
                    : weekRange.startDate
                    ? formatDate(weekRange.startDate)
                    : ""
                }
                disabled={!startDate || !endDate}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#006599] font-semibold mb-2 text-base">
                Motivo
              </label>
              <input
                type="text"
                value={weekReason}
                onChange={(e) => setWeekReason(e.target.value)}
                placeholder="Motivo de la ausencia"
                className="w-full bg-gray-300 border-2 border-gray-300 rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
                disabled={!startDate || !endDate}
              />
              {weekReasonError && (
                <p className="text-red-500 text-sm">{weekReasonError}</p>
              )}
            </div>
            <div className="flex-shrink-0 md:mb-0 mb-2" style={{ marginTop: 30 }}>
              <button
                onClick={handleAddWeekWithoutClasses}
                className="bg-[#12a6b9] hover:bg-[#0e8a9c] text-white px-6 py-2 rounded-xl transition-colors text-base font-semibold w-full md:w-auto"
                disabled={!weekRange.startDate || !weekRange.endDate || !startDate || !endDate}
                style={{ minWidth: 80 }}
              >
                Agregar
              </button>
            </div>
          </div>
          {/* Lista de semanas agregadas */}
          {weeksWithoutClasses.length > 0 && (
            <div className="mt-4 p-4 border border-[#12a6b9]/30 rounded-xl bg-[#e3f6fa] shadow-inner">
              <h3 className="font-bold mb-2 text-lg text-[#006599]">
                Semanas sin clases agregadas:
              </h3>
              {weeksWithoutClasses.map((week, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2 last:mb-0 py-2 border-b border-[#12a6b9]/20 last:border-0"
                >
                  <span className="text-[#006599] text-base font-medium break-words max-w-[70vw] md:max-w-[60%]">
                    {formatDate(week.startDate)} a {formatDate(week.endDate)}: {week.reason}
                  </span>
                  <button
                    onClick={() => handleRemoveWeek(index)}
                    className="text-red-600 hover:text-red-800 flex items-center self-start md:self-auto"
                  >
                    <span className="mr-1">Eliminar</span>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón para guardar cambios */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              if (location.state && location.state.from) {
                navigate(location.state.from);
              } else {
                navigate("/mapa-horarios");
              }
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-3 rounded-lg shadow transition-all duration-200 text-lg font-semibold"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarCambios}
            className="bg-[#006599] hover:bg-[#005080] text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};
