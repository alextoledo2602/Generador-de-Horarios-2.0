import React, { createContext, useContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUser(decoded);
        // Si el backend incluye roles en el token, extraerlos aquí
        if (decoded.groups) {
          setRoles(decoded.groups);
        } else {
          // Si no, pedirlos al backend
          axios.get(`${API_BASE_URL}/tasks/api/v1/whoami/`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => {
            setRoles(res.data.groups || []);
          }).catch(() => setRoles([]));
        }
      } catch {
        setUser(null);
        setRoles([]);
      }
    } else {
      setUser(null);
      setRoles([]);
    }
    setLoading(false);
  }, [token]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, token, roles, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
