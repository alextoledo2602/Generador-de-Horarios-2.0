import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { load_balancesApi, schedulesApi, subjectsApi } from "../api/tasks.api";

export function BalanceCargaTable({ scheduleId }) {
  const [balanceData, setBalanceData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scheduleId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        // Usar el cliente API para load_balances
        const balancesRes = await load_balancesApi.getAll();
        const balances = balancesRes.data;
        // Filtrar explícitamente el balance que corresponde al scheduleId
        const balanceObj = balances.find(b => String(b.schedule) === String(scheduleId));
        if (!balanceObj) {
          setBalanceData([]);
          setSubjects([]);
          setLoading(false);
          return;
        }
        setBalanceData(balanceObj.balance);

        // Usar el cliente API para obtener el horario
        const scheduleRes = await schedulesApi.get(scheduleId);
        const schedule = scheduleRes.data;
        const subjectIds = schedule.subjects;

        // Usar el cliente API para obtener todas las asignaturas
        const subjectsRes = await subjectsApi.getAll();
        const allSubjects = subjectsRes.data;

        const filteredSubjects = allSubjects
          .filter((s) => subjectIds.includes(s.id))
          .sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(filteredSubjects);
      } catch (e) {
        console.error(e);
        setBalanceData([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scheduleId]);

  const calcularTotalFila = (fila) => fila.reduce((sum, valor) => sum + valor, 0);
  const calcularTotalColumna = (indiceColumna) =>
    balanceData.reduce((sum, fila) => sum + (fila[indiceColumna] || 0), 0);
  const totalGeneral = balanceData.reduce(
    (sum, fila) => sum + calcularTotalFila(fila),
    0
  );

  if (loading)
    return (
      <Card className="bg-white shadow-xl border border-gray-200 rounded-xl mt-8">
        <CardContent className="py-8 text-center text-gray-500 text-lg font-medium">
          Cargando balance de carga...
        </CardContent>
      </Card>
    );
  if (!balanceData.length || !subjects.length)
    return (
      <Card className="bg-white shadow-xl border border-gray-200 rounded-xl mt-8">
        <CardContent className="py-8 text-center text-gray-500 text-lg font-medium">
          No hay datos de balance de carga.
        </CardContent>
      </Card>
    );

  return (
    <Card className="bg-white shadow-xl border border-gray-200 rounded-xl mt-8">
      <CardHeader className="pb-2 flex flex-row items-center gap-3">
        <span className="w-2 h-10 bg-[#12a6b9] rounded-full mt-1"></span>
        <div>
          <CardTitle className="text-[#006599] text-2xl font-bold mb-1">
            Balance de Carga
          </CardTitle>
          <div className="text-gray-600 text-lg font-medium">
            Distribución semanal de horas por asignatura
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <div className="overflow-x-auto border-2 border-[#12a6b9] rounded-xl bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#e0f7fa]">
                <TableHead className="font-bold text-center min-w-[80px] text-base text-[#006599] bg-[#e0f7fa]">
                  Semana
                </TableHead>
                {subjects.map((asignatura) => (
                  <TableHead
                    key={asignatura.id}
                    className="font-bold text-center min-w-[60px] text-base text-[#006599] bg-[#e0f7fa]"
                  >
                    {asignatura.symbology}
                  </TableHead>
                ))}
                <TableHead className="font-bold text-center min-w-[80px] text-base text-[#006599] bg-[#e0f7fa]">
                  Totales
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanceData.map((semana, indiceSemana) => (
                <TableRow
                  key={indiceSemana}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-center bg-white text-base text-gray-700">
                    S{indiceSemana + 1}
                  </TableCell>
                  {subjects.map((_, indiceAsignatura) => (
                    <TableCell key={indiceAsignatura} className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-700 font-medium text-base">
                        {semana[indiceAsignatura] || 0}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold bg-white">
                    <span className="inline-flex items-center justify-center w-10 h-8 rounded bg-[#e6f3fa] text-[#006599] font-bold">
                      {calcularTotalFila(semana)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 border-t border-gray-200">
                <TableCell className="font-bold text-center text-[#006599] text-base">
                  Totales
                </TableCell>
                {subjects.map((_, indiceAsignatura) => (
                  <TableCell
                    key={indiceAsignatura}
                    className="text-center font-bold"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-8 rounded bg-[#e6f3fa] text-[#006599] font-bold">
                      {calcularTotalColumna(indiceAsignatura)}
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">
                  <span className="inline-flex items-center justify-center w-12 h-10 rounded bg-[#12a6b9] text-white font-bold text-lg">
                    {totalGeneral}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
