import { useEffect, useState } from 'react';
import { Box, Chip, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import api from '../../services/api';
import type { Admision, Cita } from '../../types';

export default function PanelMedicoPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get<{ items: Cita[] }>(`/medico/mis-citas?fecha_desde=${today}`),
      api.get<{ items: Admision[] }>('/medico/mis-admisiones?estado=Activa'),
    ]).then(([a, b]) => {
      setCitas(a.data.items);
      setAdmisiones(b.data.items);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Panel médico</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}><Paper sx={{ p: 3 }}><Typography color="text.secondary">Próximas citas</Typography><Typography variant="h3">{citas.length}</Typography></Paper></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><Paper sx={{ p: 3 }}><Typography color="text.secondary">Pacientes hospitalizados</Typography><Typography variant="h3">{admisiones.length}</Typography></Paper></Grid>
      </Grid>
      <Typography variant="h6" sx={{ mb: 1 }}>Agenda</Typography>
      <Paper sx={{ mb: 3 }}><Table size="small"><TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Paciente</TableCell><TableCell>Especialidad</TableCell><TableCell>Motivo</TableCell><TableCell>Estado</TableCell></TableRow></TableHead>
        <TableBody>{citas.map((item) => <TableRow key={item.cita_id}><TableCell>{new Date(item.fecha_hora).toLocaleString()}</TableCell><TableCell>{item.paciente_nombre}</TableCell><TableCell>{item.especialidad_nombre}</TableCell><TableCell>{item.motivo_consulta ?? '-'}</TableCell><TableCell><Chip size="small" label={item.estado_cita} /></TableCell></TableRow>)}</TableBody>
      </Table></Paper>
      <Typography variant="h6" sx={{ mb: 1 }}>Admisiones activas</Typography>
      <Paper><Table size="small"><TableHead><TableRow><TableCell>Paciente</TableCell><TableCell>Habitación</TableCell><TableCell>Ingreso</TableCell><TableCell>Motivo</TableCell></TableRow></TableHead>
        <TableBody>{admisiones.map((item) => <TableRow key={item.admision_id}><TableCell>{item.paciente_nombre}</TableCell><TableCell>{item.habitacion_numero}</TableCell><TableCell>{new Date(item.fecha_ingreso).toLocaleString()}</TableCell><TableCell>{item.motivo_ingreso}</TableCell></TableRow>)}</TableBody>
      </Table></Paper>
    </Box>
  );
}
