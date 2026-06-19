import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { useAuth } from '../../store/AuthContext';

export default function RegisterPage() {
  const { registerPaciente } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ dni: '', nombre: '', apellido: '', email: '', telefono: '', password: '' });
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acepta) { setError('Debe aceptar los términos y condiciones'); return; }
    setError('');
    try {
      await registerPaciente(form);
      navigate('/');
    } catch {
      setError('Error al registrar. Verifique sus datos.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <Card sx={{ width: 480, p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
            Registro de Paciente
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField label="DNI" fullWidth value={form.dni} onChange={handleChange('dni')} required sx={{ mb: 2 }} />
            <TextField label="Nombres" fullWidth value={form.nombre} onChange={handleChange('nombre')} required sx={{ mb: 2 }} />
            <TextField label="Apellidos" fullWidth value={form.apellido} onChange={handleChange('apellido')} required sx={{ mb: 2 }} />
            <TextField label="Correo electrónico" type="email" fullWidth value={form.email} onChange={handleChange('email')} required sx={{ mb: 2 }} />
            <TextField label="Teléfono" fullWidth value={form.telefono} onChange={handleChange('telefono')} sx={{ mb: 2 }} />
            <TextField label="Contraseña" type="password" fullWidth value={form.password} onChange={handleChange('password')} required sx={{ mb: 2 }} />
            <FormControlLabel
              control={<Checkbox checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />}
              label="Acepto los términos y condiciones"
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large">Registrarse</Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">¿Ya tiene cuenta? Inicie sesión</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
