import { Box, Container, Typography } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Building2, Users, ShieldCheck, Headphones } from 'lucide-react';
import { useRef } from 'react';

const stats = [
  { icon: Building2, value: 250, suffix: '+', label: 'Clínicas' },
  { icon: Users, value: 40000, suffix: '+', label: 'Pacientes' },
  { icon: ShieldCheck, value: 99.9, suffix: '%', label: 'Disponibilidad' },
  { icon: Headphones, value: 24, suffix: '/7 Soporte', label: '' },
];

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <Box sx={{ bgcolor: '#ffffff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box
          ref={ref}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: { xs: 3, md: 6 },
          }}
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
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
                        end={stat.value}
                        duration={2}
                        decimals={stat.value % 1 !== 0 ? 1 : 0}
                        suffix={stat.suffix}
                      />
                    )}
                    {!isInView && (
                      <span>0{stat.suffix}</span>
                    )}
                  </Typography>

                  {stat.label && (
                    <Typography
                      variant="body1"
                      sx={{ color: '#64748b', fontWeight: 500, mt: 0.5, fontSize: '0.95rem' }}
                    >
                      {stat.label}
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
