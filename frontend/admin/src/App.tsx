import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './store/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BandejaRecepcion from './pages/recepcion/BandejaRecepcion';
import PanelCuartos from './pages/habitaciones/PanelCuartos';
import AdmisionCitas from './pages/citas/AdmisionCitas';
import DepartamentosPage from './pages/departamentos/DepartamentosPage';
import UbicacionesPage from './pages/ubicaciones/UbicacionesPage';
import EspecialidadesPage from './pages/especialidades/EspecialidadesPage';
import DoctoresPage from './pages/doctores/DoctoresPage';
import EnfermerasPage from './pages/enfermeras/EnfermerasPage';
import PacientesPage from './pages/pacientes/PacientesPage';
import AdmisionesPage from './pages/admisiones/AdmisionesPage';
import AuditoriaPage from './pages/auditoria/AuditoriaPage';
import PanelEnfermeriaPage from './pages/paneles/PanelEnfermeriaPage';
import DoctorPacientesPage from './pages/paneles/DoctorPacientesPage';
import DoctorHistorialPage from './pages/paneles/DoctorHistorialPage';
import AgendaPage from './pages/agenda/AgendaPage';
import { useAuth } from './store/AuthContext';

function RoleHome() {
  const { user } = useAuth();
  if (user?.role === 'Médico') return <Navigate to="/panel/doctor" replace />;
  if (user?.role === 'Enfermero') return <Navigate to="/panel/enfermeria" replace />;
  if (user?.role === 'Recepcionista') return <Navigate to="/bandeja" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<RoleHome />} />
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bandeja" element={<BandejaRecepcion />} />
          <Route path="/habitaciones" element={<PanelCuartos />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/ubicaciones" element={<UbicacionesPage />} />
          <Route path="/especialidades" element={<EspecialidadesPage />} />
          <Route path="/doctores" element={<DoctoresPage />} />
          <Route path="/enfermeras" element={<EnfermerasPage />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/citas" element={<AdmisionCitas />} />
          <Route path="/reservas" element={<BandejaRecepcion />} />
          <Route path="/admisiones" element={<AdmisionesPage />} />
          <Route path="/auditoria" element={<AuditoriaPage />} />
          <Route path="/panel/enfermeria" element={<PanelEnfermeriaPage />} />
        </Route>
        <Route element={<DoctorLayout />}>
          <Route path="/panel/doctor" element={<AgendaPage />} />
          <Route path="/panel/doctor/pacientes" element={<DoctorPacientesPage />} />
          <Route path="/panel/doctor/pacientes/:pacienteId/historial" element={<DoctorHistorialPage />} />
        </Route>
      </Route>
      <Route path="*" element={<RoleHome />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
