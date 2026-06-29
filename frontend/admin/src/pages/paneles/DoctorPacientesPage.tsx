import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Chip, IconButton, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Tooltip, Typography, InputAdornment, alpha,
} from '@mui/material';
import { Users, Search, Eye, Calendar, Phone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface DoctorPatient {
  paciente_id: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  fecha_registro: string | null;
  ultima_cita: string | null;
  ultimo_estado: string | null;
  ultima_cita_id: number | null;
  tiene_historia: boolean;
}

const STATUS_CHIP: Record<string, { color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  Programada: { color: 'info', label: 'Programada' },
  Confirmada: { color: 'primary', label: 'Confirmada' },
  'En curso': { color: 'warning', label: 'En curso' },
  Completada: { color: 'success', label: 'Completada' },
  Cancelada: { color: 'error', label: 'Cancelada' },
  'No asistió': { color: 'error', label: 'No asistió' },
};

export default function DoctorPacientesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DoctorPatient[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    api.get<{ items: DoctorPatient[] }>('/medico/mis-pacientes?limit=500')
      .then(({ data }) => setItems(data.items));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? items.filter((i) =>
        `${i.nombre} ${i.apellido} ${i.dni}`.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <FileText size={28} color="#2563EB" />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F4C81' }}>Mis Pacientes</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <TextField
          size="small"
          placeholder="Buscar paciente por nombre o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 380 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#9CA3AF" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, color: 'text.secondary' }}>
              <Users size={64} strokeWidth={1} color="#D1D5DB" style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#6B7280' }}>Todavía no tienes pacientes</Typography>
              <Typography variant="body2" color="#9CA3AF">Los pacientes aparecerán aquí cuando tengas citas con ellos.</Typography>
            </Box>
          </motion.div>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#DBEAFE' }}>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>DNI</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Paciente</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Contacto</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Última Cita</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Estado</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>HC</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.paciente_id}
                  hover
                  sx={{ '&:hover': { bgcolor: '#EEF2FF' }, '&:last-child td': { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 500, color: '#374151' }}>{item.dni}</TableCell>
                  <TableCell sx={{ fontWeight: 500, color: '#111827' }}>{item.nombre} {item.apellido}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="#6B7280">{item.email ?? '-'}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Phone size={14} color="#9CA3AF" />
                        <Typography variant="body2" color="#6B7280">{item.telefono ?? '-'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Calendar size={14} color="#9CA3AF" />
                      <Typography variant="body2" color="#6B7280">{item.ultima_cita ? new Date(item.ultima_cita).toLocaleString() : '-'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item.ultimo_estado ? (
                      <Chip
                        size="small"
                        {...STATUS_CHIP[item.ultimo_estado] ?? { color: 'default', label: item.ultimo_estado }}
                        sx={{
                          fontWeight: 500,
                          ...(item.ultimo_estado === 'Programada' && { bgcolor: '#DBEAFE', color: '#1E40AF' }),
                          ...(item.ultimo_estado === 'Confirmada' && { bgcolor: '#E0E7FF', color: '#3730A3' }),
                          ...(item.ultimo_estado === 'En curso' && { bgcolor: '#FEF3C7', color: '#92400E' }),
                          ...(item.ultimo_estado === 'Completada' && { bgcolor: '#D1FAE5', color: '#065F46' }),
                          ...(item.ultimo_estado === 'Cancelada' && { bgcolor: '#FEE2E2', color: '#991B1B' }),
                          ...(item.ultimo_estado === 'No asistió' && { bgcolor: '#FEE2E2', color: '#991B1B' }),
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="#9CA3AF">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.tiene_historia ? 'Sí' : 'No'}
                      sx={{
                        fontWeight: 500,
                        bgcolor: item.tiene_historia ? '#D1FAE5' : '#F3F4F6',
                        color: item.tiene_historia ? '#065F46' : '#6B7280',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver historial médico">
                      <IconButton
                        onClick={() => navigate(`/panel/doctor/pacientes/${item.paciente_id}/historial`)}
                        sx={{ color: '#2563EB', '&:hover': { bgcolor: alpha('#2563EB', 0.1) } }}
                        size="small"
                      >
                        <Eye size={20} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
