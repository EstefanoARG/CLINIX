import { Box, Button, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC' }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{ fontWeight: 800, fontSize: { xs: '5rem', md: '7rem' }, color: '#2563EB', lineHeight: 1, mb: 2 }}
            >
              404
            </Typography>
            <Typography variant="h4" sx={{ color: '#0F4C81', fontWeight: 700, mb: 2 }}>
              Página no encontrada
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', mb: 5, maxWidth: 400, mx: 'auto' }}>
              La página que buscas no existe o ha sido movida. Revisa la URL o vuelve al inicio.
            </Typography>
            <Button
              variant="contained"
              href="/"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Volver al inicio
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
