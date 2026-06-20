import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, CardActionArea,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import type { Habitacion, Departamento } from '../../types';
import EditarHabitacionModal from '../../components/ui/EditarHabitacionModal';

const ESTADOS = ['Disponible', 'Ocupada', 'Mantenimiento'];
const TIPOS_HABITACION = ['General', 'VIP', 'Suite', 'UCI', 'Aislamiento'];

function estadoStyle(estado: string) {
  if (estado === 'Disponible') return { bgcolor: '#E8F5E9', color: '#2E7D32', icon: <SingleBedIcon sx={{ fontSize: 40, color: '#4CAF50' }} /> };
  if (estado === 'Ocupada') return { bgcolor: '#FFEBEE', color: '#C62828', icon: <SingleBedIcon sx={{ fontSize: 40, color: '#E53935' }} /> };
  return { bgcolor: '#FFF8E1', color: '#F57F17', icon: <CleaningServicesIcon sx={{ fontSize: 40, color: '#FFA000' }} /> };
}

function estadoChip(estado: string) {
  if (estado === 'Disponible') return <Chip label="Disponible" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />;
  if (estado === 'Ocupada') return <Chip label="Ocupada" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600 }} />;
  return <Chip label="Mantenimiento" size="small" sx={{ bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 600 }} />;
}

export default function PanelCuartos() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptoFilter, setDeptoFilter] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editHabitacion, setEditHabitacion] = useState<Habitacion | null>(null);

  const fetchHabitaciones = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (deptoFilter > 0) params.set('departamento_id', String(deptoFilter));
    if (estadoFilter) params.set('estado', estadoFilter);
    if (tipoFilter) params.set('tipo', tipoFilter);
    api.get<Habitacion[]>(`/habitaciones?${params.toString()}`)
      .then(({ data }) => setHabitaciones(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get<Departamento[]>('/departamentos')
      .then(({ data }) => setDepartamentos(data.filter((d) => d.activo)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchHabitaciones();
  }, [deptoFilter, estadoFilter, tipoFilter]);

  const grouped = useMemo(() => {
    const map = new Map<number, { nombre: string; habitaciones: Habitacion[] }>();
    for (const h of habitaciones) {
      if (!map.has(h.departamento_id)) {
        const depto = departamentos.find((d) => d.departamento_id === h.departamento_id);
        map.set(h.departamento_id, { nombre: depto?.nombre ?? h.departamento_nombre ?? 'Sin departamento', habitaciones: [] });
      }
      map.get(h.departamento_id)!.habitaciones.push(h);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));
  }, [habitaciones, departamentos]);

  const totalLibres = habitaciones.filter((h) => h.estado === 'Disponible').length;
  const totalOcupadas = habitaciones.filter((h) => h.estado === 'Ocupada').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Panel de Cuartos</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50' }} />
            <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>{totalLibres} libres</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#E53935' }} />
            <Typography variant="body2" sx={{ color: '#C62828', fontWeight: 600 }}>{totalOcupadas} ocupadas</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFA000' }} />
            <Typography variant="body2" sx={{ color: '#F57F17', fontWeight: 600 }}>{habitaciones.filter((h) => h.estado === 'Mantenimiento').length} mantenimiento</Typography>
          </Box>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { setEditHabitacion(null); setModalOpen(true); }}>
            Nueva Habitación
          </Button>
        </Box>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Departamento</InputLabel>
            <Select value={deptoFilter} label="Departamento" onChange={(e) => setDeptoFilter(Number(e.target.value))}>
              <MenuItem value={0}>Todos los departamentos</MenuItem>
              {departamentos.map((d) => (
                <MenuItem key={d.departamento_id} value={d.departamento_id}>{d.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={estadoFilter} label="Estado" onChange={(e) => setEstadoFilter(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS.map((est) => (
                <MenuItem key={est} value={est}>{est}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select value={tipoFilter} label="Tipo" onChange={(e) => setTipoFilter(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {TIPOS_HABITACION.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchHabitaciones}>
            Actualizar
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Typography sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>Cargando habitaciones...</Typography>
      ) : grouped.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>No hay habitaciones con los filtros seleccionados</Typography>
      ) : grouped.map(([deptoId, grupo]) => {
        const disponibles = grupo.habitaciones.filter((h) => h.estado === 'Disponible').length;
        const ocupadas = grupo.habitaciones.filter((h) => h.estado === 'Ocupada').length;
        return (
          <Box key={deptoId} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MeetingRoomIcon sx={{ color: '#1565C0', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>{grupo.nombre}</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', ml: 1 }}>
                {disponibles} disponible{disponibles !== 1 ? 's' : ''} · {ocupadas} ocupada{ocupadas !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {grupo.habitaciones.map((h) => {
                const s = estadoStyle(h.estado);
                return (
                  <Grid key={h.habitacion_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card elevation={1} sx={{
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: h.estado === 'Disponible' ? '#4CAF50' : h.estado === 'Ocupada' ? '#E53935' : '#FFA000',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0px 6px 20px rgba(0,0,0,0.08)' },
                    }}>
                      <CardActionArea sx={{ p: 0 }} onClick={() => { setEditHabitacion(h); setModalOpen(true); }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                            <Box>
                              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{h.numero}</Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>{h.piso ? `Piso ${h.piso}` : '-'}</Typography>
                            </Box>
                            {s.icon}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            {estadoChip(h.estado)}
                            <Chip label={h.tipo} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                          </Box>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Capacidad: <strong>{h.capacidad} cama{h.capacidad !== 1 ? 's' : ''}</strong>
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}

      <EditarHabitacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        habitacion={editHabitacion}
        onActualizada={fetchHabitaciones}
      />
    </Box>
  );
}
