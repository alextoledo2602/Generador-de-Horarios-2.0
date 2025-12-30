"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { teachersApi } from "@/api/tasks.api";

export function TeachersDetails() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Cargar todos los profesores
  useEffect(() => {
    teachersApi
      .getAll()
      .then((response) => {
        setTeachers(response.data);
        setFilteredTeachers(response.data);
      })
      .catch((err) => {
        alert(
          "Error al cargar profesores: " +
            (err.response?.status === 401
              ? "No autorizado"
              : err.message)
        );
      });
  }, []);

  // Filtrar profesores por nombre
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeachers(teachers);
    } else {
      setFilteredTeachers(
        teachers.filter((teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, teachers]);

  // Eliminar profesor
  const handleDeleteTeacher = async (teacherId) => {
    if (confirm("¿Estás seguro de que deseas eliminar este profesor?")) {
      try {
        await teachersApi.delete(teacherId);
        setTeachers(teachers.filter((t) => t.id !== teacherId));
        setFilteredTeachers(filteredTeachers.filter((t) => t.id !== teacherId));
      } catch (err) {
        alert(
          "Error al eliminar el profesor: " +
            (err.response?.status === 401
              ? "No autorizado"
              : err.message)
        );
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center text-[#006599]">
          Profesores
        </h1>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/profesores")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Crear Profesor
        </Button>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar profesor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-8 bg-white text-gray-900 dark:text-gray-100"
      />

      {/* Lista de profesores */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="overflow-hidden flex flex-col h-full min-h-[140px] justify-between"
            >
              <CardContent className="p-6 flex flex-col flex-1 justify-center">
                <div className="flex items-center min-h-[60px] gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-2xl font-bold">
                        {teacher.name && teacher.name.length > 0
                          ? teacher.name.charAt(0).toUpperCase()
                          : "?"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[#006599] text-xl font-bold ml-2 leading-tight">
                    {teacher.name}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/profesores/${teacher.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron profesores con ese nombre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
