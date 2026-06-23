import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface AuthState {
  token: string | null;
  pacienteId: number | null;
  nombre: string | null;
  loading: boolean;
  loginPaciente: (email: string, password: string) => Promise<void>;
  registerPaciente: (data: {
    dni: string; nombre: string; apellido: string;
    email: string; password: string; telefono?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('access_token') && !sessionStorage.getItem('access_token')) {
      sessionStorage.setItem('access_token', localStorage.getItem('access_token')!);
      sessionStorage.setItem('refresh_token', localStorage.getItem('refresh_token') ?? '');
      sessionStorage.setItem('paciente_id', localStorage.getItem('paciente_id') ?? '');
      sessionStorage.setItem('paciente_nombre', localStorage.getItem('paciente_nombre') ?? '');
      localStorage.clear();
    }
    const storedToken = sessionStorage.getItem('access_token');
    const storedId = sessionStorage.getItem('paciente_id');
    const storedName = sessionStorage.getItem('paciente_nombre');
    if (storedToken) {
      setToken(storedToken);
      setPacienteId(storedId ? Number(storedId) : null);
      setNombre(storedName);
    }
    setLoading(false);
  }, []);

  const loginPaciente = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login/paciente', { email, password });
    sessionStorage.setItem('access_token', data.access_token);
    sessionStorage.setItem('refresh_token', data.refresh_token);
    sessionStorage.setItem('paciente_id', String(data.user_id));
    sessionStorage.setItem('paciente_nombre', data.nombre);
    setToken(data.access_token);
    setPacienteId(data.user_id);
    setNombre(data.nombre);
  };

  const registerPaciente = async (req: {
    dni: string; nombre: string; apellido: string;
    email: string; password: string; telefono?: string;
  }) => {
    const { data } = await api.post('/auth/register', { ...req, acepta_terminos: true });
    sessionStorage.setItem('access_token', data.access_token);
    sessionStorage.setItem('refresh_token', data.refresh_token);
    sessionStorage.setItem('paciente_id', String(data.user_id));
    sessionStorage.setItem('paciente_nombre', req.nombre);
    setToken(data.access_token);
    setPacienteId(data.user_id);
    setNombre(req.nombre);
  };

  const logout = () => {
    sessionStorage.clear();
    setToken(null);
    setPacienteId(null);
    setNombre(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, pacienteId, nombre, loading, loginPaciente, registerPaciente, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
