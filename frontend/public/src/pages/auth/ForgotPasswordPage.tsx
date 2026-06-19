import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert } from '@mui/material';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email });
    setSent(true);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
            Recuperar Contraseña
          </Typography>
          {sent ? (
            <Alert severity="success">Si el correo existe, recibirá un enlace.</Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField label="Correo electrónico" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
              <Button type="submit" variant="contained" fullWidth size="large">Enviar</Button>
            </form>
          )}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">Volver</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
