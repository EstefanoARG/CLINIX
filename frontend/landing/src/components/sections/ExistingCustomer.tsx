import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Monitor, ArrowRight } from 'lucide-react';

export default function ExistingCustomer() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{ textAlign: 'center', color: '#0F4C81', fontWeight: 700, mb: 1 }}
          >
            ¿Ya eres cliente?
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: '#475569', mb: 4 }}
          >
            Descubre cómo hacer que tu consulta sea aún más exitosa.
          </Typography>

          <Card
            sx={{
              background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.1)',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Monitor size={32} color="#2563EB" />
              </Box>
              <Typography variant="h5" sx={{ color: '#0F4C81', fontWeight: 700, mb: 1 }}>
                Página web profesional
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}
              >
                Obtén un sitio web personalizado con todos tus detalles de contacto, acceso a
                reservas en línea y opiniones de pacientes.
              </Typography>
              <Button
                variant="contained"
                endIcon={<ArrowRight size={18} />}
                href="#"
                sx={{
                  background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8, #0A3A6B)',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                  },
                }}
              >
                Conoce más
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
