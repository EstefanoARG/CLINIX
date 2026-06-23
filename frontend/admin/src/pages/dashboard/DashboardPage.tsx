import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BedIcon from '@mui/icons-material/Bed';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../services/api';
import type {
  ActividadReciente,
  DashboardResponse,
  DistribucionItem,
} from '../../types';
import KpiCard from '../../components/ui/KpiCard';

const PERIODOS: Record<string, string> = {
  hoy: 'Hoy',
  semana: 'Esta semana',
  mes: 'Este mes',
};

const COLORES_ESTADO: Record<string, string> = {
  Programada: '#2563EB',
  Confirmada: '#0891B2',
  'En curso': '#F59E0B',
  Completada: '#16A34A',
  Cancelada: '#DC2626',
  'No asistió': '#7C3AED',
  Pendiente: '#F59E0B',
  Convertida: '#16A34A',
  Rechazada: '#DC2626',
  Disponible: '#16A34A',
  Ocupada: '#2563EB',
  Mantenimiento: '#F59E0B',
  Reservada: '#7C3AED',
};

const COLORES_PIE = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED', '#0891B2'];

function colorEstado(nombre: string, indice: number) {
  return COLORES_ESTADO[nombre] ?? COLORES_PIE[indice % COLORES_PIE.length];
}

function formatearFecha(fecha: string) {
  if (!fecha) return 'Sin fecha';
  const normalizada = fecha.includes('T') ? fecha : fecha.replace(' ', 'T');
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(normalizada));
}

function ChartCard({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {titulo}
        </Typography>
        {subtitulo && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitulo}
          </Typography>
        )}
        {!subtitulo && <Box sx={{ mb: 2 }} />}
        {children}
      </CardContent>
    </Card>
  );
}

