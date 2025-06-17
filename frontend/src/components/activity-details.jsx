import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { activitysApi } from "@/api/tasks.api";

export function ActivityDetails() {
  const [activities, setActivities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    activitysApi.getAll()
      .then(res => {
        setActivities(res.data);
        setFiltered(res.data);
      })
      .catch(() => setError("Error al cargar actividades"));
  }, []);

  useEffect(() => {
    if (!search.trim()) setFiltered(activities);
    else setFiltered(
      activities.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        String(a.symbology).includes(search)
      )
    );
  }, [search, activities]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta actividad?")) return;
    try {
      await activitysApi.delete(id);
      setActivities(activities.filter(a => a.id !== id));
      setFiltered(filtered.filter(a => a.id !== id));
    } catch {
      setError("No se pudo eliminar la actividad");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#006599]">Actividades</h1>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/actividad")}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Crear Actividad
        </Button>
      </div>
      <Input
        placeholder="Buscar actividad..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-8 bg-white text-gray-900"
      />
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map(activity => (
            <Card key={activity.id} className="overflow-hidden flex flex-col h-full min-h-[120px] justify-between">
              <CardContent className="p-6 flex flex-col flex-1 justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-[#006599]">
                    {activity.symbology}
                  </div>
                  <span className="text-[#006599] text-xl font-bold ml-2">{activity.name}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/actividad/${activity.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(activity.id)}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
            <p className="text-gray-500">No se encontraron actividades.</p>
          </div>
        )}
      </div>
    </div>
  );
}
