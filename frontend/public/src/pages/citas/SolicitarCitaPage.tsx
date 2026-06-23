import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stepper, Step, StepLabel, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Checkbox, FormControlLabel, Alert, Grid, Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../../services/api';
import type { Especialidad, Medico, DisponibilidadSlot } from '../../types';

const steps = ['Especialidad', 'Médico', 'Horario', 'Confirmar'];

export default function SolicitarCitaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [slots, setSlots] = useState<DisponibilidadSlot[]>([]);
  const [fecha, setFecha] = useState(dayjs());

  const [especialidadId, setEspecialidadId] = useState<number | ''>('');
  const [medicoId, setMedicoId] = useState<number | ''>('');
  const [slotSeleccionado, setSlotSeleccionado] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [motivo, setMotivo] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    api.get<Especialidad[]>('/public/especialidades').then(({ data }) => setEspecialidades(data));
    const medParam = searchParams.get('medico');
    if (medParam) setMedicoId(Number(medParam));
  }, []);

  useEffect(() => {
    if (especialidadId) {
      api.get<{ items: Medico[] }>(`/public/medicos?especialidad_id=${especialidadId}`)
        .then(({ data }) => setMedicos(data.items));
    }
  }, [especialidadId]);

  useEffect(() => {
    if (medicoId && fecha) {
      api.get<{ slots: DisponibilidadSlot[] }>(`/disponibilidad/${medicoId}?fecha=${fecha.format('YYYY-MM-DD')}`)
        .then(({ data }) => setSlots(data.slots));
    }
  }, [medicoId, fecha]);

  const handleSiguiente = () => {
    if (activeStep === 0 && !especialidadId) { setError('Seleccione una especialidad'); return; }
    if (activeStep === 1 && !medicoId) { setError('Seleccione un médico'); return; }
    if (activeStep === 2 && !slotSeleccionado) { setError('Seleccione un horario'); return; }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleEnviar = async () => {
    if (!nombre || !apellido || !dni || !email || !acepta) {
      setError('Complete todos los campos obligatorios y acepte términos.');
      return;
    }
    setError('');
    try {
      const fechaHora = `${fecha.format('YYYY-MM-DD')}T${slotSeleccionado}`;
      await api.post('/public/reservas', {
        nombre_solicitante: `${nombre} ${apellido}`,
        dni_solicitante: dni,
        email_solicitante: email,
        telefono_solicitante: telefono || undefined,
        especialidad_id: especialidadId,
        medico_id: medicoId || undefined,
        fecha_hora_deseada: fechaHora,
        motivo_consulta: motivo || undefined,
        acepta_terminos: acepta,
      });
      setExito(true);
    } catch {
      setError('Error al enviar la solicitud. Intente de nuevo.');
    }
  };

  if (exito) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }} gutterBottom>
          ¡Solicitud Enviada!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Su solicitud de cita ha sido registrada. Recibirá una respuesta en su correo electrónico.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Volver al inicio</Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Solicitar Cita</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Complete los pasos para solicitar su cita médica
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Seleccione una especialidad</Typography>
              <FormControl fullWidth>
                <InputLabel>Especialidad</InputLabel>
                <Select value={especialidadId} label="Especialidad" onChange={(e) => { setEspecialidadId(Number(e.target.value)); setMedicoId(''); setSlotSeleccionado(null); }}>
                  {especialidades.map((esp) => (
                    <MenuItem key={esp.especialidad_id} value={esp.especialidad_id}>{esp.nombre_especialidad}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Seleccione un médico</Typography>
              <Grid container spacing={2}>
                {medicos.map((m) => (
                  <Grid key={m.medico_id} size={{ xs: 12, sm: 6 }}>
                    <Card
                      sx={{ cursor: 'pointer', border: medicoId === m.medico_id ? 2 : 0, borderColor: 'primary.main' }}
                      onClick={() => { setMedicoId(m.medico_id); setSlotSeleccionado(null); }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{m.nombre} {m.apellido}</Typography>
                        <Chip label={m.especialidad} size="small" color="primary" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {medicos.length === 0 && (
                  <Grid size={{ xs: 12 }}><Typography color="text.secondary">No hay médicos disponibles para esta especialidad.</Typography></Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Seleccione fecha y horario</Typography>
              <DatePicker
                label="Fecha"
                value={fecha}
                onChange={(v) => { setFecha(v ?? dayjs()); setSlotSeleccionado(null); }}
                disablePast
                sx={{ mb: 3, width: '100%' }}
              />
              <Typography variant="subtitle2" gutterBottom>Horarios disponibles:</Typography>
              <Grid container spacing={1}>
                {slots.filter((s) => s.disponible).map((s) => (
                  <Grid key={s.hora_inicio} size={{ xs: 4, sm: 3 }}>
                    <Button
                      variant={slotSeleccionado === s.hora_inicio ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => setSlotSeleccionado(s.hora_inicio)}
                    >
                      {s.hora_inicio.slice(0, 5)}
                    </Button>
                  </Grid>
                ))}
                {slots.filter((s) => s.disponible).length === 0 && (
                  <Grid size={{ xs: 12 }}><Typography color="text.secondary">No hay horarios disponibles para esta fecha.</Typography></Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeStep === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Datos personales</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Nombres" fullWidth value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Apellidos" fullWidth value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="DNI" fullWidth value={dni} onChange={(e) => setDni(e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Correo electrónico" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Teléfono" fullWidth value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Motivo de consulta" fullWidth multiline rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                </Grid>
              </Grid>
              <FormControlLabel
                control={<Checkbox checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />}
                label="Acepto los términos y condiciones de privacidad"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
            Anterior
          </Button>
          {activeStep < 3 ? (
            <Button variant="contained" onClick={handleSiguiente}>Siguiente</Button>
          ) : (
            <Button variant="contained" onClick={handleEnviar}>Enviar Solicitud</Button>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
