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
import { Check, Minus, Info } from 'lucide-react';

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
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', color: '#0F172A', fontWeight: 800, mb: 6, fontSize: { xs: '1.5rem', md: '2rem' } }}
        >
          Compara las características de nuestros planes
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06), 0 1px 4px -1px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FFFFFF' }}>
                <TableCell sx={{ width: '35%', fontWeight: 700, color: '#0F172A', py: 2.5, pl: 3 }}>
                  <Typography variant="h6" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, color: '#0F172A' }}>
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
                      py: 2.5,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: accentColors[i], fontWeight: 700, fontSize: '1.05rem' }}>
                      {name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, mt: 0.5 }}>
                      {planPrices[i]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
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
                    <TableRow key={`cat-${idx}`} sx={{ bgcolor: '#DBEAFE' }}>
                      <TableCell colSpan={4} sx={{ py: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.9rem', letterSpacing: '0.02em' }}>
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
                    sx={{
                      '&:hover': { bgcolor: '#F1F5F9' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ py: 2, pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
                          {row.feature}
                        </Typography>
                        {row.tooltip && (
                          <Box
                            component="span"
                            sx={{ display: 'inline-flex', cursor: 'pointer', color: '#94A3B8', '&:hover': { color: '#2563EB' } }}
                            title={row.tooltip}
                          >
                            <Info size={14} />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    {row.values.map((val, i) => (
                      <TableCell key={`${idx}-${i}`} align="center" sx={{ py: 2 }}>
                        {isCheck(val) ? (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#DCFCE7', borderRadius: '50%', width: 26, height: 26 }}>
                            <Check size={14} color="#10B981" strokeWidth={3} />
                          </Box>
                        ) : isDash(val) ? (
                          <Minus size={16} color="#94A3B8" />
                        ) : (
                          <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
                            {val}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              <TableRow>
                <TableCell sx={{ py: 2, pl: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={webSwitch}
                        onChange={() => setWebSwitch(!webSwitch)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#93C5FD' },
                          '& .MuiSwitch-track': { bgcolor: '#E2E8F0' },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          Página web profesional
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          S/55 por mes, con cargo anual
                        </Typography>
                      </Box>
                    }
                  />
                </TableCell>
                {[0, 1, 2].map((i) => (
                  <TableCell key={`switch-${i}`} align="center" sx={{ py: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
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
