import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, TextField, MenuItem,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../../services/api';
import type { DashboardResponse } from '../../types';
import KpiCard from '../../components/ui/KpiCard';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [filtro, setFiltro] = useState('hoy');

  useEffect(() => {
    api.get<DashboardResponse>(`/dashboard?periodo=${filtro}`).then(({ data }) => setData(data));
  }, [filtro]);

  if (!data) return null;

  const m = data.metricas;
  const t = data.tablas;

  const periodoLabel: Record<string, string> = {
    hoy: 'Hoy',
    semana: 'Esta Semana',
    mes: 'Este Mes',
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <TextField
          select
          size="small"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="hoy">Hoy</MenuItem>
          <MenuItem value="semana">Esta Semana</MenuItem>
          <MenuItem value="mes">Este Mes</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid key="kpi-citas" size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title={`Citas (${periodoLabel[filtro]})`} value={m.citas_hoy} icon={<CalendarMonthIcon fontSize="large" />} color="#1976D2" />
        </Grid>
        <Grid key="kpi-doctores" size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Doctores Activos" value={m.total_doctores} icon={<PeopleIcon fontSize="large" />} color="#388E3C" />
        </Grid>
        <Grid key="kpi-pacientes" size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title={`Pacientes Nuevos (${periodoLabel[filtro]})`} value={m.pacientes_recientes} icon={<TrendingUpIcon fontSize="large" />} color="#F57C00" />
        </Grid>
        <Grid key="kpi-admisiones" size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Admisiones Activas" value={m.admisiones_activas} icon={<AssignmentIcon fontSize="large" />} color="#D32F2F" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid key="tabla-doctores" size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Doctores ({periodoLabel[filtro]})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Especialidad</TableCell>
                    <TableCell align="center">Programadas</TableCell>
                    <TableCell align="center">Completadas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {t.doctores_hoy.map((doc) => (
                    <TableRow key={doc.medico_id}>
                      <TableCell sx={{ fontWeight: 500 }}>{doc.nombre}</TableCell>
                      <TableCell>{doc.especialidad}</TableCell>
                      <TableCell align="center">
                        <Chip label={doc.citas_programadas} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={doc.citas_completadas} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {t.doctores_hoy.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">Sin doctores con citas en este período</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid key="tabla-pacientes" size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Pacientes Nuevos Registrados ({periodoLabel[filtro]})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Paciente</TableCell>
                    <TableCell>DNI</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="center">Cita</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {t.pacientes_nuevos.map((p) => (
                    <TableRow key={p.paciente_id}>
                      <TableCell sx={{ fontWeight: 500 }}>{p.nombre}</TableCell>
                      <TableCell>{p.dni}</TableCell>
                      <TableCell>{p.fecha_registro}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.tiene_cita ? 'Sí' : 'No'}
                          color={p.tiene_cita ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {t.pacientes_nuevos.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">Sin pacientes nuevos en este período</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
