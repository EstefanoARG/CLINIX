import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, TextField, Button, Checkbox,
  FormControl, FormHelperText, InputLabel, Select, MenuItem, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { isAxiosError } from 'axios';
import api from '../../services/api';
import type { Especialidad, Medico, DisponibilidadResponse } from '../../types';
import ClinixLogo from '../../components/ClinixLogo';

interface FormState {
  nombres: string;
  apellidos: string;
  dni: string;
  direccion: string;
  email: string;
  telefono: string;
  fechaNacimiento: Dayjs | null;
  genero: '' | 'Masculino' | 'Femenino' | 'Otro';
  especialidadId: number | '';
  medicoId: number | '';
  descripcion: string;
  horario: string;
  aceptaTerminos: boolean;
}

interface LoaderState {
  especialidades: Especialidad[];
  medicos: Medico[];
  slots: DisponibilidadResponse['slots'];
  cargandoMedicos: boolean;
  cargandoSlots: boolean;
}

const DIAS_NOMBRES: Record<number, string> = {0:'Domingo',1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado'};

const INITIAL_FORM: FormState = {
  nombres: '',
  apellidos: '',
  dni: '',
  direccion: '',
  email: '',
  telefono: '',
  fechaNacimiento: null,
  genero: '',
  especialidadId: '',
  medicoId: '',
  descripcion: '',
  horario: '',
  aceptaTerminos: false,
};

const GENEROS = ['Masculino', 'Femenino', 'Otro'] as const;

export default function SolicitudCita() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loader, setLoader] = useState<LoaderState>({
    especialidades: [], medicos: [], slots: [],
    cargandoMedicos: false, cargandoSlots: false,
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mensajeSlots, setMensajeSlots] = useState('');
  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [terminosAbierto, setTerminosAbierto] = useState(false);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    api.get<Especialidad[]>('/public/especialidades')
      .then(({ data }) => setLoader(prev => ({ ...prev, especialidades: data })))
      .catch(() => setError('Error al cargar especialidades'));
  }, []);

  useEffect(() => {
    if (!form.especialidadId) {
      setLoader(prev => ({ ...prev, medicos: [], slots: [], cargandoMedicos: false }));
      return;
    }
    setLoader(prev => ({ ...prev, cargandoMedicos: true, slots: [] }));
    set('medicoId', '');
    set('horario', '');
    api.get<{ items: Medico[] }>(`/public/medicos?especialidad_id=${form.especialidadId}`)
      .then(({ data }) => setLoader(prev => ({ ...prev, medicos: data.items, cargandoMedicos: false })))
      .catch(() => { setError('Error al cargar médicos'); setLoader(prev => ({ ...prev, cargandoMedicos: false })); });
  }, [form.especialidadId]);

  const [fecha, setFecha] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (!form.medicoId) {
      setLoader(prev => ({ ...prev, slots: [], cargandoSlots: false }));
      setMensajeSlots('');
      setDiasAtencion([]);
      return;
    }
    setLoader(prev => ({ ...prev, cargandoSlots: true }));
    set('horario', '');
    setMensajeSlots('');
    api.get<DisponibilidadResponse>(`/disponibilidad/${form.medicoId}?fecha=${fecha.format('YYYY-MM-DD')}`)
      .then(({ data }) => {
        setLoader(prev => ({ ...prev, slots: data.slots, cargandoSlots: false }));
        setMensajeSlots(data.mensaje || '');
        setDiasAtencion(data.dias_atencion || []);
      })
      .catch(() => { setError('Error al cargar horarios'); setLoader(prev => ({ ...prev, cargandoSlots: false })); });
  }, [form.medicoId, fecha]);

  const validar = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombres.trim()) errs.nombres = 'El nombre es obligatorio.';
    else if (/\d/.test(form.nombres)) errs.nombres = 'El nombre no debe contener números.';
    if (!form.apellidos.trim()) errs.apellidos = 'Los apellidos son obligatorios.';
    else if (/\d/.test(form.apellidos)) errs.apellidos = 'Los apellidos no deben contener números.';
    if (!form.dni.trim()) errs.dni = 'El DNI es obligatorio.';
    else if (!/^\d{8,20}$/.test(form.dni)) errs.dni = 'El DNI debe tener entre 8 y 20 dígitos.';
    if (!form.direccion.trim()) errs.direccion = 'La dirección es obligatoria.';
    if (!form.email.trim()) errs.email = 'El correo electrónico es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ingrese un correo electrónico válido.';
    if (!form.telefono.trim()) errs.telefono = 'El teléfono es obligatorio.';
    else if (!/^\d{7,20}$/.test(form.telefono.replace(/[\s\-()]/g, ''))) errs.telefono = 'El teléfono solo debe contener números.';
    if (!form.fechaNacimiento) errs.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    if (!form.especialidadId) errs.especialidadId = 'Seleccione una especialidad.';
    if (!form.medicoId) errs.medicoId = 'Seleccione un médico.';
    if (!form.horario) errs.horario = 'Seleccione un horario disponible.';
    if (!form.aceptaTerminos) errs.aceptaTerminos = 'Debe aceptar los términos y condiciones.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      const msgs = Object.values(errs);
      setError(msgs.length === 1 ? msgs[0] : `Faltan ${msgs.length} campos por completar.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    if (!validar()) return;
    setEnviando(true);
    try {
      const fechaHora = `${fecha.format('YYYY-MM-DD')}T${form.horario}`;
      await api.post('/public/reservas', {
        nombre_solicitante: form.nombres,
        apellidos_solicitante: form.apellidos,
        dni_solicitante: form.dni,
        email_solicitante: form.email,
        telefono_solicitante: form.telefono || undefined,
        direccion_solicitante: form.direccion || undefined,
        fecha_nacimiento_solicitante: form.fechaNacimiento?.format('YYYY-MM-DD') || undefined,
        genero_solicitante: form.genero || undefined,
        especialidad_id: form.especialidadId,
        medico_id: form.medicoId,
        fecha_hora_deseada: fechaHora,
        motivo_consulta: form.descripcion || undefined,
        acepta_terminos: form.aceptaTerminos,
      });
      setExito(true);
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : 'Error al enviar la solicitud. Intente de nuevo.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <>
        <Box sx={{ position: 'fixed', inset: 0,
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 30%, #90CAF9 60%, #64B5F6 100%)',
          '&::before': { content: '""', position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(21, 101, 192, 0.06) 1px, transparent 0)`,
            backgroundSize: '40px 40px', pointerEvents: 'none',
          }, zIndex: 0,
        }} />
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', position: 'relative', zIndex: 1, p: 2,
        }}>
          <Box sx={{
            borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper',
            boxShadow: '0 4px 24px rgba(21, 101, 192, 0.10)',
            maxWidth: 480, width: '100%', textAlign: 'center',
          }}>
            <Box sx={{
              textAlign: 'center', p: 3.5,
              borderBottom: '1px solid', borderColor: 'grey.200',
            }}>
              <ClinixLogo size={56} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: '#1565C0', mt: 0.5 }}>
                SOLICITUD CITA MÉDICA ONLINE
              </Typography>
            </Box>
            <Box sx={{ p: 4 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%',
                bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', mx: 'auto', mb: 2,
              }}>
                <Box sx={{ fontSize: 36, color: '#22C55E' }}>&#10003;</Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1565C0' }} gutterBottom>
                ¡Solicitud Enviada!
              </Typography>
              <Typography variant="body1" sx={{ color: '#546E7A', mb: 4, lineHeight: 1.6 }}>
                Su solicitud de cita ha sido registrada.<br />
                Recibirá una respuesta en su correo electrónico.
              </Typography>
              <Button variant="contained" size="large"
                onClick={() => navigate('/')}
                sx={{
                  px: 6, py: 1.5, fontWeight: 700, letterSpacing: 1,
                  bgcolor: '#1565C0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#0D47A1',
                    boxShadow: '0 4px 20px rgba(21, 101, 192, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                }}>
                Volver al inicio
              </Button>
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box sx={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 30%, #90CAF9 60%, #64B5F6 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(21, 101, 192, 0.06) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        },
        zIndex: 0,
      }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ maxWidth: 960, mx: 'auto', px: 2, py: 4, position: 'relative', zIndex: 1 }}>

        <Button
          onClick={() => navigate('/')}
          sx={{
            mb: 1.5,
            color: '#1565C0',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          ← Volver al inicio
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Box sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 24px rgba(21, 101, 192, 0.10)',
        }}>
          <Box sx={{
            textAlign: 'center',
            p: 3.5,
            bgcolor: '#E3F2FD',
            borderBottom: '1px solid',
            borderColor: '#BBDEFB',
          }}>
            <ClinixLogo size={56} />
            <Typography variant="body2" sx={{ color: '#78909C', mt: 0.5, letterSpacing: 1, fontWeight: 400 }}>
              TU SALUD, NUESTRA PRIORIDAD
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: '#1565C0', mt: 0.5 }}>
              SOLICITUD CITA MÉDICA ONLINE
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid key="datos-personales" size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0', mb: 2, pb: 1, borderBottom: '2px solid', borderColor: '#1565C0' }}>
                  Datos personales
                </Typography>

                <TextField label="Nombres *" fullWidth sx={{ mb: 2 }}
                  value={form.nombres} onChange={e => { set('nombres', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.nombres; return n; }); }}
                  error={!!fieldErrors.nombres} helperText={fieldErrors.nombres} />

                <TextField label="Apellidos *" fullWidth sx={{ mb: 2 }}
                  value={form.apellidos} onChange={e => { set('apellidos', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.apellidos; return n; }); }}
                  error={!!fieldErrors.apellidos} helperText={fieldErrors.apellidos} />

                <TextField label="DNI *" fullWidth sx={{ mb: 2 }}
                  value={form.dni} onChange={e => { set('dni', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.dni; return n; }); }}
                  error={!!fieldErrors.dni} helperText={fieldErrors.dni}
                  slotProps={{ htmlInput: { maxLength: 20 } }} />

                <TextField label="Dirección *" fullWidth sx={{ mb: 2 }}
                  value={form.direccion} onChange={e => { set('direccion', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.direccion; return n; }); }}
                  error={!!fieldErrors.direccion} helperText={fieldErrors.direccion} />

                <TextField label="Correo electrónico *" type="email" fullWidth sx={{ mb: 2 }}
                  value={form.email} onChange={e => { set('email', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.email; return n; }); }}
                  error={!!fieldErrors.email} helperText={fieldErrors.email} />

                <TextField label="Teléfono *" fullWidth sx={{ mb: 2 }}
                  value={form.telefono} onChange={e => { set('telefono', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.telefono; return n; }); }}
                  error={!!fieldErrors.telefono} helperText={fieldErrors.telefono} />

                <DatePicker label="Fecha de nacimiento *"
                  value={form.fechaNacimiento}
                  onChange={v => { set('fechaNacimiento', v); setFieldErrors(p => { const n = { ...p }; delete n.fechaNacimiento; return n; }); }}
                  disableFuture
                  slotProps={{ textField: { error: !!fieldErrors.fechaNacimiento, helperText: fieldErrors.fechaNacimiento } }}
                  sx={{ mb: 2, width: '100%' }} />

                <FormControl fullWidth>
                  <InputLabel>Género</InputLabel>
                  <Select value={form.genero} label="Género"
                    onChange={e => set('genero', e.target.value as FormState['genero'])}>
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {GENEROS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid key="detalles-cita" size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0', mb: 2, pb: 1, borderBottom: '2px solid', borderColor: '#1565C0' }}>
                  Detalles de la cita
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}
                  error={!!fieldErrors.especialidadId}>
                  <InputLabel>Especialidad *</InputLabel>
                  <Select value={form.especialidadId} label="Especialidad *"
                    onChange={e => { set('especialidadId', Number(e.target.value)); setFieldErrors(p => { const n = { ...p }; delete n.especialidadId; return n; }); }}>
                    <MenuItem value=""><em>Seleccione especialidad...</em></MenuItem>
                    {loader.especialidades.map(esp => (
                      <MenuItem key={esp.especialidad_id} value={esp.especialidad_id}>
                        {esp.nombre_especialidad}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.especialidadId && <FormHelperText>{fieldErrors.especialidadId}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}
                  disabled={!form.especialidadId || loader.cargandoMedicos}
                  error={!!fieldErrors.medicoId}>
                  <InputLabel>Doctor *</InputLabel>
                  <Select value={form.medicoId} label="Doctor *"
                    onChange={e => { set('medicoId', Number(e.target.value)); setFieldErrors(p => { const n = { ...p }; delete n.medicoId; return n; }); }}>
                    <MenuItem value=""><em>Seleccione doctor...</em></MenuItem>
                    {loader.cargandoMedicos ? (
                      <MenuItem disabled>Cargando médicos...</MenuItem>
                    ) : loader.medicos.map(m => (
                      <MenuItem key={m.medico_id} value={m.medico_id}>
                        {m.nombre} {m.apellido} — {m.especialidad}
                      </MenuItem>
                    ))}
                  </Select>
                  {loader.cargandoMedicos && <CircularProgress size={16} sx={{ mt: 0.5 }} />}
                  {fieldErrors.medicoId && <FormHelperText>{fieldErrors.medicoId}</FormHelperText>}
                </FormControl>

                <TextField label="Breve descripción" fullWidth multiline rows={6} sx={{ mb: 2 }}
                  value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                  placeholder="Describa brevemente el motivo de su consulta..." />

                <DatePicker label="Fecha de la cita"
                  value={fecha}
                  onChange={v => { setFecha(v ?? dayjs()); set('horario', ''); }}
                  disablePast
                  sx={{ mb: 1, width: '100%' }} />

                {mensajeSlots && (
                  <Alert severity="info" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                    {mensajeSlots}
                  </Alert>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}
                  disabled={!form.medicoId || loader.cargandoSlots}
                  error={!!fieldErrors.horario}>
                  <InputLabel>Horarios disponibles *</InputLabel>
                  <Select value={form.horario} label="Horarios disponibles *"
                    onChange={e => { set('horario', e.target.value); setFieldErrors(p => { const n = { ...p }; delete n.horario; return n; }); }}>
                    <MenuItem value=""><em>Seleccione un horario...</em></MenuItem>
                    {loader.cargandoSlots ? (
                      <MenuItem disabled>Cargando horarios...</MenuItem>
                    ) : loader.slots.filter(s => s.disponible).map(s => (
                      <MenuItem key={s.hora_inicio}
                        value={s.hora_inicio}>
                        {s.hora_inicio.slice(0, 5)} - {s.hora_fin.slice(0, 5)}
                      </MenuItem>
                    ))}
                  </Select>
                  {loader.cargandoSlots && <CircularProgress size={16} sx={{ mt: 0.5 }} />}
                  {fieldErrors.horario && <FormHelperText>{fieldErrors.horario}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{
              borderTop: '1px solid',
              borderColor: 'grey.200',
              mt: 3,
              pt: 3,
              textAlign: 'center',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Checkbox checked={form.aceptaTerminos}
                  onChange={e => { set('aceptaTerminos', e.target.checked); setFieldErrors(p => { const n = { ...p }; delete n.aceptaTerminos; return n; }); }} />
                <Typography variant="body2" sx={{ cursor: 'pointer', color: '#1565C0', fontWeight: 500 }}
                  onClick={() => setTerminosAbierto(true)}>
                  Ver términos de servicio y política de privacidad *
                </Typography>
              </Box>
              {fieldErrors.aceptaTerminos && <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                {fieldErrors.aceptaTerminos}
              </Typography>}
              <Button variant="contained" size="large"
                onClick={handleSubmit} disabled={enviando}
                sx={{
                  px: 6, py: 1.5, fontWeight: 700, letterSpacing: 0.5,
                  bgcolor: '#1565C0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#0D47A1',
                    boxShadow: '0 4px 20px rgba(21, 101, 192, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                }}>
                {enviando ? 'Enviando...' : 'ENVIAR SOLICITUD DE CITA'}
              </Button>
            </Box>

            <Dialog open={terminosAbierto} onClose={() => setTerminosAbierto(false)}
              maxWidth="sm" fullWidth
              slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
              <DialogTitle sx={{ fontWeight: 700, color: '#1565C0' }}>
                Términos de Servicio y Política de Privacidad
              </DialogTitle>
              <DialogContent dividers>
                <DialogContentText component="div" sx={{ color: 'text.primary', '& p': { mb: 2 } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    1. Aceptación de los Términos
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Al utilizar el sistema de solicitud de citas médicas de CLINIX, usted declara haber
                    leído, entendido y aceptado los presentes términos y condiciones. Si no está de acuerdo,
                    no utilice este servicio.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    2. Uso del Servicio
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    La solicitud de cita médica a través del portal público constituye una reserva preliminar.
                    La cita será confirmada por el personal administrativo de la clínica dentro de las 24 horas
                    hábiles siguientes a la solicitud. CLINIX se reserva el derecho de reprogramar o cancelar
                    citas por motivos de fuerza mayor.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    3. Responsabilidad del Usuario
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    El usuario se compromete a proporcionar información veraz y actualizada. CLINIX no se
                    responsabiliza por citas perdidas debido a datos de contacto incorrectos. El usuario debe
                    notificar cualquier cambio con al menos 24 horas de anticipación.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    4. Protección de Datos Personales
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Los datos personales proporcionados serán tratados conforme a la Ley de Protección de
                    Datos Personales. CLINIX garantiza la confidencialidad de su información médica y
                    personal. Sus datos serán utilizados exclusivamente para fines de atención médica,
                    facturación y comunicación relacionada con su atención.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    5. Derechos del Titular
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus
                    datos personales. Para ejercer estos derechos, contacte a nuestra oficina de protección
                    de datos en privacidad@clinix.com.
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    6. Consentimiento
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Al hacer clic en "Aceptar", usted otorga su consentimiento expreso para el tratamiento
                    de sus datos personales y datos sensibles (información de salud) para los fines descritos
                    en esta política. Este consentimiento podrá ser revocado en cualquier momento mediante
                    comunicación escrita.
                  </Typography>
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => setTerminosAbierto(false)}
                  sx={{ borderRadius: 2 }}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={() => {
                  set('aceptaTerminos', true);
                  setTerminosAbierto(false);
                }}
                  sx={{ borderRadius: 2 }}>
                  Aceptar Términos
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
        </Box>
    </LocalizationProvider>
    </>
  );
}
