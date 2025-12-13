import React, { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { coursesApi, periodsApi, days_not_availableApi, weeks_not_availableApi } from "../api/tasks.api";
import { useNavigate, useLocation } from "react-router-dom";

export const PeriodForm = () => {
  // State for form fields
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState("");
  const [daysWithoutClasses, setDaysWithoutClasses] = useState([]);
  const [weeksWithoutClasses, setWeeksWithoutClasses] = useState([]);
  const [nombrePeriodo, setNombrePeriodo] = useState("");
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [periodoId, setPeriodoId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Week selection states
  const [weekRange, setWeekRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [weekReason, setWeekReason] = useState("");

  // Cargar cursos desde la API
  useEffect(() => {
    coursesApi
      .getAll()
      .then((response) => {
        setCursos(response.data);
        
        // Si viene desde mapa-horarios con courseId, seleccionarlo
        const hierarchyData = location.state?.hierarchyData;
        if (hierarchyData?.fromMapaHorarios && hierarchyData?.courseId) {
          setCursoId(hierarchyData.courseId);
        } else if (response.data.length > 0) {
          setCursoId(response.data[0].id);
        }
      })
      .catch((error) => {
        console.error("Error al obtener cursos:", error);
      });
  }, [location.state]);

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

  // Format the range display for week selection
  const formatRangeDisplay = () => {
    if (weekRange.startDate && weekRange.endDate) {
      return `${formatDate(weekRange.startDate)} to ${formatDate(
        weekRange.endDate
      )}`;
    } else if (weekRange.startDate) {
      return formatDate(weekRange.startDate);
    }
    return "";
  };

  // Handle adding a day without classes
  const handleAddDayWithoutClasses = () => {
    if (selectedDate) {
      // Evitar duplicados: misma fecha y mismo motivo
      const exists = daysWithoutClasses.some(
        (d) =>
          d.date &&
          selectedDate &&
          d.date.toDateString() === selectedDate.toDateString() &&
          d.reason === reason // No completar motivo por defecto
      );
      if (!exists) {
        const newDay = {
          date: selectedDate,
          formattedDate: formatDate(selectedDate),
          reason: reason, // Puede ser vacío, será validado en el backend
        };
        setDaysWithoutClasses([...daysWithoutClasses, newDay]);
      }
      setSelectedDate(null);
      setReason("");
    }
  };

  // Handle adding a week without classes
  const handleAddWeekWithoutClasses = () => {
    if (weekRange.startDate && weekRange.endDate) {
      // Evitar duplicados: mismo rango y mismo motivo
      const exists = weeksWithoutClasses.some(
        (w) =>
          w.startDate &&
          w.endDate &&
          weekRange.startDate &&
          weekRange.endDate &&
          w.startDate.toDateString() === weekRange.startDate.toDateString() &&
          w.endDate.toDateString() === weekRange.endDate.toDateString() &&
          w.reason === weekReason // No completar motivo por defecto
      );
      if (!exists) {
        const newWeek = {
          startDate: weekRange.startDate,
          endDate: weekRange.endDate,
          formattedStartDate: formatDate(weekRange.startDate),
          formattedEndDate: formatDate(weekRange.endDate),
          reason: weekReason, // Puede ser vacío, será validado en el backend
        };
        setWeeksWithoutClasses([...weeksWithoutClasses, newWeek]);
      }
      setWeekRange({ startDate: null, endDate: null });
      setWeekReason("");
    }
  };

  // Handle removing a day without classes
  const handleRemoveDay = (index) => {
    const newDays = [...daysWithoutClasses];
    newDays.splice(index, 1);
    setDaysWithoutClasses(newDays);
  };

  // Handle removing a week without classes
  const handleRemoveWeek = (index) => {
    const newWeeks = [...weeksWithoutClasses];
    newWeeks.splice(index, 1);
    setWeeksWithoutClasses(newWeeks);
  };

  // Handle date changes for week range
  const handleWeekRangeChange = (dates) => {
    const [start, end] = dates;
    setWeekRange({
      startDate: start,
      endDate: end,
    });
  };

  // Validar que la fecha no sea domingo
  const isSunday = (date) => {
    if (!date) return false;
    // Domingo es 0 en JS, pero en Django es 1 (lunes=2,...)
    return date.getDay() === 0;
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

  // Guardar período
  const handleCrearPeriodo = async (continueAdding = false) => {
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
    if (!validateForm()) {
      return;
    }
    try {
      // Crear período (el modelo espera: name, course (id), start, end)
      const periodoData = {
        name: nombrePeriodo,
        course: Number(cursoId),
        start: formatDateForBackend(startDate),
        end: formatDateForBackend(endDate),
      };
      const res = await periodsApi.create(periodoData);

      // Guardar días sin clases (solo si hay)
      for (const day of daysWithoutClasses) {
        await days_not_availableApi.create({
          reason: day.reason,
          day: formatDateForBackend(day.date),
          period: res.data.id,
        });
      }
      // Guardar semanas sin clases (solo si hay)
      for (const week of weeksWithoutClasses) {
        await weeks_not_availableApi.create({
          reason: week.reason,
          start_date: formatDateForBackend(week.startDate),
          end_date: formatDateForBackend(week.endDate),
          period: res.data.id,
        });
      }
      
      if (continueAdding) {
        // Limpiar formulario y mostrar mensaje de éxito
        setSuccessMessage("Período creado exitosamente");
        setNombrePeriodo("");
        setStartDate(null);
        setEndDate(null);
        setSelectedDate(null);
        setReason("");
        setDaysWithoutClasses([]);
        setWeeksWithoutClasses([]);
        setWeekRange({ startDate: null, endDate: null });
        setWeekReason("");
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Redireccionar igual que antes
        if (location.state && location.state.from) {
          navigate(location.state.from);
        } else {
          navigate("/mapa-horarios");
        }
      }
    } catch (error) {
      let msg = "Error al guardar el período.";
      if (error.response && error.response.data) {
        // Mostrar errores del backend si existen
        msg = Object.values(error.response.data).flat().join(" ");
      }
      setSubmitError(msg);
      console.error(error);
    }
  };

  // Custom DatePicker input component
  const CustomDatePickerInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <div className="relative w-full">
        <input
          ref={ref}
          className="w-full bg-gray-300 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] rounded-xl pl-10 pr-3 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900"
          onClick={onClick}
          value={value}
          placeholder={placeholder}
          readOnly
        />
        <Calendar className="absolute left-3 top-3 text-[#006599]" size={18} />
      </div>
    )
  );

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

  return (
    <div className="w-full py-10 px-4 md:px-10 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-xl border-2 border-white p-8 mx-auto">
        <h1 className="text-3xl font-bold text-[#006599] mb-2">
          Configuración de Período
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Defina el período académico y los días/semanas no disponibles
        </p>
        {/* Mensajes de error generales solo en caso de submitError */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{submitError}</div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>
        )}

        {/* Nombre del período */}
        <div className="mb-8">
          <label
            htmlFor="nombrePeriodo"
            className="block text-[#006599] font-semibold mb-2 text-lg"
          >
            Nombre del período
          </label>
          <input
            id="nombrePeriodo"
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
          <label
            htmlFor="curso"
            className="block text-[#006599] font-semibold mb-2 text-lg"
          >
            Curso
          </label>
          <select
            id="curso"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className={`w-full bg-gray-300 border-2 ${formErrors.cursoId ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 h-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow-[0_0_0_2px_rgba(18,166,185,0.1)] transition-all duration-200 text-gray-900 bg-white`}
          >
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
              customInput={
                <CustomDatePickerInput placeholder="Seleccione fecha de inicio" />
              }
            />
            {/* Solo muestra error si el campo lo tiene */}
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
              customInput={
                <CustomDatePickerInput placeholder="Seleccione fecha de fin" />
              }
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
                customInput={
                  <CustomDatePickerInput placeholder="Seleccione fecha" />
                }
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
                customInput={
                  <CustomDatePickerInput />
                }
                minDate={startDate}
                maxDate={endDate}
                monthsShown={1}
                showWeekNumbers
                placeholderText="Seleccione fechas"
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

        {/* Botones para crear período */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (location.state && location.state.from) {
                navigate(location.state.from);
              } else {
                navigate("/mapa-horarios");
              }
            }}
            className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-all duration-200 text-base sm:text-lg font-semibold order-2 sm:order-1"
          >
            Cancelar
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => handleCrearPeriodo(true)}
              className="w-full sm:w-auto bg-[#12a6b9] hover:bg-[#0e8a9c] text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg font-semibold whitespace-nowrap"
            >
              Guardar y Crear Otro
            </button>
            <button
              type="button"
              onClick={() => handleCrearPeriodo(false)}
              className="w-full sm:w-auto bg-[#006599] hover:bg-[#005080] text-white px-6 sm:px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg font-semibold"
            >
              Crear período
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


