import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { CalendarCheck, ArrowRight, HeartPulse, Activity } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 } as const,
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function HeroSection() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #F8FAFC 0%, #DBEAFE 50%, #F8FAFC 100%)',
        py: { xs: 8, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          right: '-8%',
          width: { xs: 250, md: 500 },
          height: { xs: 250, md: 500 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          left: '8%',
          width: { xs: 120, md: 250 },
          height: { xs: 120, md: 250 },
          borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                mb: 3,
              }}
            >
              <HeartPulse size={20} color="#2563EB" />
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#2563EB',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                }}
              >
                CLINIX — Gestión Hospitalaria
              </Typography>
              <Activity size={20} color="#2563EB" />
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#0F4C81',
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.15,
                mb: 3,
                letterSpacing: '-0.02em',
              }}
            >
              El sistema de gestión hospitalaria que tu clínica merece
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              sx={{
                color: '#475569',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.15rem' },
                maxWidth: 640,
                mx: 'auto',
                mb: 5,
                lineHeight: 1.7,
              }}
            >
              Optimiza cada aspecto de tu clínica con herramientas de agendamiento, telemedicina,
              historias clínicas digitales y facturación, todo en un solo lugar.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 8,
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<CalendarCheck size={20} />}
                href="#"
                sx={{
                  background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8, #0A3A6B)',
                    boxShadow: '0 6px 24px rgba(37,99,235,0.4)',
                  },
                }}
              >
                Solicitar demostración
              </Button>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowRight size={20} />}
                href="#"
                sx={{
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#1D4ED8',
                    bgcolor: 'rgba(37,99,235,0.04)',
                    borderWidth: 2,
                  },
                }}
              >
                Ver planes
              </Button>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#0F4C81',
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                mb: 1.5,
              }}
            >
              Elige el plan que se adapte a tus objetivos
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 400 }}>
              O prueba nuestro{' '}
              <Box
                component="a"
                href="#"
                sx={{
                  color: '#2563EB',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { color: '#1D4ED8' },
                }}
              >
                perfil gratuito
              </Box>
              .
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
