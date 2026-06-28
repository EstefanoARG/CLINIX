import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';

export default function ExistingCustomer() {
  return (
    <Box sx={{ bgcolor: '#e8f4fd', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', color: '#012c6d', fontWeight: 700, mb: 1 }}
        >
          ¿Ya eres cliente?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 4 }}
        >
          Descubre cómo hacer que tu consulta sea aún más exitosa.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              maxWidth: 400,
              textAlign: 'center',
              boxShadow: '0 1px 7px rgba(0,0,0,0.15)',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: '#e8f4fd',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <DevicesIcon sx={{ fontSize: 32, color: '#012c6d' }} />
              </Box>
              <Typography variant="h5" sx={{ color: '#012c6d', fontWeight: 600, mb: 1 }}>
                Página web profesional
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Obtén un sitio web personalizado con todos tus detalles de contacto, acceso a
                reservas en línea y opiniones de pacientes.
              </Typography>
              <Button
                variant="outlined"
                href="#"
                sx={{
                  borderColor: '#3d83df',
                  color: '#3d83df',
                  '&:hover': { bgcolor: 'rgba(61,131,223,0.04)' },
                }}
              >
                Conoce más
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
