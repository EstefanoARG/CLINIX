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
      component="section"
      sx={{
        background: 'linear-gradient(180deg, #F8FAFC 0%, #DBEAFE 50%, #F8FAFC 100%)',
        py: { xs: 8, md: 10 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 6, md: 8 },
        }}>
          <Box sx={{ flex: '1 1 50%', textAlign: { xs: 'center', md: 'left' } }}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <HeartPulse size={20} color="#2563EB" />
                  <Typography
                    variant="subtitle2"
                    component="span"
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
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: '#0F4C81',
                    fontSize: { xs: '2rem', md: '2.75rem' },
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
                  sx={{
                    color: '#475569',
                    fontWeight: 400,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    maxWidth: 520,
                    mb: 5,
                    lineHeight: 1.7,
                  }}
                >
                  Optimiza cada aspecto de tu clínica con herramientas de agendamiento,
                  historias clínicas digitales, admisiones hospitalarias y más.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: 2,
                    mb: { xs: 6, md: 8 },
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarCheck size={20} />}
                    href="#contact"
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
                    href="#pricing"
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
                  sx={{
                    fontWeight: 700,
                    color: '#0F4C81',
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    mb: 0.5,
                  }}
                >
                  Elige el plan que se adapte a tus objetivos
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', fontWeight: 400 }}>
                  O prueba nuestro{' '}
                  <Box
                    component="a"
                    href="#pricing"
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
          </Box>

          <Box sx={{ flex: '1 1 50%', display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            >
              <Box
                component="img"
                src="/images/hero-doctor.jpg"
                alt="Doctor usando tablet con paciente — Sistema de gestión CLINIX"
                loading="eager"
                sx={{
                  width: '100%',
                  maxWidth: 540,
                  height: 'auto',
                  borderRadius: '24px',
                  boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15), 0 8px 24px -6px rgba(37,99,235,0.12)',
                  display: 'block',
                  ml: 'auto',
                }}
              />
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
