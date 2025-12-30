import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"
import { jwtDecode } from "jwt-decode";


import { Navigation } from "./components/Navigation"
import { PeriodForm } from "./components/period-form"
import { SubjectForm } from "./components/subject-form"
import { Home } from "./pages/SchedulePage"
import { EditPeriod } from "./components/edit-period"
import { EditSubject } from "./components/edit-subject"
import { HorarioAcademico } from "./components/horario-academico"
import { MapaHorarios } from "./components/mapa-horarios"
import { FacultyForm } from "./components/faculty-form"
import { EditFaculty } from "./components/edit-faculty"
import { CourseForm } from "./components/course-form";
import { EditCourse } from "./components/edit-course";
import { CareerForm } from "./components/career-form";
import { EditCareer } from "./components/edit-career";
import { YearForm } from "./components/year-form";
import { EditYear } from "./components/edit-year";
import { TeacherForm } from "./components/teacher-form";
import { EditTeacher } from "./components/edit-teacher";
import { SubjectsDetails } from "./components/subjects-details"
import { TeachersDetails } from "./components/teachers-details";
import RegisterForm from "./components/register-form";
import LoginForm from "./components/login-form"
import { HomePage } from "./pages/HomePage"
import AdminUsuarios from "./components/AdminUsuarios"
import { ActivityDetails } from "./components/activity-details";
import { ActivityForm } from "./components/activity-form";
import { EditActivity } from "./components/edit-activity";
import { RoomsDetails } from "./components/rooms-details";
import { RoomForm } from "./components/room-form";
import { EditRoom } from "./components/edit-room";

function PrivateRoute({ children, requireRole = false }) {
  const isAuth = !!localStorage.getItem("access");
  let hasRole = false;
  if (isAuth && requireRole) {
    try {
      const token = localStorage.getItem("access");
      const decoded = jwtDecode(token);
      if (decoded.groups && decoded.groups.length > 0) {
        const userRole = decoded.groups[0];
        hasRole = userRole && userRole !== "user";
      }
    } catch {
      hasRole = false;
    }
  }
  if (!isAuth) return <Navigate to="/login" replace />;
  if (requireRole && !hasRole) return <Navigate to="/inicio" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="fixed top-0 left-0 w-full z-50">
        <Navigation />
      </div>
      <div className="h-16"></div>
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        {/* Rutas protegidas */}
        <Route path="/schedule" element={<PrivateRoute requireRole={true}><Home /></PrivateRoute>} />
        <Route path="/admin-usuarios" element={<PrivateRoute requireRole={true}><AdminUsuarios /></PrivateRoute>} />
        <Route path="/periodos" element={<PrivateRoute requireRole={true}><PeriodForm /></PrivateRoute>} />
        <Route path="/mapa-horarios" element={<PrivateRoute><MapaHorarios /></PrivateRoute>} />
        <Route path="/periodos/:id" element={<PrivateRoute requireRole={true}><EditPeriod /></PrivateRoute>} />
        <Route path="/subjects-details" element={<PrivateRoute requireRole={true}><SubjectsDetails /></PrivateRoute>} />
        <Route path="/asignaturas/:id" element={<PrivateRoute requireRole={true}><EditSubject /></PrivateRoute>} />
        <Route path="/facultades" element={<PrivateRoute requireRole={true}><FacultyForm /></PrivateRoute>} />
        <Route path="/facultades/:id" element={<PrivateRoute requireRole={true}><EditFaculty /></PrivateRoute>} />
        <Route path="/cursos" element={<PrivateRoute requireRole={true}><CourseForm /></PrivateRoute>} />
        <Route path="/cursos/:id" element={<PrivateRoute requireRole={true}><EditCourse /></PrivateRoute>} />
        <Route path="/carreras" element={<PrivateRoute requireRole={true}><CareerForm /></PrivateRoute>} />
        <Route path="/carreras/:id" element={<PrivateRoute requireRole={true}><EditCareer /></PrivateRoute>} />
        <Route path="/años" element={<PrivateRoute requireRole={true}><YearForm /></PrivateRoute>} />
        <Route path="/años/:id" element={<PrivateRoute requireRole={true}><EditYear /></PrivateRoute>} />
        <Route path="/profesores-details" element={<PrivateRoute requireRole={true}><TeachersDetails /></PrivateRoute>} />
        <Route path="/profesores/:id" element={<PrivateRoute requireRole={true}><EditTeacher /></PrivateRoute>} />
        <Route
          path="/calendario/:scheduleId"
          element={<PrivateRoute><CalendarioWrapper /></PrivateRoute>}
        />
        <Route path="/asignaturas" element={<PrivateRoute requireRole={true}><SubjectForm /></PrivateRoute>} />
        <Route path="/profesores" element={<PrivateRoute requireRole={true}><TeacherForm /></PrivateRoute>} />
        {/* Rutas para actividades */}
        <Route path="/actividades" element={<PrivateRoute requireRole={true}><ActivityDetails /></PrivateRoute>} />
        <Route path="/actividad" element={<PrivateRoute requireRole={true}><ActivityForm /></PrivateRoute>} />
        <Route path="/actividad/:id" element={<PrivateRoute requireRole={true}><EditActivity /></PrivateRoute>} />
        {/* Rutas para locales */}
        <Route path="/locales" element={<PrivateRoute requireRole={true}><RoomsDetails /></PrivateRoute>} />
        <Route path="/local" element={<PrivateRoute requireRole={true}><RoomForm /></PrivateRoute>} />
        <Route path="/local/:id" element={<PrivateRoute requireRole={true}><EditRoom /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper para extraer el scheduleId de la URL y pasarlo al componente
function CalendarioWrapper() {
  const { scheduleId } = useParams();
  return <HorarioAcademico scheduleId={scheduleId} />;
}
export default App;