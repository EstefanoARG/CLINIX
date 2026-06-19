import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { useAuth } from '../../store/AuthContext';

export default function LoginPage() {
  const { loginPaciente } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginPaciente(email, password);
      navigate('/');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
            Iniciar Sesión
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField label="Correo electrónico" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
            <TextField label="Contraseña" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" fullWidth size="large">Entrar</Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">¿Olvidó su contraseña?</Link>
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">¿No tiene cuenta? Regístrese</Link>
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Link component={RouterLink} to="/" variant="body2">Volver</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
