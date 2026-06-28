import { Box, Container, Typography } from '@mui/material';

export default function PricingHero() {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        py: { xs: 6, md: 10 },
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#012c6d',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            lineHeight: 1.2,
            mb: 2,
          }}
        >
          Elige el plan que se adapte a tus objetivos
        </Typography>
        <Typography variant="h6" sx={{ color: '#012c6d', fontWeight: 400 }}>
          O prueba nuestro{' '}
          <Box
            component="a"
            href="#"
            sx={{ color: '#3d83df', textDecoration: 'underline', cursor: 'pointer' }}
          >
            perfil gratuito
          </Box>
          .
        </Typography>
      </Container>
    </Box>
  );
}
