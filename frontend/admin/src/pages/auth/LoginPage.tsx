import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
} from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import PublicFooter from '../../components/layout/PublicFooter';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const role = await login({ email, password });
      if (role === 'Médico') navigate('/panel/doctor');
      else if (role === 'Enfermero') navigate('/panel/enfermeria');
      else if (role === 'Recepcionista') navigate('/bandeja');
      else navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', position: 'relative' }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
            CLINIX Admin
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
            Inicio de sesión administrativo
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Correo electrónico"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              Entrar
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              ¿Olvidó su contraseña?
            </Link>
          </Box>
        </CardContent>
      </Card>
      <Box sx={{ position: 'absolute', bottom: 32, left: 0, right: 0, zIndex: 1 }}>
        <PublicFooter />
      </Box>
    </Box>
  );
}
