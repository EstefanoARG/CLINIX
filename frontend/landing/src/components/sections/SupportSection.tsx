import { Box, Button, Container, Typography } from '@mui/material';
import { Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupportSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px -12px rgba(0,0,0,0.12), 0 8px 24px -6px rgba(37,99,235,0.08)',
            border: '1px solid rgba(219,234,254,0.5)',
          }}
        >
          <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative' }}>
            <Box
              component="img"
              src="/images/Fundadores.png"
              alt="Equipo de soporte"
              loading="lazy"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(15,76,129,0.25) 100%)',
              }}
            />
          </Box>
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 6 },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#DBEAFE',
                    borderRadius: '12px',
                    width: 40,
                    height: 40,
                  }}
                >
                  <Headphones size={20} color="#2563EB" />
                </Box>
                <Typography
                  variant="overline"
                  sx={{ color: '#2563EB', fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.75rem' }}
                >
                  Soporte dedicado
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: '#0F172A', fontWeight: 800, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.3 }}
              >
                Capacitación y soporte constante incluido en todos los planes
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 4, lineHeight: 1.7, fontSize: '1.05rem' }}>
                Te guiaremos en cada paso. Nuestro equipo estará para ti, desde la configuración de
                tu consulta hasta que domines cada una de las funcionalidades. ¡Obtén ayuda rápida
                y confiable siempre!
              </Typography>
              <Button
                variant="contained"
                href="#contact"
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
                  color: '#fff',
                  px: 4,
                  py: 1.8,
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px -4px rgba(37,99,235,0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #0a3b6a 100%)',
                    boxShadow: '0 12px 32px -4px rgba(37,99,235,0.45)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Contáctanos
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
