import { useRef } from 'react';
import type { ElementType } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Building2, Headphones, ShieldCheck, Users } from 'lucide-react';
import type { LandingMetric } from '../../types';

const metricIcons: Record<string, ElementType> = {
  building: Building2,
  clinics: Building2,
  users: Users,
  patients: Users,
  shield: ShieldCheck,
  headphones: Headphones,
};

interface StatsProps {
  metrics: LandingMetric[];
}

export default function Stats({ metrics }: StatsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  if (metrics.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#ffffff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box
          ref={ref}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: `repeat(${Math.min(metrics.length, 4)}, 1fr)` },
            gap: { xs: 3, md: 6 },
          }}
        >
          {metrics.map((metric, idx) => {
            const Icon = metricIcons[metric.icon] ?? ShieldCheck;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                    borderRadius: '1rem',
                    bgcolor: '#ffffff',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(37,99,235,0.08)',
                      borderColor: '#DBEAFE',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Icon size={26} color="#2563EB" />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: '#0F4C81', fontSize: { xs: '1.75rem', md: '2.25rem' }, lineHeight: 1.2 }}
                  >
                    {isInView && (
                      <CountUp
                        end={metric.value}
                        duration={2}
                        decimals={metric.value % 1 !== 0 ? 1 : 0}
                        suffix={metric.suffix}
                      />
                    )}
                  </Typography>
                  {metric.label && (
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
                      {metric.label}
                    </Typography>
                  )}
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
