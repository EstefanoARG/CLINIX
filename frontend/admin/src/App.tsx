import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './store/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bandeja" element={<BandejaRecepcion />} />
          <Route path="/habitaciones" element={<PanelCuartos />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/ubicaciones" element={<UbicacionesPage />} />
          <Route path="/citas" element={<AdmisionCitas />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
