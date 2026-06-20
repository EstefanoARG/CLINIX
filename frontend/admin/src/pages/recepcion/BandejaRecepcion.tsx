import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, TextField, Chip, IconButton, Tooltip, InputAdornment, MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';
import type { ReservaWebOut, Medico } from '../../types';
import ConvertirCitaModal from '../../components/ui/ConvertirCitaModal';
import RechazarReservaModal from '../../components/ui/RechazarReservaModal';
import DetalleReservaModal from '../../components/ui/DetalleReservaModal';

const ESTADOS = ['Pendiente', 'Convertida', 'Rechazada'];

function estadoChip(estado: string) {
  if (estado === 'Pendiente') return <Chip label="Pendiente" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />;
  if (estado === 'Convertida') return <Chip label="Convertida" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />;
  return <Chip label="Rechazada" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600 }} />;
}

export default function BandejaRecepcion() {
  const [reservas, setReservas] = useState<ReservaWebOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');
  const [medicoFilter, setMedicoFilter] = useState<number>(0);
  const [fechaFilter, setFechaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [departamentos, setDepartamentos] = useState<{ departamento_id: number; nombre: string }[]>([]);

  const [convertOpen, setConvertOpen] = useState(false);
  const [convertReserva, setConvertReserva] = useState<ReservaWebOut | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReserva, setRejectReserva] = useState<ReservaWebOut | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReserva, setDetailReserva] = useState<ReservaWebOut | null>(null);

  const fetchReservas = () => {
    setLoading(true);
    api.get('/reservas/pendientes')
      .then(({ data }) => setReservas(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservas();
    api.get<{ items: Medico[]; total: number }>('/medicos')
      .then(({ data }) => setMedicos(data.items ?? []))
      .catch(() => {});
    api.get<{ departamento_id: number; nombre: string }[]>('/departamentos')
      .then(({ data }) => setDepartamentos(data))
      .catch(() => {});
  }, []);

  const handleOpenConvertir = (r: ReservaWebOut) => {
    setConvertReserva(r);
    setConvertOpen(true);
  };

  const handleOpenRechazar = (r: ReservaWebOut) => {
    setRejectReserva(r);
    setRejectOpen(true);
  };

  const handleOpenDetalle = (r: ReservaWebOut) => {
    setDetailReserva(r);
    setDetailOpen(true);
  };

  const especialidades = [...new Set(reservas.map((r) => r.especialidad_nombre).filter(Boolean) as string[])].sort();
  const sorted = [...reservas].sort((a, b) => b.reserva_id - a.reserva_id);
  const filtered = sorted.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      r.nombre_solicitante.toLowerCase().includes(q) ||
      r.dni_solicitante.includes(q) ||
      r.email_solicitante.toLowerCase().includes(q);
    const matchesEspecialidad = !especialidadFilter || r.especialidad_nombre === especialidadFilter;
    const matchesMedico = medicoFilter === 0 || r.medico_id === medicoFilter;
    const matchesFecha = !fechaFilter || r.fecha_hora_deseada.startsWith(fechaFilter);
    const matchesEstado = !estadoFilter || r.estado === estadoFilter;
    return matchesSearch && matchesEspecialidad && matchesMedico && matchesFecha && matchesEstado;
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Bandeja de Recepción</Typography>

      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <TextField
            placeholder="Buscar por nombre, DNI o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              },
            }}
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Especialidad</InputLabel>
            <Select
              value={especialidadFilter}
              label="Especialidad"
              onChange={(e) => setEspecialidadFilter(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {especialidades.map((esp) => (
                <MenuItem key={esp} value={esp}>{esp}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Médico</InputLabel>
            <Select
              value={medicoFilter}
              label="Médico"
              onChange={(e) => setMedicoFilter(Number(e.target.value))}
            >
              <MenuItem value={0}>Todos</MenuItem>
              {medicos.map((m) => (
                <MenuItem key={m.medico_id} value={m.medico_id}>
                  {m.nombre} {m.apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Fecha deseada"
            type="date"
            value={fechaFilter}
            onChange={(e) => setFechaFilter(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={{ minWidth: 165 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estadoFilter}
              label="Estado"
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {ESTADOS.map((est) => (
                <MenuItem key={est} value={est}>{est}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" size="small" onClick={fetchReservas}>Actualizar</Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F5F7FA' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Especialidad</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Médico</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha Solicitud</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha Deseada</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} align="center" sx={{ py: 5 }}>Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={10} align="center" sx={{ py: 5 }}>No hay reservas pendientes</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.reserva_id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>{r.reserva_id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{r.nombre_solicitante}</TableCell>
                <TableCell>{r.dni_solicitante}</TableCell>
                <TableCell>{r.email_solicitante}</TableCell>
                <TableCell>{r.especialidad_nombre ?? '-'}</TableCell>
                <TableCell>{r.medico_nombre ?? '-'}</TableCell>
                <TableCell>{r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{r.fecha_hora_deseada ? new Date(r.fecha_hora_deseada).toLocaleString() : '-'}</TableCell>
                <TableCell>{estadoChip(r.estado)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetalle(r)}
                        sx={{ bgcolor: '#F0F4F8', width: 30, height: 30, '&:hover': { bgcolor: '#E3F2FD' } }}
                      >
                        <VisibilityIcon sx={{ fontSize: 16, color: '#546E7A' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Aprobar">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenConvertir(r)}
                        sx={{ bgcolor: '#E8F5E9', width: 30, height: 30, '&:hover': { bgcolor: '#C8E6C9' } }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#43A047' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rechazar">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenRechazar(r)}
                        sx={{ bgcolor: '#FFEBEE', width: 30, height: 30, '&:hover': { bgcolor: '#FFCDD2' } }}
                      >
                        <CancelIcon sx={{ fontSize: 16, color: '#E53935' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <ConvertirCitaModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        reserva={convertReserva}
        onConvertida={fetchReservas}
        departamentos={departamentos}
      />

      <RechazarReservaModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        reserva={rejectReserva}
        onRechazada={fetchReservas}
      />

      <DetalleReservaModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        reserva={detailReserva}
      />
    </Box>
  );
}
