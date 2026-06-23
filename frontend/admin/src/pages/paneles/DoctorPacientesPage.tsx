import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Chip, IconButton, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
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
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Mis Pacientes</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField size="small" label="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 320 }} />
      </Paper>
      <Paper>
        {filtered.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, color: 'text.secondary' }}>
            <GroupOutlinedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>Todavía no tienes pacientes</Typography>
            <Typography variant="body2">Los pacientes aparecerán aquí cuando tengas citas con ellos.</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>DNI</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Última Cita</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>HC</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.paciente_id} hover>
                  <TableCell>{item.dni}</TableCell>
                  <TableCell>{item.nombre} {item.apellido}</TableCell>
                  <TableCell>{item.email ?? '-'}<br />{item.telefono ?? '-'}</TableCell>
                  <TableCell>{item.ultima_cita ? new Date(item.ultima_cita).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    {item.ultimo_estado ? (
                      <Chip size="small" {...STATUS_CHIP[item.ultimo_estado] ?? { color: 'default', label: item.ultimo_estado }} />
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={item.tiene_historia ? 'Sí' : 'No'} color={item.tiene_historia ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver historial médico">
                      <IconButton onClick={() => navigate(`/panel/doctor/pacientes/${item.paciente_id}/historial`)}>
                        <VisibilityIcon />
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