function SinDatos({ mensaje = 'No hay datos para este período' }: { mensaje?: string }) {
  return (
    <Box
      sx={{
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">{mensaje}</Typography>
    </Box>
  );
}

function Indicador({
  titulo,
  valor,
  color,
  detalle,
}: {
  titulo: string;
  valor: number;
  color: string;
  detalle: string;
}) {
  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {titulo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {detalle}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color }}>
          {valor.toFixed(1)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(valor, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(color, 0.14),
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

function DistribucionChart({ datos }: { datos: DistribucionItem[] }) {
  if (!datos.length) return <SinDatos />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={datos}
          dataKey="valor"
          nameKey="nombre"
          cx="50%"
          cy="46%"
          innerRadius={58}
          outerRadius={92}
          paddingAngle={3}
        >
          {datos.map((item, index) => (
            <Cell key={item.nombre} fill={colorEstado(item.nombre, index)} />
          ))}
        </Pie>
        <ChartTooltip formatter={(valor) => [Number(valor), 'Cantidad']} />
        <Legend verticalAlign="bottom" height={40} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ActividadItem({ actividad }: { actividad: ActividadReciente }) {
  const theme = useTheme();
  const config = {
    admision: { color: theme.palette.error.main, icono: <LocalHospitalIcon fontSize="small" /> },
    alta: { color: theme.palette.success.main, icono: <CheckCircleIcon fontSize="small" /> },
    cita: { color: theme.palette.primary.main, icono: <CalendarMonthIcon fontSize="small" /> },
  }[actividad.tipo] ?? {
    color: theme.palette.grey[600],
    icono: <AssignmentIcon fontSize="small" />,
  };

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          color: config.color,
          bgcolor: alpha(config.color, 0.12),
        }}
      >
        {config.icono}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {actividad.descripcion}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatearFecha(actividad.fecha)}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function DashboardPage() {
  const theme = useTheme();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [filtro, setFiltro] = useState('hoy');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');

    api
      .get<DashboardResponse>(`/dashboard?periodo=${filtro}`)
      .then(({ data: respuesta }) => {
        if (activo) setData(respuesta);
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar la información del dashboard.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [filtro]);

  const rango = useMemo(() => {
    if (!data) return '';
    return data.periodo_desde === data.periodo_hasta
      ? data.periodo_desde
      : `${data.periodo_desde} — ${data.periodo_hasta}`;
  }, [data]);

  if (cargando && !data) {
    return (
      <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Alert severity="error">{error || 'No hay información disponible.'}</Alert>;
  }

  const m = data.metricas;
  const i = data.indicadores;
  const g = data.graficos;
  const t = data.tablas;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Panel clínico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumen operativo del {rango}
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Período"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="hoy">Hoy</MenuItem>
          <MenuItem value="semana">Esta semana</MenuItem>
          <MenuItem value="mes">Este mes</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={`Citas · ${PERIODOS[filtro]}`}
            value={m.total_citas_periodo}
            icon={<CalendarMonthIcon fontSize="large" />}
            color="#2563EB"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Citas activas"
            value={m.citas_hoy}
            icon={<EventAvailableIcon fontSize="large" />}
            color="#0891B2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Citas completadas"
            value={m.citas_completadas}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#16A34A"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Canceladas / ausencias"
            value={m.citas_canceladas}
            icon={<CancelIcon fontSize="large" />}
            color="#DC2626"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Doctores activos"
            value={m.total_doctores}
            icon={<PeopleIcon fontSize="large" />}
            color="#7C3AED"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title={`Pacientes nuevos · ${PERIODOS[filtro]}`}
            value={m.pacientes_recientes}
            icon={<PersonAddAltIcon fontSize="large" />}
            color="#EA580C"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Admisiones activas"
            value={m.admisiones_activas}
            icon={<BedIcon fontSize="large" />}
            color="#BE123C"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Reservas pendientes"
            value={m.reservas_pendientes}
            icon={<BookOnlineIcon fontSize="large" />}
            color="#D97706"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard
            titulo="Tendencia de atención"
            subtitulo={
              filtro === 'hoy'
                ? 'Comportamiento de los últimos 7 días'
                : `Actividad diaria de ${PERIODOS[filtro].toLowerCase()}`
            }
          >
            <ResponsiveContainer width="100%" height={330}>
              <AreaChart data={g.tendencia} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaCitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="areaReservas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.divider} />
                <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="citas"
                  name="Citas"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#areaCitas)"
                />
                <Area
                  type="monotone"
                  dataKey="reservas"
                  name="Reservas"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="url(#areaReservas)"
                />
                <Area
                  type="monotone"
                  dataKey="completadas"
                  name="Completadas"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="canceladas"
                  name="Canceladas"
                  stroke="#DC2626"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard titulo="Indicadores operativos" subtitulo="Porcentajes calculados con el período seleccionado">
            <Stack spacing={3.1}>
              <Indicador
                titulo="Ocupación hospitalaria"
                valor={i.ocupacion_hospitalaria}
                color="#2563EB"
                detalle={`${m.habitaciones_ocupadas} de ${m.habitaciones_disponibles + m.habitaciones_ocupadas} habitaciones operativas`}
              />
              <Indicador
                titulo="Citas completadas"
                valor={i.tasa_completitud_citas}
                color="#16A34A"
                detalle={`${m.citas_completadas} de ${m.total_citas_periodo} citas`}
              />
              <Indicador
                titulo="Cancelación y ausencias"
                valor={i.tasa_cancelacion_citas}
                color="#DC2626"
                detalle={`${m.citas_canceladas} incidencias en el período`}
              />
              <Indicador
                titulo="Conversión de reservas"
                valor={i.conversion_reservas}
                color="#7C3AED"
                detalle={`${m.reservas_convertidas} de ${m.total_reservas_periodo} solicitudes`}
              />
              <Divider />
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="body2" color="text.secondary">
                  Promedio por médico
                </Typography>
                <Chip
                  label={`${i.promedio_citas_por_medico.toFixed(1)} citas`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard
            titulo="Demanda por especialidad"
            subtitulo="Comparación entre citas y solicitudes web"
          >
            {g.demanda_especialidades.length ? (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={g.demanda_especialidades}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke={theme.palette.divider} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="especialidad"
                    width={118}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip />
                  <Legend iconType="circle" />
                  <Bar dataKey="citas" name="Citas" stackId="demanda" fill="#2563EB" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="reservas" name="Reservas" stackId="demanda" fill="#F59E0B" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <SinDatos />
            )}
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ChartCard titulo="Estado de citas" subtitulo={`${m.total_citas_periodo} citas registradas`}>
            <DistribucionChart datos={g.estados_citas} />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ChartCard titulo="Habitaciones" subtitulo={`${m.total_habitaciones} habitaciones en total`}>
            <DistribucionChart datos={g.ocupacion_habitaciones} />
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard
            titulo="Solicitudes web"
            subtitulo="Distribución por estado de la fecha de atención solicitada"
          >
            <DistribucionChart datos={g.estados_reservas} />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard titulo="Actividad clínica reciente" subtitulo="Admisiones, próximas citas y altas">
            {data.actividades.length ? (
              <Stack spacing={2.1} divider={<Divider flexItem />}>
                {data.actividades.map((actividad, index) => (
                  <ActividadItem
                    key={`${actividad.tipo}-${actividad.fecha}-${index}`}
                    actividad={actividad}
                  />
                ))}
              </Stack>
            ) : (
              <SinDatos mensaje="No hay actividad reciente registrada" />
            )}
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard titulo={`Médicos con atención · ${PERIODOS[filtro]}`}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Médico</TableCell>
                    <TableCell>Especialidad</TableCell>
                    <TableCell align="center">Activas</TableCell>
                    <TableCell align="center">Completadas</TableCell>
                    <TableCell align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {t.doctores_hoy.map((doctor) => (
                    <TableRow key={doctor.medico_id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{doctor.nombre}</TableCell>
                      <TableCell>{doctor.especialidad}</TableCell>
                      <TableCell align="center">
                        <Chip label={doctor.citas_programadas} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={doctor.citas_completadas} color="success" size="small" />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        {doctor.citas_programadas + doctor.citas_completadas}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!t.doctores_hoy.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No hay médicos con citas en este período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard titulo={`Pacientes nuevos · ${PERIODOS[filtro]}`}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Paciente</TableCell>
                    <TableCell>DNI</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="center">Con cita</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {t.pacientes_nuevos.map((paciente) => (
                    <TableRow key={paciente.paciente_id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{paciente.nombre}</TableCell>
                      <TableCell>{paciente.dni}</TableCell>
                      <TableCell>{formatearFecha(paciente.fecha_registro)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={paciente.tiene_cita ? 'Sí' : 'No'}
                          color={paciente.tiene_cita ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!t.pacientes_nuevos.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No hay pacientes nuevos en este período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
