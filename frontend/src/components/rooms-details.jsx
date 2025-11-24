import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { class_roomsApi } from "@/api/tasks.api";

export function RoomsDetails() {
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    class_roomsApi.getAll()
      .then(res => {
        setRooms(res.data);
        setFiltered(res.data);
      })
      .catch(() => setError("Error al cargar locales"));
  }, []);

  useEffect(() => {
    if (!search.trim()) setFiltered(rooms);
    else setFiltered(
      rooms.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, rooms]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este local?")) return;
    try {
      await class_roomsApi.delete(id);
      setRooms(rooms.filter(r => r.id !== id));
      setFiltered(filtered.filter(r => r.id !== id));
    } catch {
      setError("No se pudo eliminar el local");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#006599]">Locales</h1>
        <Button
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          onClick={() => navigate("/local")}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Crear Local
        </Button>
      </div>
      <Input
        placeholder="Buscar local..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-8 bg-white text-gray-900"
      />
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map(room => (
            <Card key={room.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 min-h-0 h-auto shadow-sm">
              <CardContent className="flex flex-row items-center gap-3 p-0 mb-3 sm:mb-0">
                <Building2 className="text-[#006599] w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                <span className="text-[#006599] text-base sm:text-lg font-semibold break-words">{room.name}</span>
              </CardContent>
              <CardFooter className="flex flex-row gap-2 p-0 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/local/${room.id}`)}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Editar</span>
                  <span className="sm:hidden">Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm"
                  onClick={() => handleDelete(room.id)}
                >
                  <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span className="hidden sm:inline">Eliminar</span>
                  <span className="sm:hidden">Eliminar</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No se encontraron locales.</p>
          </div>
        )}
      </div>
    </div>
  );
}
