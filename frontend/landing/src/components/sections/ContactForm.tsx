import { Box, Container, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';

export default function ContactForm() {
  return (
    <Box
      id="contact"
      sx={{
        bgcolor: '#1b2734',
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: { xs: 3, md: 5 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: '#012c6d', fontWeight: 700, mb: 1, mt: 2 }}
          >
            ¿Aún tienes dudas?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Permítenos resolverlas y ofrecerte una demostración gratuita de nuestra solución.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre(s)"
                required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Apellidos"
                required
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Correo electrónico"
                required
                type="email"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Número de teléfono celular"
                required
                placeholder="Por favor, inserte un número de 10 dígitos"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Horario para contactar"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="¿En dónde necesitas implementar la solución que buscas?"
                required
                defaultValue=""
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
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

          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 2, mb: 2 }}>
            Al enviar tus datos aceptas recibir información de CLINIX Perú a través de correo
            electrónico y WhatsApp.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#3d83df',
              py: 1.5,
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            Enviar
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
