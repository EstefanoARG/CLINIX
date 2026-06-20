import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, TextField, Chip, IconButton, Tooltip, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Grid, Autocomplete, Snackbar, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';
import type { Cita, Paciente, Medico, Especialidad, UbicacionFisica, DisponibilidadResponse } from '../../types';
import DetalleCitaModal from '../../components/ui/DetalleCitaModal';
import EditarCitaModal from '../../components/ui/EditarCitaModal';

const ESTADOS_CITA = ['Programada', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió'];

function estadoChip(estado: string) {
  const map: Record<string, { bg: string; color: string }> = {
    Programada: { bg: '#E3F2FD', color: '#1565C0' },
    Confirmada: { bg: '#E8F5E9', color: '#2E7D32' },
    'En curso': { bg: '#FFF3E0', color: '#E65100' },
    Completada: { bg: '#F3E5F5', color: '#7B1FA2' },
    Cancelada: { bg: '#FFEBEE', color: '#C62828' },
    'No asistió': { bg: '#FCE4EC', color: '#AD1457' },
  };
  const s = map[estado] ?? { bg: '#F5F5F5', color: '#616161' };
  return <Chip label={estado} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }} />;
}

export default function AdmisionCitas() {
  // --- Form state ---
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelected, setPacienteSelected] = useState<Paciente | null>(null);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [especialidadId, setEspecialidadId] = useState(0);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicoId, setMedicoId] = useState(0);
  const [fechaCita, setFechaCita] = useState('');
  const [slots, setSlots] = useState<DisponibilidadResponse['slots']>([]);
  const [slotSelected, setSlotSelected] = useState('');
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [ubicacionId, setUbicacionId] = useState(0);
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [creating, setCreating] = useState(false);

  // --- Table state ---
  const [citas, setCitas] = useState<Cita[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [citaSearch, setCitaSearch] = useState('');
  const [citaEstadoFilter, setCitaEstadoFilter] = useState('');
  const [citaMedicoFilter, setCitaMedicoFilter] = useState(0);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // --- Modal state ---
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCita, setDetailCita] = useState<Cita | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editCita, setEditCita] = useState<Cita | null>(null);

  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // --- Load initial catalogs ---
  useEffect(() => {
    api.get<Especialidad[]>('/especialidades')
      .then(({ data }) => setEspecialidades(data))
      .catch(() => {});
    api.get<UbicacionFisica[]>('/ubicaciones')
      .then(({ data }) => setUbicaciones(data))
      .catch(() => {});
  }, []);

  // --- Patient search ---
  useEffect(() => {
    if (!pacienteSearch || pacienteSearch.length < 2) { setPacientes([]); return; }
    const timer = setTimeout(() => {
      api.get<{ items: Paciente[]; total: number }>(`/pacientes/buscar?q=${encodeURIComponent(pacienteSearch)}`)
        .then(({ data }) => setPacientes(data.items ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [pacienteSearch]);

  // --- Load doctors when specialty changes ---
  useEffect(() => {
    if (!especialidadId) { setMedicos([]); return; }
    api.get<{ items: Medico[]; total: number }>(`/medicos?especialidad_id=${especialidadId}&activo=true`)
      .then(({ data }) => setMedicos(data.items ?? []))
      .catch(() => {});
  }, [especialidadId]);

  // --- Load slots when doctor + date changes ---
  useEffect(() => {
    if (!medicoId || !fechaCita) { setSlots([]); return; }
    api.get<DisponibilidadResponse>(`/disponibilidad/${medicoId}?fecha=${fechaCita}`)
      .then(({ data }) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]));
  }, [medicoId, fechaCita]);

  // --- Fetch citas ---
  const fetchCitas = useCallback(() => {
    setLoadingCitas(true);
    const params = new URLSearchParams();
    if (citaEstadoFilter) params.set('estado', citaEstadoFilter);
    if (citaMedicoFilter > 0) params.set('medico_id', String(citaMedicoFilter));
    if (fechaDesde) params.set('fecha_desde', fechaDesde);
    if (fechaHasta) params.set('fecha_hasta', fechaHasta);
    api.get<{ items: Cita[]; total: number }>(`/citas?${params.toString()}`)
      .then(({ data }) => { setCitas(data.items ?? []); setTotal(data.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoadingCitas(false));
  }, [citaEstadoFilter, citaMedicoFilter, fechaDesde, fechaHasta]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  // --- Create cita ---
  const handleCreateCita = async () => {
    if (!pacienteSelected || !medicoId || !especialidadId || !fechaCita) return;
    setCreating(true);
    try {
      const fechaHora = slotSelected ? `${fechaCita}T${slotSelected}` : `${fechaCita}T00:00`;
      await api.post('/citas', {
        paciente_id: pacienteSelected.paciente_id,
        medico_id: medicoId,
        especialidad_id: especialidadId,
        ubicacion_id: ubicacionId > 0 ? ubicacionId : undefined,
        fecha_hora: new Date(fechaHora).toISOString(),
        motivo_consulta: motivoConsulta || undefined,
        observaciones: observaciones || undefined,
      });
      setSnackbar({ message: 'Cita creada exitosamente', severity: 'success' });
      // Reset form
      setPacienteSelected(null);
      setPacienteSearch('');
      setEspecialidadId(0);
      setMedicoId(0);
      setFechaCita('');
      setSlots([]);
      setSlotSelected('');
      setUbicacionId(0);
      setMotivoConsulta('');
      setObservaciones('');
      fetchCitas();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al crear cita';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // --- Cancel cita ---
  const handleCancelCita = async (cita: Cita) => {
    if (!window.confirm(`¿Cancelar la cita #${cita.cita_id} de ${cita.paciente_nombre}?`)) return;
    try {
      await api.delete(`/citas/${cita.cita_id}`);
      setSnackbar({ message: 'Cita cancelada', severity: 'success' });
      fetchCitas();
    } catch (err: any) {
      setSnackbar({ message: err?.response?.data?.detail || 'Error al cancelar', severity: 'error' });
    }
  };

  const handleOpenDetalle = (c: Cita) => { setDetailCita(c); setDetailOpen(true); };
  const handleOpenEditar = (c: Cita) => { setEditCita(c); setEditOpen(true); };

  const filteredCitas = citas.filter((c) => {
    if (!citaSearch) return true;
    const q = citaSearch.toLowerCase();
    return (c.paciente_nombre?.toLowerCase().includes(q) ||
      c.medico_nombre?.toLowerCase().includes(q) ||
      String(c.cita_id).includes(q));
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Admisión de Citas</Typography>

      {/* ─── Formulario de creación ─── */}
      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AddIcon sx={{ color: '#1565C0', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>Agendar Nueva Cita</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={pacientes}
              getOptionLabel={(p) => `${p.nombre} ${p.apellido} (${p.dni})`}
              value={pacienteSelected}
              onChange={(_, v) => setPacienteSelected(v)}
              inputValue={pacienteSearch}
              onInputChange={(_, v) => setPacienteSearch(v)}
              noOptionsText={pacienteSearch.length < 2 ? 'Escriba al menos 2 caracteres' : 'Sin resultados'}
              renderInput={(params) => (
                <TextField {...params} label="Paciente *" size="small" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Especialidad *</InputLabel>
              <Select value={especialidadId} label="Especialidad *" onChange={(e) => { setEspecialidadId(Number(e.target.value)); setMedicoId(0); }}>
                <MenuItem value={0} disabled>Seleccione</MenuItem>
                {especialidades.map((e) => (
                  <MenuItem key={e.especialidad_id} value={e.especialidad_id}>{e.nombre_especialidad}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small" disabled={!especialidadId}>
              <InputLabel>Médico *</InputLabel>
              <Select value={medicoId} label="Médico *" onChange={(e) => setMedicoId(Number(e.target.value))}>
                <MenuItem value={0} disabled>Seleccione</MenuItem>
                {medicos.map((m) => (
                  <MenuItem key={m.medico_id} value={m.medico_id}>{m.nombre} {m.apellido}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField label="Fecha *" type="date" value={fechaCita}
              onChange={(e) => { setFechaCita(e.target.value); setSlotSelected(''); }}
              slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small" disabled={!slots.length}>
              <InputLabel>Horario</InputLabel>
              <Select value={slotSelected} label="Horario" onChange={(e) => setSlotSelected(e.target.value)}>
                <MenuItem value="">Seleccione</MenuItem>
                {slots.filter((s) => s.disponible).map((s) => (
                  <MenuItem key={s.hora_inicio} value={s.hora_inicio}>{s.hora_inicio}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ubicación</InputLabel>
              <Select value={ubicacionId} label="Ubicación" onChange={(e) => setUbicacionId(Number(e.target.value))}>
                <MenuItem value={0}>Sin ubicación</MenuItem>
                {ubicaciones.map((u) => (
                  <MenuItem key={u.ubicacion_id} value={u.ubicacion_id}>{u.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Motivo de consulta" value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)} size="small" fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Observaciones" value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)} size="small" fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleCreateCita}
                disabled={!pacienteSelected || !medicoId || !especialidadId || !fechaCita || creating}
                sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#0D47A1' } }}>
                {creating ? 'Creando...' : 'Agendar Cita'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ─── Tabla de Citas ─── */}
      <Paper elevation={1} sx={{ borderRadius: 3, mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <TextField
            placeholder="Buscar por paciente, médico o ID..."
            value={citaSearch}
            onChange={(e) => setCitaSearch(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              },
            }}
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={citaEstadoFilter} label="Estado" onChange={(e) => setCitaEstadoFilter(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS_CITA.map((est) => (
                <MenuItem key={est} value={est}>{est}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Médico</InputLabel>
            <Select value={citaMedicoFilter} label="Médico" onChange={(e) => setCitaMedicoFilter(Number(e.target.value))}>
              <MenuItem value={0}>Todos</MenuItem>
              {medicos.map((m) => (
                <MenuItem key={m.medico_id} value={m.medico_id}>{m.nombre} {m.apellido}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Desde" type="date" value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} size="small" sx={{ minWidth: 150 }}
          />
          <TextField label="Hasta" type="date" value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} size="small" sx={{ minWidth: 150 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ color: '#94a3b8', mr: 1 }}>{total} cita{total !== 1 ? 's' : ''}</Typography>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchCitas}>Actualizar</Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F5F7FA' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Médico</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Especialidad</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingCitas ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>Cargando...</TableCell></TableRow>
            ) : filteredCitas.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No hay citas registradas</TableCell></TableRow>
            ) : filteredCitas.map((c) => (
              <TableRow key={c.cita_id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>{c.cita_id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{c.paciente_nombre ?? '-'}</TableCell>
                <TableCell>{c.medico_nombre ?? '-'}</TableCell>
                <TableCell>{c.especialidad_nombre ?? '-'}</TableCell>
                <TableCell>{c.fecha_hora ? new Date(c.fecha_hora).toLocaleString() : '-'}</TableCell>
                <TableCell>{estadoChip(c.estado_cita)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => handleOpenDetalle(c)}
                        sx={{ bgcolor: '#F0F4F8', width: 30, height: 30, '&:hover': { bgcolor: '#E3F2FD' } }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: '#546E7A' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEditar(c)}
                        sx={{ bgcolor: '#FFF8E1', width: 30, height: 30, '&:hover': { bgcolor: '#FFECB3' } }}>
                        <EditIcon sx={{ fontSize: 16, color: '#F57F17' }} />
                      </IconButton>
                    </Tooltip>
                    {c.estado_cita !== 'Cancelada' && c.estado_cita !== 'Completada' && (
                      <Tooltip title="Cancelar">
                        <IconButton size="small" onClick={() => handleCancelCita(c)}
                          sx={{ bgcolor: '#FFEBEE', width: 30, height: 30, '&:hover': { bgcolor: '#FFCDD2' } }}>
                          <CancelIcon sx={{ fontSize: 16, color: '#E53935' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <DetalleCitaModal open={detailOpen} onClose={() => setDetailOpen(false)} cita={detailCita} />
      <EditarCitaModal open={editOpen} onClose={() => setEditOpen(false)} cita={editCita} onActualizada={fetchCitas} />

      <Snackbar
        open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snackbar ? <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
