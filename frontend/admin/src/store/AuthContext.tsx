import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { LoginRequest, TokenResponse, UserResponse } from '../types';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('access_token') && !sessionStorage.getItem('access_token')) {
      sessionStorage.setItem('access_token', localStorage.getItem('access_token')!);
      sessionStorage.setItem('refresh_token', localStorage.getItem('refresh_token') ?? '');
      localStorage.clear();
    }
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (req: LoginRequest) => {
    const { data } = await api.post<TokenResponse>('/auth/login', req);
    sessionStorage.setItem('access_token', data.access_token);
    sessionStorage.setItem('refresh_token', data.refresh_token);
    setToken(data.access_token);
    setUser({
      usuario_id: data.user_id,
      nombre: data.nombre,
      apellido: '',
      email: '',
      role: data.role,
      activo: true,
      medico_id: data.medico_id,
    });
    return data.role;
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated: !!token }}
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
