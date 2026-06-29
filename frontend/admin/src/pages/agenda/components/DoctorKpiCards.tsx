import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { CalendarCheck, TrendingUp, Clock } from 'lucide-react';

interface DoctorKpiCardsProps {
  totalPendientes: number;
  totalAtendidos: number;
  totalCancelados: number;
}

const cards = [
  {
    key: 'pendientes',
    label: 'Pendientes',
    icon: CalendarCheck,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    accentColor: '#F59E0B',
    textColor: '#92400E',
  },
  {
    key: 'atendidos',
    label: 'Atendidos',
    icon: TrendingUp,
    iconBg: '#D1FAE5',
    iconColor: '#059669',
    accentColor: '#10B981',
    textColor: '#065F46',
  },
  {
    key: 'cancelados',
    label: 'Cancelados',
    icon: Clock,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    accentColor: '#EF4444',
    textColor: '#991B1B',
  },
];

export default function DoctorKpiCards({
  totalPendientes,
  totalAtendidos,
  totalCancelados,
}: DoctorKpiCardsProps) {
  const values: Record<string, number> = {
    pendientes: totalPendientes,
    atendidos: totalAtendidos,
    cancelados: totalCancelados,
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      {cards.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: cards.findIndex((c) => c.key === key) * 0.06 }}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 1.5,
              p: 1.25,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: iconColor,
                boxShadow: `0 2px 8px ${iconColor}15`,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: iconBg,
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={iconColor} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2, color: '#0F172A' }}>
                {values[key]}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#64748B', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                {label}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}
