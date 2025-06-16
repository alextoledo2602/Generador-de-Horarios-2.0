import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/tasks/api/v1/",
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
        const response = await axios.post("http://localhost:8000/tasks/api/token/refresh/", {
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
  apiClient.post("http://localhost:8000/tasks/api/calculate-balance/", data);

// NUEVO: Endpoint para obtener el rol/grupo del usuario autenticado
export const whoamiApi = (config = {}) =>
  apiClient.get("whoami/", config);

// NUEVO: Endpoint para exportar el horario a PDF (fuera del apiClient baseURL para evitar /api/v1/)
export const exportarHorarioPdfApi = (scheduleId) =>
  axios.get(`http://localhost:8000/tasks/api/exportar-pdf/${scheduleId}/`, { responseType: 'blob' });


