import { useState } from 'react';
import {
  Box,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow as MuiTableRow,
  Typography,
} from '@mui/material';
import { Check, Info, Minus } from 'lucide-react';
import type { PricingPlan, TableRow } from '../../types';

interface ComparisonTableProps {
  plans: PricingPlan[];
  rows: TableRow[];
}

function isCheckValue(value: string) {
  return ['check', 'true', 'si', 'sí', '✓'].includes(value.trim().toLowerCase());
}

function isDashValue(value: string) {
  return value.trim() === '-';
}

export default function ComparisonTable({ plans, rows }: ComparisonTableProps) {
  const [webSwitch, setWebSwitch] = useState(false);

  if (plans.length === 0 || rows.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', color: '#0F172A', fontWeight: 800, mb: 6, fontSize: { xs: '1.5rem', md: '2rem' } }}
        >
          Compara las caracteristicas de nuestros planes
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
              <MuiTableRow sx={{ bgcolor: '#FFFFFF' }}>
                <TableCell sx={{ width: '35%', fontWeight: 700, color: '#0F172A', py: 2.5, pl: 3 }}>
                  <Typography variant="h6" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, color: '#0F172A' }}>
                    Comparativa de las caracteristicas
                  </Typography>
                </TableCell>
                {plans.map((plan) => (
                  <TableCell
                    key={plan.id}
                    align="center"
                    sx={{ borderTop: `4px solid ${plan.accentColor}`, minWidth: 120, py: 2.5 }}
                  >
                    <Typography variant="subtitle1" sx={{ color: plan.accentColor, fontWeight: 700, fontSize: '1.05rem' }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, mt: 0.5 }}>
                      S/ {(webSwitch ? plan.hiddenPrice : plan.price).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {plan.period}
                    </Typography>
                  </TableCell>
                ))}
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                if (row.category) {
                  return (
                    <MuiTableRow key={`cat-${idx}`} sx={{ bgcolor: '#DBEAFE' }}>
                      <TableCell colSpan={plans.length + 1} sx={{ py: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.9rem' }}>
                          {row.category}
                        </Typography>
                      </TableCell>
                    </MuiTableRow>
                  );
                }

                return (
                  <MuiTableRow key={`row-${idx}`} sx={{ '&:hover': { bgcolor: '#F1F5F9' }, transition: 'background-color 0.15s ease' }}>
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
                    {plans.map((plan, i) => {
                      const value = row.values[i] ?? '';
                      return (
                        <TableCell key={`${row.feature}-${plan.id}`} align="center" sx={{ py: 2 }}>
                          {isCheckValue(value) ? (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#DCFCE7', borderRadius: '50%', width: 26, height: 26 }}>
                              <Check size={14} color="#10B981" strokeWidth={3} />
                            </Box>
                          ) : isDashValue(value) ? (
                            <Minus size={16} color="#94A3B8" />
                          ) : (
                            <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
                              {value}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </MuiTableRow>
                );
              })}

              <MuiTableRow>
                <TableCell sx={{ py: 2, pl: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={webSwitch}
                        onChange={() => setWebSwitch((value) => !value)}
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
                          Pagina web profesional
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          S/55 por mes, con cargo anual
                        </Typography>
                      </Box>
                    }
                  />
                </TableCell>
                {plans.map((plan) => (
                  <TableCell key={`switch-${plan.id}`} align="center" sx={{ py: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                      Costo adicional
                    </Typography>
                  </TableCell>
                ))}
              </MuiTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
