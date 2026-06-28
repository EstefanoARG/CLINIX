import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface FeatureRow {
  category?: string;
  feature: string;
  tooltip: string;
  values: [string, string, string];
}

const rows: FeatureRow[] = [
  { category: 'Comunicación con pacientes', feature: '', tooltip: '', values: ['', '', ''] },
  {
    feature: 'Recordatorios de visitas',
    tooltip: 'Reduce las ausencias con recordatorios automáticos.',
    values: ['Vía e-mail y notificaciones push', 'Vía e-mail, SMS y notificaciones push', 'Vía e-mail, App y SMS. Envíos masivos'],
  },
  {
    feature: 'Campañas de SMS',
    tooltip: 'Mantén el contacto con tus pacientes.',
    values: ['300 SMS al mes', '1000 SMS al mes', '5000 SMS al mes'],
  },
  {
    feature: 'Mensajes',
    tooltip: 'Canal seguro para comunicarte con tus pacientes.',
    values: ['✓', '✓', '✓'],
  },
  { category: 'Gestión del consultorio', feature: '', tooltip: '', values: ['', '', ''] },
  {
    feature: 'Reserva online de cita',
    tooltip: 'Permite que los pacientes programen su cita.',
    values: ['✓', '✓', '✓'],
  },
  {
    feature: 'Episodios clínicos',
    tooltip: 'Recopila información de pacientes.',
    values: ['-', '✓', '✓'],
  },
  {
    feature: 'Lista de espera',
    tooltip: 'Completa turnos cancelados.',
    values: ['-', '✓', '✓'],
  },
  {
    feature: 'Consulta en línea',
    tooltip: 'Videoconsulta segura.',
    values: ['Solo calendario digital', 'Calendario y videoconsulta', 'Calendario y videoconsulta'],
  },
  {
    feature: 'Informes en tiempo real',
    tooltip: 'Accede al rendimiento de tu consulta.',
    values: ['✓', '✓', '✓'],
  },
  { category: 'Visibilidad', feature: '', tooltip: '', values: ['', '', ''] },
  {
    feature: 'Visibilidad en listados',
    tooltip: 'Mejora tu posición en CLINIX.',
    values: ['✓', '✓', '✓'],
  },
  {
    feature: 'Opiniones',
    tooltip: 'Construye confianza con opiniones.',
    values: ['✓', '✓', '✓'],
  },
  {
    feature: 'Diseño de perfil',
    tooltip: 'Perfil público optimizado.',
    values: ['Básico', 'Básico', 'Mejorado'],
  },
];

const accentColors = ['#D85F99', '#1662C6', '#F9A83E'];
const planNames = ['Starter', 'Plus', 'VIP'];
const planPrices = ['S/ 199.17', 'S/ 249.17', 'S/ 299.17'];

export default function ComparisonTable() {
  const [webSwitch, setWebSwitch] = useState(false);

  return (
    <Box sx={{ bgcolor: 'white', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', color: '#012c6d', fontWeight: 700, mb: 4 }}
        >
          Compara las características de nuestros planes
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #dcdfe3', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '35%', fontWeight: 700, color: '#012c6d' }}>
                  <Typography variant="h6" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Comparativa de las características
                  </Typography>
                </TableCell>
                {planNames.map((name, i) => (
                  <TableCell
                    key={name}
                    align="center"
                    sx={{
                      borderTop: `4px solid ${accentColors[i]}`,
                      minWidth: 120,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: accentColors[i], fontWeight: 600 }}>
                      {name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#012c6d', fontWeight: 500 }}>
                      {planPrices[i]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Al mes, con cargo anual
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                if (row.category) {
                  return (
                    <TableRow key={`cat-${idx}`} sx={{ bgcolor: '#f7f9fa' }}>
                      <TableCell colSpan={4}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#012c6d' }}>
                          {row.category}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                }

                const isCheck = (v: string) => v === '✓';
                const isDash = (v: string) => v === '-';

                return (
                  <TableRow
                    key={`row-${idx}`}
                    sx={{ '&:hover': { bgcolor: '#f7f9fa' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#012c6d' }}>
                          {row.feature}
                        </Typography>
                        <Box
                          component="span"
                          sx={{ display: 'inline-flex', cursor: 'pointer' }}
                          title={row.tooltip}
                        >
                          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        </Box>
                      </Box>
                    </TableCell>
                    {row.values.map((val, i) => (
                      <TableCell key={`${idx}-${i}`} align="center">
                        {isCheck(val) ? (
                          <CheckCircleIcon sx={{ color: '#012c6d', fontSize: 18 }} />
                        ) : isDash(val) ? (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#012c6d' }}>
                            {val}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              <TableRow>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={webSwitch}
                        onChange={() => setWebSwitch(!webSwitch)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#3d83df' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3d83df' },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#012c6d' }}>
                          Página web profesional
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          S/55 por mes, con cargo anual
                        </Typography>
                      </Box>
                    }
                  />
                </TableCell>
                {[0, 1, 2].map((i) => (
                  <TableCell key={`switch-${i}`} align="center">
                    <Typography variant="caption" color="text.secondary">
                      Costo adicional
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
