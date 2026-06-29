import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { submitLandingContact } from '../../services/landingApi';
import type { LandingContactPayload } from '../../types';

const implementationAreas = [
  { value: 'private', label: 'En mi propio consultorio' },
  { value: 'clinic', label: 'En una clinica / centro de salud / hospital' },
  { value: 'lab', label: 'En centro de diagnostico / laboratorio' },
  { value: 'agency', label: 'Para mis clientes, represento a una agencia' },
  { value: 'partnership', label: 'Busco una alianza con CLINIX' },
  { value: 'patient', label: 'Soy un paciente que quiere reservar una cita' },
  { value: 'other', label: 'Otro' },
];

const initialForm: LandingContactPayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  contactSchedule: '',
  implementationArea: '',
  acceptsMarketing: true,
};

export default function ContactForm() {
  const [form, setForm] = useState<LandingContactPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateField = (field: keyof LandingContactPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    try {
      await submitLandingContact(form);
      setForm(initialForm);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box id="contact" sx={{ bgcolor: '#0F172A', py: { xs: 6, md: 10 }, px: { xs: 2, md: 0 } }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: { xs: 3, md: 5 },
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4), 0 8px 24px -6px rgba(0,0,0,0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, mt: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#DBEAFE',
                  borderRadius: '12px',
                  width: 40,
                  height: 40,
                }}
              >
                <MessageCircle size={20} color="#2563EB" />
              </Box>
              <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                Aun tienes dudas?
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, ml: { xs: 0, sm: 7 }, fontSize: '1rem' }}>
              Permitenos resolverlas y ofrecerte una demostracion gratuita de nuestra solucion.
            </Typography>

            {status === 'success' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Solicitud enviada. Nos comunicaremos contigo pronto.
              </Alert>
            )}
            {status === 'error' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                No se pudo enviar la solicitud. Intentalo nuevamente.
              </Alert>
            )}

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre(s)"
                  required
                  value={form.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  required
                  value={form.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Correo electronico"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Numero de telefono celular"
                  required
                  placeholder="Por favor, inserte un numero de contacto"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Horario para contactar"
                  value={form.contactSchedule}
                  onChange={(event) => updateField('contactSchedule', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="En donde necesitas implementar la solucion?"
                  required
                  value={form.implementationArea}
                  onChange={(event) => updateField('implementationArea', event.target.value)}
                >
                  <MenuItem value="" disabled>
                    - Seleccionar -
                  </MenuItem>
                  {implementationAreas.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <FormControlLabel
              sx={{ mt: 2, alignItems: 'flex-start' }}
              control={
                <Checkbox
                  checked={form.acceptsMarketing}
                  onChange={(event) => updateField('acceptsMarketing', event.target.checked)}
                />
              }
              label={
                <Typography variant="caption" sx={{ display: 'block', color: '#64748B', lineHeight: 1.5 }}>
                  Acepto recibir informacion de CLINIX Peru por correo electronico y WhatsApp.
                </Typography>
              }
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{
                mt: 3,
                background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
                py: 1.8,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px -4px rgba(37,99,235,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #0a3b6a 100%)',
                  boxShadow: '0 12px 32px -4px rgba(37,99,235,0.45)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
