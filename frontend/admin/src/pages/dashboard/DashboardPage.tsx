import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '../../services/api';
import type { DashboardResponse } from '../../types';
import KpiCard from '../../components/ui/KpiCard';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    api.get<DashboardResponse>('/dashboard').then(({ data }) => setData(data));
  }, []);

  if (!data) return null;

  const m = data.metricas;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Doctores" value={m.total_doctores} icon={<PeopleIcon fontSize="large" />} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Enfermeras" value={m.total_enfermeros} icon={<PeopleIcon fontSize="large" />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Pacientes" value={m.total_pacientes} icon={<PeopleIcon fontSize="large" />} color="info.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Habitaciones" value={m.total_habitaciones} icon={<HotelIcon fontSize="large" />} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Disponibles" value={m.habitaciones_disponibles} icon={<HotelIcon fontSize="large" />} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Ocupadas" value={m.habitaciones_ocupadas} icon={<HotelIcon fontSize="large" />} color="error.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Citas Hoy" value={m.citas_hoy} icon={<CalendarMonthIcon fontSize="large" />} color="primary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Admisiones Activas" value={m.admisiones_activas} icon={<AssignmentIcon fontSize="large" />} color="secondary.main" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Actividades Recientes</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.actividades.map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell>{a.descripcion}</TableCell>
                  <TableCell>{a.fecha}</TableCell>
                </TableRow>
              ))}
              {data.actividades.length === 0 && (
                <TableRow><TableCell colSpan={3} align="center">Sin actividades recientes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
