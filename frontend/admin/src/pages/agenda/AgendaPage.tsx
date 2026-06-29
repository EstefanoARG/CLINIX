import { useEffect, useState } from 'react';
import {
  Autocomplete, Box, Typography, Paper, IconButton, Button, Avatar, Chip, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid, Tooltip,
} from '@mui/material';
import {
  ChevronLeft, ChevronRight, Search, Plus, Printer, Save, Trash2, Stethoscope,
  HeartPulse, Activity, ClipboardList, FileText, Pill, Thermometer, Weight, Clock, X,
  History, Command,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import type { AgendaResponse, AgendaCitaItem, HistoriaClinica } from '../../types';
import PatientHistoryPanel from './components/PatientHistoryPanel';
import CommandPalette from './components/CommandPalette';
import PatientTimeline from './components/PatientTimeline';
import { printPrescription } from './components/printPrescription';

interface PatientSlot {
  id: number;
  paciente_id: number;
  time: string;
  name: string;
  age: number | null;
  reason: string;
  status: 'pendiente' | 'atendido' | 'cancelado' | 'libre';
  dni: string;
  hc: string;
  citaId?: number;
  tiene_historia: boolean;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pendiente: { bg: '#E6F1FB', color: '#0C447C', label: 'Pendiente' },
  atendido: { bg: '#EAF3DE', color: '#27500A', label: 'Atendido' },
  cancelado: { bg: '#FCEBEB', color: '#791F1F', label: 'Cancelado' },
};

export default function AgendaPage() {
  const { user } = useAuth();
  const [fecha, setFecha] = useState(new Date());
  const [agenda, setAgenda] = useState<AgendaResponse | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [motivo, setMotivo] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [enfermedad, setEnfermedad] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [proximaCita, setProximaCita] = useState('');
  const [derivacion, setDerivacion] = useState('');
  const [cieRows, setCieRows] = useState<{ code: string; desc: string }[]>([{ code: '', desc: '' }]);
  const [vitales, setVitales] = useState({ presion: '120/80', fc: '72', temp: '36.5', peso: '70' });
  const [cie10Options, setCie10Options] = useState<{ codigo: string; descripcion: string; categoria: string | null; especialidad_nombre: string | null }[]>([]);
  const [especialidadId, setEspecialidadId] = useState<number | null>(null);
  const [cieSearchTerm, setCieSearchTerm] = useState('');
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pacienteHistorias, setPacienteHistorias] = useState<HistoriaClinica[]>([]);

  const toggleHistoryPanel = () => setHistoryPanelOpen((v) => !v);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fechaStr = fecha.toISOString().slice(0, 10);
  const fechaDisplay = `${DAYS[fecha.getDay()]}, ${fecha.getDate()} de ${MONTHS[fecha.getMonth()]}`;

  const pacientes: PatientSlot[] = (agenda?.citas || []).map((c: AgendaCitaItem) => ({
    id: c.cita_id,
    paciente_id: c.paciente_id,
    time: new Date(c.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    name: c.paciente_nombre,
    age: null,
    reason: c.motivo_consulta || '',
    status: c.estado_cita === 'Completada' ? 'atendido' as const : c.estado_cita === 'Cancelada' ? 'cancelado' as const : 'pendiente' as const,
    dni: c.paciente_dni,
    hc: `HC-${c.paciente_id.toString().padStart(4, '0')}`,
    citaId: c.cita_id,
    tiene_historia: c.tiene_historia,
  }));

  const huecosLibres = () => {
    const slots: PatientSlot[] = [];
    if (agenda?.citas) {
      for (let h = 8; h <= 17; h++) {
        const horaStr = `${h.toString().padStart(2, '0')}:00`;
        const ocupado = agenda.citas.some((c) => {
          const ch = new Date(c.fecha_hora).getHours();
          return ch === h;
        });
        if (!ocupado) {
          slots.push({
            id: -(slots.length + 1),
            paciente_id: 0,
            time: horaStr,
            name: '', age: null, reason: '', status: 'libre', dni: '', hc: '', tiene_historia: false,
          });
        }
      }
    }
    return slots;
  };

  const allSlots = [...pacientes, ...huecosLibres()].sort((a, b) => a.time.localeCompare(b.time));

  const filteredSlots = search
    ? allSlots.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.dni.includes(search))
    : allSlots;

  const loadAgenda = () => {
    api.get<AgendaResponse>(`/agenda/${user?.medico_id || 1}?fecha=${fechaStr}`)
      .then(({ data }) => setAgenda(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadAgenda();
  }, [fechaStr]);

  useEffect(() => {
    if (!user?.medico_id) return;
    api.get(`/medicos/${user.medico_id}`).then(({ data }) => {
      setEspecialidadId(data.especialidad_id);
    });
  }, [user?.medico_id]);

  useEffect(() => {
    if (!especialidadId) return;
    api.get(`/cie10?especialidad_id=${especialidadId}`).then(({ data }) => {
      setCie10Options(data.items || []);
    });
  }, [especialidadId]);

  const addDaysFn = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const selectPatient = async (id: number) => {
    const p = pacientes.find((x) => x.id === id);
    if (!p) return;
    setActiveId(id);
    setMotivo(p.reason);
    setTiempo('');
    setEnfermedad('');
    setAntecedentes('');
    setTratamiento('');
    setObservaciones('');
    setProximaCita('');
    setDerivacion('');
    setCieRows([{ code: '', desc: '' }]);

    try {
      const { data } = await api.get<HistoriaClinica[]>(`/pacientes/${p.paciente_id}/historias`);
      setPacienteHistorias(data);
      if (p.tiene_historia && p.citaId) {
        const hc = data.find((h) => h.cita_id === p.citaId);
        if (hc) {
          setMotivo('');
          setEnfermedad(hc.anamnesis || '');
          if (hc.diagnostico) {
            const parts = hc.diagnostico.split('; ').map((d) => {
              const m = d.match(/^(\S+) - (.+)$/);
              return m ? { code: m[1], desc: m[2] } : { code: '', desc: d };
            });
            setCieRows(parts.length ? parts : [{ code: '', desc: '' }]);
          }
          setTratamiento(hc.tratamiento || '');
          setObservaciones(hc.prescripcion || '');
        }
      }
    } catch {
      setPacienteHistorias([]);
    }
  };

  const saveFicha = async () => {
    if (!activeId) return;
    const p = pacientes.find((x) => x.id === activeId);
    if (!p) return;

    const diagnosticoCompleto = cieRows
      .filter((r) => r.code || r.desc)
      .map((r) => `${r.code} - ${r.desc}`)
      .join('; ');

    try {
      await api.post(`/pacientes/${p.paciente_id}/historias`, {
        medico_id: 0,
        cita_id: p.citaId,
        anamnesis: `Motivo: ${motivo}\nTiempo: ${tiempo}\nEnfermedad actual: ${enfermedad}\nAntecedentes: ${antecedentes}`,
        diagnostico: diagnosticoCompleto || 'No especificado',
        tratamiento,
        prescripcion: observaciones,
        observaciones: `Próxima cita: ${proximaCita}\nDerivación: ${derivacion}`,
      });

      if (p.citaId) {
        await api.put(`/citas/${p.citaId}`, { estado_cita: 'Completada' });
      }

      loadAgenda();
    } catch {}
  };

  const activePatient = activeId ? pacientes.find((p) => p.id === activeId) : null;
  const esSoloLectura = activePatient?.status === 'atendido' || activePatient?.status === 'cancelado';

  return (
    <Paper
      sx={{
        display: 'grid',
        gridTemplateColumns: historyPanelOpen && activePatient ? '320px 1fr 380px' : '320px 1fr',
        minHeight: 'calc(100vh - 120px)',
        border: '1px solid #E5E7EB',
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'gridTemplateColumns 0.3s ease',
      }}
    >
      {/* Sidebar */}
      <Box sx={{ bgcolor: '#FFFFFF', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <IconButton
              size="small"
              onClick={() => setFecha((d) => addDaysFn(d, -1))}
              sx={{ bgcolor: '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}
            >
              <ChevronLeft size={18} color="#2563EB" />
            </IconButton>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize', color: '#0F4C81', fontSize: 13 }}>
                {fechaDisplay}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Dr. {agenda?.medico_nombre || 'Seleccionar'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setFecha((d) => addDaysFn(d, 1))}
              sx={{ bgcolor: '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}
            >
              <ChevronRight size={18} color="#2563EB" />
            </IconButton>
          </Box>
          <TextField
            size="small"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5, color: '#9CA3AF' }}>
                    <Search size={16} />
                  </Box>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8FAFC',
                fontSize: 13,
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB', borderWidth: '1px' },
                '&:hover fieldset': { borderColor: '#2563EB' },
                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
              },
            }}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, pt: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 2 } }}>
          {filteredSlots.map((slot) => {
            if (slot.status === 'libre') {
              return (
                <Box
                  key={slot.id}
                  sx={{
                    display: 'flex', gap: 1.5, px: 1.5, py: 1.2, borderRadius: 2,
                    mb: 0.75, border: '1.5px dashed #E5E7EB', opacity: 0.65,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.85 },
                  }}
                >
                  <Box sx={{
                    bgcolor: '#F8FAFC', borderRadius: 1, px: 1, py: 0.4,
                    fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                    color: '#9CA3AF', minWidth: 44, textAlign: 'center',
                  }}>
                    {slot.time}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Plus size={12} color="#9CA3AF" />
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 12 }}>
                      Disponible
                    </Typography>
                  </Box>
                </Box>
              );
            }

            const badge = STATUS_BADGE[slot.status];
            const isDimmed = slot.status === 'atendido' || slot.status === 'cancelado';
            return (
              <Box
                key={slot.id}
                onClick={() => selectPatient(slot.id)}
                sx={{
                  display: 'flex', gap: 1.5, p: 1.5, borderRadius: 2, mb: 0.75,
                  cursor: isDimmed ? 'default' : 'pointer',
                  opacity: isDimmed ? 0.55 : 1,
                  bgcolor: activeId === slot.id ? '#EFF6FF' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: activeId === slot.id ? '#2563EB' : '#E5E7EB',
                  borderLeft: activeId === slot.id ? '3px solid #2563EB' : '3px solid transparent',
                  boxShadow: activeId === slot.id ? '0 1px 4px rgba(37,99,235,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  '&:hover': isDimmed ? {} : {
                    borderColor: '#2563EB',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.1)',
                  },
                }}
              >
                <Box sx={{
                  bgcolor: '#DBEAFE', borderRadius: 1, px: 1, py: 0.4,
                  fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  color: '#2563EB', minWidth: 44, textAlign: 'center', height: 'fit-content',
                }}>
                  {slot.time}
                </Box>
                <Avatar sx={{
                  width: 36, height: 36, bgcolor: '#DBEAFE', color: '#2563EB',
                  fontSize: 12, fontWeight: 600, mt: 0.2,
                }}>
                  {slot.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3, color: '#111827', fontSize: 13 }}>
                    {slot.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.2, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>
                    {slot.reason}
                  </Typography>
                  <Chip
                    label={badge.label}
                    size="small"
                    sx={{
                      mt: 0.5, height: 20, fontSize: 10,
                      bgcolor: badge.bg, color: badge.color,
                      fontWeight: 500,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ p: 1.5, borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            onClick={() => setPaletteOpen(true)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
              py: 0.6, borderRadius: 1.5, cursor: 'pointer',
              color: '#9CA3AF', fontSize: 11, fontWeight: 500,
              bgcolor: '#F8FAFC', border: '1px solid #E5E7EB',
              '&:hover': { bgcolor: '#F1F5F9', color: '#6B7280' },
            }}
          >
            <Command size={12} />
            Buscar paciente (Ctrl+K)
          </Box>
          <Button
            fullWidth
            startIcon={<Plus size={16} />}
            sx={{
              py: 1, borderRadius: 2, fontSize: 13, textTransform: 'none',
              color: '#2563EB', border: '1.5px dashed #2563EB',
              bgcolor: '#F8FAFC',
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#1D4ED8' },
            }}
          >
            Nuevo turno
          </Button>
        </Box>
      </Box>

      {/* Main Panel */}
      <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
        {!activePatient ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          >
            <Box sx={{ color: '#E5E7EB' }}>
              <Stethoscope size={56} strokeWidth={1.5} />
            </Box>
            <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: 14 }}>
              Selecciona un paciente para redactar su ficha
            </Typography>
          </motion.div>
        ) : (
          <>
            {/* Sticky Header */}
            <Box sx={{
              px: 3, py: 2, borderBottom: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: '4px solid #2563EB', bgcolor: '#FFFFFF',
              position: 'sticky', top: 0, zIndex: 10,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600, fontSize: 16 }}>
                  {activePatient.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F4C81', fontSize: 15 }}>
                      {activePatient.name}
                    </Typography>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      bgcolor: esSoloLectura ? '#F3F4F6' : '#D1FAE5',
                      borderRadius: 1, px: 1, py: 0.3,
                    }}>
                      <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: esSoloLectura ? '#9CA3AF' : '#10B981',
                      }} />
                      <Typography variant="caption" sx={{
                        color: esSoloLectura ? '#6B7280' : '#065F46',
                        fontWeight: 500, fontSize: 11,
                      }}>
                        {esSoloLectura ? 'Solo lectura' : 'Consulta en curso'}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 12 }}>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                      <Clock size={12} style={{ verticalAlign: 'middle' }} />
                      {activePatient.time}
                    </Box>
                    {' · '}{activePatient.dni} · {activePatient.hc}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Historial del paciente (H)">
                  <IconButton
                    size="small"
                    onClick={toggleHistoryPanel}
                    sx={{
                      bgcolor: historyPanelOpen ? '#EFF6FF' : 'transparent',
                      color: historyPanelOpen ? '#2563EB' : '#6B7280',
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    <History size={18} />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Printer size={14} />}
                  onClick={() => {
                    if (!activePatient) return;
                    const p = activePatient;
                    printPrescription({
                      patientName: p.name,
                      patientDNI: p.dni,
                      patientAge: p.age,
                      doctorName: agenda?.medico_nombre || '',
                      doctorSpecialty: '',
                      date: new Date().toLocaleDateString('es-PE'),
                      diagnosis: cieRows.filter((r) => r.code).map((r) => `${r.code} - ${r.desc}`).join('; '),
                      medications: tratamiento,
                      observations: observaciones,
                      nextAppointment: proximaCita,
                    });
                  }}
                  sx={{
                    fontSize: 12, textTransform: 'none', borderRadius: 1.5,
                    borderColor: '#E5E7EB', color: '#374151',
                    '&:hover': { borderColor: '#2563EB', bgcolor: '#F8FAFC' },
                  }}
                >
                  Receta
                </Button>
                {!esSoloLectura && (
                  <Button
                    size="small"
                    startIcon={<Save size={14} />}
                    onClick={saveFicha}
                    sx={{
                      fontSize: 12, textTransform: 'none', borderRadius: 1.5,
                      background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                      color: '#fff', px: 2,
                      '&:hover': { background: 'linear-gradient(135deg, #1D4ED8, #0A3A6B)' },
                      boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                    }}
                  >
                    Guardar ficha
                  </Button>
                )}
              </Box>
            </Box>

            {/* Scrollable Form Body */}
            <Box sx={{
              flex: 1, overflowY: 'auto', p: 3,
              display: 'flex', flexDirection: 'column', gap: 3,
              pointerEvents: esSoloLectura ? 'none' : 'auto',
              opacity: esSoloLectura ? 0.8 : 1,
              bgcolor: '#F8FAFC',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 2 },
            }}>
              {/* Signos Vitales */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
              >
                <Box sx={{
                  bgcolor: '#FFFFFF', borderRadius: 2.5, p: 2.5,
                  border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 700, color: '#0F4C81', textTransform: 'uppercase',
                    letterSpacing: 0.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1,
                    fontSize: 11,
                  }}>
                    <HeartPulse size={16} color="#2563EB" /> Signos vitales
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Presión arterial', value: vitales.presion, unit: 'mmHg', key: 'presion', icon: HeartPulse },
                      { label: 'Frec. cardíaca', value: vitales.fc, unit: 'lpm', key: 'fc', icon: Activity },
                      { label: 'Temperatura', value: vitales.temp, unit: '°C', key: 'temp', icon: Thermometer },
                      { label: 'Peso', value: vitales.peso, unit: 'kg', key: 'peso', icon: Weight },
                    ].map((v) => {
                      const Icon = v.icon;
                      return (
                        <Grid key={v.key} size={{ xs: 3 }}>
                          <Box sx={{
                            bgcolor: '#F8FAFC', border: '1px solid #E5E7EB',
                            borderRadius: 2, p: 2, textAlign: 'center',
                            transition: 'border-color 0.2s',
                            '&:hover': { borderColor: '#2563EB' },
                          }}>
                            <Icon size={18} color="#2563EB" style={{ marginBottom: 6 }} />
                            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 10, mb: 0.75, display: 'block', fontWeight: 500 }}>
                              {v.label}
                            </Typography>
                            <TextField
                              size="small"
                              value={v.value}
                              onChange={(e) => setVitales({ ...vitales, [v.key]: e.target.value })}
                              slotProps={{
                                htmlInput: {
                                  sx: { fontSize: 18, fontWeight: 600, textAlign: 'center', p: 0, color: '#0F4C81' },
                                },
                              }}
                              variant="standard"
                              sx={{
                                '& .MuiInput-root:before': { border: 'none' },
                                '& .MuiInput-root:after': { border: 'none' },
                                '& .MuiInput-root:hover:before': { border: 'none' },
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: 10, mt: 0.5, display: 'block' }}>
                              {v.unit}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </motion.div>

              {/* Anamnesis */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
              >
                <Box sx={{
                  bgcolor: '#FFFFFF', borderRadius: 2.5, p: 2.5,
                  border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 700, color: '#0F4C81', textTransform: 'uppercase',
                    letterSpacing: 0.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1,
                    fontSize: 11,
                  }}>
                    <ClipboardList size={16} color="#2563EB" /> Anamnesis
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField label="Motivo de consulta" size="small" fullWidth value={motivo}
                        onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Dolor de cabeza persistente"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField label="Tiempo de enfermedad" size="small" fullWidth value={tiempo}
                        onChange={(e) => setTiempo(e.target.value)} placeholder="Ej: 3 días"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField label="Enfermedad actual" multiline rows={3} size="small" fullWidth value={enfermedad}
                        onChange={(e) => setEnfermedad(e.target.value)}
                        placeholder="Relato cronológico, inicio, curso y síntomas asociados..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField label="Antecedentes relevantes" multiline rows={2} size="small" fullWidth value={antecedentes}
                        onChange={(e) => setAntecedentes(e.target.value)}
                        placeholder="Antecedentes personales, familiares, alergias, medicación habitual..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>

              {/* Diagnóstico CIE-10 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.16 }}
              >
                <Box sx={{
                  bgcolor: '#FFFFFF', borderRadius: 2.5, p: 2.5,
                  border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 700, color: '#0F4C81', textTransform: 'uppercase',
                    letterSpacing: 0.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1,
                    fontSize: 11,
                  }}>
                    <FileText size={16} color="#2563EB" /> Diagnóstico CIE-10
                  </Typography>
                  {cieRows.map((row, i) => {
                    const selected = cie10Options.find(o => o.codigo === row.code);
                    return (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.5 }}>
                        <Autocomplete
                          size="small"
                          options={cie10Options}
                          getOptionLabel={(o) => `${o.codigo} - ${o.descripcion}`}
                          value={selected || null}
                          inputValue={i === cieRows.length - 1 ? cieSearchTerm : (selected ? `${selected.codigo} - ${selected.descripcion}` : '')}
                          onInputChange={(_, v) => {
                            if (i === cieRows.length - 1) setCieSearchTerm(v);
                          }}
                          onChange={(_, v) => {
                            const next = [...cieRows];
                            if (v) {
                              next[i].code = v.codigo;
                              next[i].desc = v.descripcion;
                            } else {
                              next[i].code = '';
                              next[i].desc = '';
                            }
                            setCieRows(next);
                          }}
                          renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {option.codigo} — {option.descripcion}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.categoria} {option.especialidad_nombre ? `· ${option.especialidad_nombre}` : ''}
                              </Typography>
                            </Box>
                          )}
                          renderInput={(params) => (
                            <TextField {...params} label="Buscar código o diagnóstico" placeholder="Escriba para buscar..."
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                          )}
                          sx={{ flex: 1 }}
                        />
                        {cieRows.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => setCieRows(cieRows.filter((_, j) => j !== i))}
                            sx={{ mt: 0.5, color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                          >
                            <X size={16} />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })}
                  <Button
                    size="small"
                    startIcon={<Plus size={14} />}
                    onClick={() => setCieRows([...cieRows, { code: '', desc: '' }])}
                    sx={{
                      fontSize: 12, color: '#2563EB', textTransform: 'none', mt: 0.5,
                      fontWeight: 500, '&:hover': { bgcolor: '#EFF6FF' },
                    }}
                  >
                    Agregar diagnóstico
                  </Button>
                </Box>
              </motion.div>

              {/* Plan de Tratamiento */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.24 }}
              >
                <Box sx={{
                  bgcolor: '#FFFFFF', borderRadius: 2.5, p: 2.5,
                  border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <Typography variant="caption" sx={{
                    fontWeight: 700, color: '#0F4C81', textTransform: 'uppercase',
                    letterSpacing: 0.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1,
                    fontSize: 11,
                  }}>
                    <Pill size={16} color="#2563EB" /> Plan de tratamiento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField label="Indicaciones y medicación" multiline rows={4} size="small" fullWidth value={tratamiento}
                        onChange={(e) => setTratamiento(e.target.value)}
                        placeholder="Medicamentos, dosis, frecuencia, vía de administración y duración..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField label="Próxima cita" type="date" size="small" fullWidth value={proximaCita}
                        onChange={(e) => setProximaCita(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel sx={{ '&.Mui-focused': { color: '#2563EB' } }}>Derivación / interconsulta</InputLabel>
                        <Select value={derivacion} label="Derivación / interconsulta" onChange={(e) => setDerivacion(e.target.value)}
                          sx={{ borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' } }}>
                          <MenuItem value="">— Ninguna —</MenuItem>
                          <MenuItem value="Cardiología">Cardiología</MenuItem>
                          <MenuItem value="Neurología">Neurología</MenuItem>
                          <MenuItem value="Traumatología">Traumatología</MenuItem>
                          <MenuItem value="Gastroenterología">Gastroenterología</MenuItem>
                          <MenuItem value="Endocrinología">Endocrinología</MenuItem>
                          <MenuItem value="Psiquiatría">Psiquiatría</MenuItem>
                          <MenuItem value="Otro">Otro especialista</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField label="Observaciones adicionales" multiline rows={2} size="small" fullWidth value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Indicaciones de reposo, dieta, exámenes de laboratorio solicitados..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F8FAFC', '&.Mui-focused fieldset': { borderColor: '#2563EB' } } }} />
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>

              {/* Patient Timeline */}
              {pacienteHistorias.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.32 }}
                >
                  <Box sx={{
                    bgcolor: '#FFFFFF', borderRadius: 2.5, p: 2.5,
                    border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    <PatientTimeline
                      historias={pacienteHistorias}
                      pacienteNombre={activePatient?.name || ''}
                    />
                  </Box>
                </motion.div>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{
              px: 3, py: 1.5, borderTop: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: '#FFFFFF',
            }}>
              {esSoloLectura ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, fontSize: 12 }}>
                    Paciente atendido — solo lectura
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 12 }}>
                      Consulta en curso
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<Trash2 size={14} />}
                      onClick={() => {
                        setMotivo(''); setTiempo(''); setEnfermedad(''); setAntecedentes('');
                        setTratamiento(''); setObservaciones(''); setProximaCita(''); setDerivacion('');
                        setCieRows([{ code: '', desc: '' }]);
                      }}
                      sx={{
                        fontSize: 12, textTransform: 'none', borderRadius: 1.5,
                        borderColor: '#E5E7EB', color: '#374151',
                        '&:hover': { borderColor: '#EF4444', color: '#EF4444', bgcolor: '#FEF2F2' },
                      }}>
                      Limpiar
                    </Button>
                    <Button size="small" startIcon={<Save size={14} />}
                      onClick={saveFicha}
                      sx={{
                        fontSize: 12, textTransform: 'none', borderRadius: 1.5, px: 2,
                        background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                        color: '#fff',
                        '&:hover': { background: 'linear-gradient(135deg, #1D4ED8, #0A3A6B)' },
                        boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                      }}>
                      Guardar y marcar atendido
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Patient History Panel */}
      {activePatient && (
        <PatientHistoryPanel
          open={historyPanelOpen}
          onClose={() => setHistoryPanelOpen(false)}
          pacienteId={activePatient.paciente_id}
          historias={pacienteHistorias}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectPatient={(slotId) => selectPatient(slotId)}
        pacientes={pacientes}
      />
    </Paper>
  );
}
