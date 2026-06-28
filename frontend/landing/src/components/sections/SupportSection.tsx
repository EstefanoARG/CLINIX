import { Box, Button, Container, Typography } from '@mui/material';

export default function SupportSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            bgcolor: '#e8f4fd',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Box
              component="img"
              src="/images/Fundadores.png"
              alt="Equipo de soporte"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              px: { xs: 3, md: 4 },
              py: { xs: 4, md: 6 },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ color: '#012c6d', fontWeight: 700, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}
              >
                Capacitación y soporte constante incluido en todos los planes
              </Typography>
              <Typography variant="body1" sx={{ color: '#012c6d', mb: 3 }}>
                Te guiaremos en cada paso. Nuestro equipo estará para ti, desde la importación de
                tus contactos hasta que domines cada una de las funcionalidades. ¡Obtén ayuda rápida
                y confiable siempre!
              </Typography>
              <Button
                variant="outlined"
                href="#contact"
                sx={{
                  borderColor: '#012c6d',
                  color: '#012c6d',
                  px: 4,
                  py: 1.5,
                  '&:hover': { bgcolor: 'rgba(1,44,109,0.04)' },
                }}
              >
                Contáctanos
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
