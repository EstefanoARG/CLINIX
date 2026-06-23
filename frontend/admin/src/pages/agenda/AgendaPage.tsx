import { useEffect, useState } from 'react';
import {
  Autocomplete, Box, Typography, Paper, IconButton, Button, Avatar, Chip, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid,
} from '@mui/material';
import {
  ChevronLeft, ChevronRight, Search, Add, Print, Save,
  Delete, MedicalServices, Favorite, Article, Assignment, Medication,
} from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import type { AgendaResponse, AgendaCitaItem, HistoriaClinica } from '../../types';

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

    if (p.tiene_historia && p.citaId) {
      try {
        const { data } = await api.get<HistoriaClinica[]>(`/pacientes/${p.paciente_id}/historias`);
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
      } catch {}
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
        gridTemplateColumns: '300px 1fr',
        minHeight: 'calc(100vh - 120px)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Box sx={{ bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <IconButton size="small" onClick={() => setFecha((d) => addDaysFn(d, -1))}>
              <ChevronLeft fontSize="small" />
            </IconButton>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {fechaDisplay}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dr. {agenda?.medico_nombre || 'Seleccionar'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setFecha((d) => addDaysFn(d, 1))}>
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>
          <TextField
            size="small"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ fontSize: 18, color: 'text.disabled', mr: 0.5 }} />,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                fontSize: 13,
                '& fieldset': { borderWidth: '0.5px' },
              },
            }}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
          {filteredSlots.map((slot) => {
            if (slot.status === 'libre') {
              return (
                <Box
                  key={slot.id}
                  sx={{
                    display: 'flex', gap: 1.5, px: 1.5, py: 1.5, borderRadius: 1,
                    opacity: 0.5, mb: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.disabled" sx={{ minWidth: 40, fontVariantNumeric: 'tabular-nums', pt: 0.3 }}>
                    {slot.time}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    Disponible
                  </Typography>
                </Box>
              );
            }

            const badge = STATUS_BADGE[slot.status];
            return (
              <Box
                key={slot.id}
                onClick={() => selectPatient(slot.id)}
                sx={{
                  display: 'flex', gap: 1.5, px: 1.5, py: 1.2, borderRadius: 1,
                  cursor: slot.status === 'atendido' || slot.status === 'cancelado' ? 'default' : 'pointer',
                  opacity: slot.status === 'atendido' || slot.status === 'cancelado' ? 0.6 : 1,
                  mb: 0.5,
                  bgcolor: activeId === slot.id ? 'background.paper' : 'transparent',
                  border: '0.5px solid',
                  borderColor: activeId === slot.id ? 'divider' : 'transparent',
                  transition: 'background 0.15s',
                  '&:hover': slot.status === 'atendido' || slot.status === 'cancelado' ? {} : { bgcolor: 'background.paper' },
                }}
              >
                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 40, fontVariantNumeric: 'tabular-nums', pt: 0.3 }}>
                  {slot.time}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                    {slot.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
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

        <Box
          sx={{
            m: 1.5, p: 1.5, border: '0.5px dashed', borderColor: 'divider',
            borderRadius: 1, textAlign: 'center', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
            color: 'text.secondary', fontSize: 13,
            '&:hover': { bgcolor: 'background.paper', color: 'text.primary' },
          }}
        >
          <Add sx={{ fontSize: 16 }} />
          Nuevo turno
        </Box>
      </Box>

      {/* Main Panel */}
      <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
        {!activePatient ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.disabled', gap: 1 }}>
            <MedicalServices sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2">Selecciona un paciente para redactar su ficha</Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: '0.5px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#B5D4F4', color: '#0C447C', fontWeight: 500, fontSize: 15 }}>
                  {activePatient.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{activePatient.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activePatient.dni} · {activePatient.hc} · {activePatient.time}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<Print />} sx={{ fontSize: 12 }}>
                  Imprimir
                </Button>
                {!esSoloLectura && (
                  <Button size="small" variant="contained" startIcon={<Save />} onClick={saveFicha} sx={{ fontSize: 12 }}>
                    Guardar ficha
                  </Button>
                )}
              </Box>
            </Box>

            {/* Form Body */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3, pointerEvents: esSoloLectura ? 'none' : 'auto', opacity: esSoloLectura ? 0.85 : 1 }}>
              {/* Signos Vitales */}
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase',
                  letterSpacing: 0.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5,
                }}>
                  <Favorite sx={{ fontSize: 16 }} /> Signos vitales
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Presión arterial', value: vitales.presion, unit: 'mmHg', key: 'presion' },
                    { label: 'Frec. cardíaca', value: vitales.fc, unit: 'lpm', key: 'fc' },
                    { label: 'Temperatura', value: vitales.temp, unit: '°C', key: 'temp' },
                    { label: 'Peso', value: vitales.peso, unit: 'kg', key: 'peso' },
                  ].map((v) => (
                    <Grid key={v.key} size={{ xs: 3 }}>
                      <Box sx={{
                        bgcolor: 'grey.50', border: '0.5px solid', borderColor: 'divider',
                        borderRadius: 1, p: 1.5, textAlign: 'center',
                      }}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, mb: 0.5, display: 'block' }}>
                          {v.label}
                        </Typography>
                        <TextField
                          size="small"
                          value={v.value}
                          onChange={(e) => setVitales({ ...vitales, [v.key]: e.target.value })}
                          slotProps={{
                            htmlInput: {
                              sx: { fontSize: 16, fontWeight: 500, textAlign: 'center', p: 0 },
                            },
                          }}
                          variant="standard"
                          sx={{ '& .MuiInput-root:before': { border: 'none' }, '& .MuiInput-root:after': { border: 'none' } }}
                        />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                          {v.unit}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Anamnesis */}
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase',
                  letterSpacing: 0.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5,
                }}>
                  <Article sx={{ fontSize: 16 }} /> Anamnesis
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Motivo de consulta" size="small" fullWidth value={motivo}
                      onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Dolor de cabeza persistente" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Tiempo de enfermedad" size="small" fullWidth value={tiempo}
                      onChange={(e) => setTiempo(e.target.value)} placeholder="Ej: 3 días" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField label="Enfermedad actual" multiline rows={3} size="small" fullWidth value={enfermedad}
                      onChange={(e) => setEnfermedad(e.target.value)}
                      placeholder="Relato cronológico, inicio, curso y síntomas asociados..." />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField label="Antecedentes relevantes" multiline rows={2} size="small" fullWidth value={antecedentes}
                      onChange={(e) => setAntecedentes(e.target.value)}
                      placeholder="Antecedentes personales, familiares, alergias, medicación habitual..." />
                  </Grid>
                </Grid>
              </Box>

              {/* Diagnóstico CIE-10 */}
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase',
                  letterSpacing: 0.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5,
                }}>
                  <Assignment sx={{ fontSize: 16 }} /> Diagnóstico CIE-10
                </Typography>
                {cieRows.map((row, i) => {
                  const selected = cie10Options.find(o => o.codigo === row.code);
                  return (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
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
                          <TextField {...params} label="Buscar código o diagnóstico" placeholder="Escriba para buscar..." />
                        )}
                        sx={{ flex: 1 }}
                      />
                      {cieRows.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => setCieRows(cieRows.filter((_, j) => j !== i))}
                          sx={{ mt: 0.5, color: 'error.main' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setCieRows([...cieRows, { code: '', desc: '' }])}
                  sx={{ fontSize: 12, color: '#185FA5', textTransform: 'none', mt: 0.5 }}
                >
                  Agregar diagnóstico
                </Button>
              </Box>

              {/* Plan de Tratamiento */}
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase',
                  letterSpacing: 0.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5,
                }}>
                  <Medication sx={{ fontSize: 16 }} /> Plan de tratamiento
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField label="Indicaciones y medicación" multiline rows={4} size="small" fullWidth value={tratamiento}
                      onChange={(e) => setTratamiento(e.target.value)}
                      placeholder="Medicamentos, dosis, frecuencia, vía de administración y duración..." />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Próxima cita" type="date" size="small" fullWidth value={proximaCita}
                      onChange={(e) => setProximaCita(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Derivación / interconsulta</InputLabel>
                      <Select value={derivacion} label="Derivación / interconsulta" onChange={(e) => setDerivacion(e.target.value)}>
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
                      placeholder="Indicaciones de reposo, dieta, exámenes de laboratorio solicitados..." />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{
              px: 3, py: 1.5, borderTop: '0.5px solid', borderColor: 'divider',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}>
              {esSoloLectura ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#97C459' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Paciente atendido — solo lectura</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#97C459' }} />
                    <Typography variant="caption" color="text.secondary">Consulta en curso</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<Delete />}
                      onClick={() => {
                        setMotivo(''); setTiempo(''); setEnfermedad(''); setAntecedentes('');
                        setTratamiento(''); setObservaciones(''); setProximaCita(''); setDerivacion('');
                        setCieRows([{ code: '', desc: '' }]);
                      }}
                      sx={{ fontSize: 12 }}>
                      Limpiar
                    </Button>
                    <Button size="small" variant="contained" startIcon={<Save />}
                      onClick={saveFicha} sx={{ fontSize: 12 }}>
                      Guardar y marcar atendido
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}