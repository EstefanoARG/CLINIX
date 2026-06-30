import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import theme from './theme';
import { AuthProvider } from './store/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import Inicio from './pages/PublicPortal/Inicio';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import MedicosPage from './pages/medicos/MedicosPage';
import SolicitudCita from './pages/PublicPortal/SolicitudCita';
import MisReservasPage from './pages/citas/MisReservasPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/solicitar-cita" element={<SolicitudCita />} />
              <Route element={<PublicLayout />}>
                <Route path="/medicos" element={<MedicosPage />} />
                <Route path="/mis-reservas" element={<MisReservasPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
