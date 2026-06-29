import { Box, Container, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactForm() {
  return (
    <Box
      id="contact"
      sx={{
        bgcolor: '#0F172A',
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: { xs: 3, md: 5 },
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4), 0 8px 24px -6px rgba(0,0,0,0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, mt: 1 }}>
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
                <MessageCircle size={20} color="#2563EB" />
              </Box>
              <Typography
                variant="h4"
                sx={{ color: '#0F172A', fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.75rem' } }}
              >
                ¿Aún tienes dudas?
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, ml: { xs: 0, sm: 7 }, fontSize: '1rem' }}>
              Permítenos resolverlas y ofrecerte una demostración gratuita de nuestra solución.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre(s)"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#2563EB' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#2563EB' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  required
                  type="email"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#2563EB' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Número de teléfono celular"
                  required
                  placeholder="Por favor, inserte un número de 10 dígitos"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#2563EB' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Horario para contactar"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#2563EB' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="¿En dónde necesitas implementar la solución que buscas?"
                  required
                  defaultValue=""
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#2563EB' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
                  }}
                >
                  <MenuItem value="" disabled>- Seleccionar -</MenuItem>
                  <MenuItem value="private">En mi propio consultorio</MenuItem>
                  <MenuItem value="clinic">En una clínica / centro de salud / hospital</MenuItem>
                  <MenuItem value="lab">En centro de diagnóstico / laboratorio</MenuItem>
                  <MenuItem value="agency">Para mis clientes, represento a una agencia</MenuItem>
                  <MenuItem value="partnership">Busco una alianza con CLINIX</MenuItem>
                  <MenuItem value="patient">Soy un paciente que quiere reservar una cita</MenuItem>
                  <MenuItem value="other">Otro</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 2.5, mb: 3, lineHeight: 1.5 }}>
              Al enviar tus datos aceptas recibir información de CLINIX Perú a través de correo
              electrónico y WhatsApp.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
                py: 1.8,
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
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
              Enviar
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
