import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
} from '@mui/material';
import api from '../../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = searchParams.get('token') ?? '';
      await api.post('/auth/reset-password', { token, new_password: newPassword });
      setSuccess(true);
    } catch {
      setError('Error al restablecer la contraseña. El token puede haber expirado.');
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Card sx={{ width: 400, p: 2 }}>
          <CardContent>
            <Alert severity="success" sx={{ mb: 2 }}>Contraseña restablecida correctamente.</Alert>
            <Button variant="contained" fullWidth onClick={() => navigate('/login')}>Ir al inicio de sesión</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
            Restablecer Contraseña
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large">Cambiar contraseña</Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
