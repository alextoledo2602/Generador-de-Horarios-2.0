import axios from "axios";

// Usa la variable de entorno o localhost por defecto
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/tasks/api/v1/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_BASE_URL}/tasks/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access", access);

        // Actualizar el token en la petición original
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, redirigir al login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const createApiEndpoints = (resource) => ({
  getAll: () => apiClient.get(`/${resource}/`),
  get: (id) => apiClient.get(`/${resource}/${id}/`),
  create: (data) => apiClient.post(`/${resource}/`, data),
  update: (id, data) => apiClient.put(`/${resource}/${id}/`, data),
  delete: (id) => apiClient.delete(`/${resource}/${id}/`),
});

export const taskApi = createApiEndpoints("tasks");
export const facultiesApi = createApiEndpoints("faculties");
export const careersApi = createApiEndpoints("careers");
export const coursesApi = createApiEndpoints("courses");
export const yearsApi = createApiEndpoints("years");
export const periodsApi = createApiEndpoints("periods");
export const subjectsApi = createApiEndpoints("subjects");
export const days_not_availableApi = createApiEndpoints("days_not_available");
export const weeks_not_availableApi = createApiEndpoints("weeks_not_available");
export const class_times = createApiEndpoints("class_times");
export const schedulesApi = createApiEndpoints("schedules");
export const load_balancesApi = createApiEndpoints("load_balances");
export const teachersApi = createApiEndpoints("teachers");
export const activitysApi = createApiEndpoints("activities");
export const class_roomsApi = createApiEndpoints("class_rooms");
export const usersApi = createApiEndpoints("admin/users");

// Endpoint para calcular balance
export const calculateBalanceApi = (data) =>
  apiClient.post("calculate-balance/", data);

// NUEVO: Endpoint para obtener el rol/grupo del usuario autenticado
export const whoamiApi = (config = {}) =>
  apiClient.get("whoami/", config);


// NUEVO: Endpoint para exportar el horario a PDF con Playwright
export const exportarHorarioPdfPlaywrightApi = (scheduleId) =>
  axios.get(`${API_BASE_URL}/tasks/api/exportar-pdf-playwright/${scheduleId}/`, { responseType: 'blob' });

// NUEVO: Endpoint para exportar el horario a Imagen (PNG) con Playwright
export const exportarHorarioImagenPlaywrightApi = (scheduleId) =>
  axios.get(`${API_BASE_URL}/tasks/api/exportar-imagen-playwright/${scheduleId}/`, { responseType: 'blob' });


