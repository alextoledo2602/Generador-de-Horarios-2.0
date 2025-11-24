import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("access") || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok && data.access) {
        setMessage("¡Inicio de sesión exitoso!");
        setSuccess(true);
        setToken(data.access);
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // --- Decodifica el token para obtener el rol ---
        let rol = "sin rol";
        try {
          const decoded = jwtDecode(data.access);
          if (decoded.groups && decoded.groups.length > 0) {
            rol = decoded.groups[0];
          }
        } catch (err) {
          // Si falla la decodificación, deja rol como "sin rol"
        }
        if (rol !== "user" && rol !== "sin rol") {
          alert(`Tu rol es: ${rol}`);
        }
        window.location.href = "/mapa-horarios";
      } else {
        setMessage("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      setMessage("Error de red");
    }
  };

  // Elimina el renderizado del cartel de sesión iniciada y botón cerrar sesión
  if (token) {
    // Redirige automáticamente si ya hay token
    window.location.href = "/mapa-horarios";
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#006599] to-[#12a6b9] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl border-2 border-white p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-[#006599] mb-6 text-center">
          Iniciar Sesión
        </h2>
        <div className="mb-4">
          <label className="block text-[#006599] font-semibold mb-2">
            Usuario
          </label>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
            className="w-full bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
          />
        </div>
        <div className="mb-6">
          <label className="block text-[#006599] font-semibold mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full bg-gray-200 border-2 border-gray-300 rounded-xl px-4 py-3 pr-12 text-base font-medium focus:bg-white focus:border-[#12a6b9] focus:shadow transition-all duration-200 text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#006599] transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-3 bg-[#006599] hover:bg-[#005080] text-white rounded-xl shadow-lg font-semibold text-lg transition-all duration-200"
        >
          Entrar
        </button>
        {message && (
          <p
            className={`mt-4 text-center text-base font-medium ${
              success
                ? "text-green-700 bg-green-100 rounded p-2"
                : "text-red-700 bg-red-100 rounded p-2"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default LoginForm;
