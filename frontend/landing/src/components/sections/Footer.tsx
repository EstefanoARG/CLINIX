import { Box, Container, Typography, Button, Grid, Link, Divider } from '@mui/material';

const countryLinks = [
  { label: 'Polonia', href: 'https://pro.znanylekarz.pl/' },
  { label: 'Turquía', href: 'https://pro.doktortakvimi.com/' },
  { label: 'España', href: 'https://pro.clinix.es/' },
  { label: 'Italia', href: 'https://pro.miodottore.it/' },
  { label: 'Alemania', href: 'https://pro.jameda.de/' },
  { label: 'República Checa', href: 'https://pro.znamylekar.cz/' },
  { label: 'Portugal', href: 'https://www.clinix.com.pt/' },
  { label: 'México', href: 'https://pro.clinix.com.mx/' },
  { label: 'Chile', href: 'https://pro.clinix.cl/' },
  { label: 'Brasil', href: 'https://pro.clinix.com.br/' },
  { label: 'Argentina', href: 'https://pro.clinix.com/ar' },
  { label: 'Perú', href: 'https://pro.clinix.pe/' },
  { label: 'Colombia', href: 'https://pro.clinix.co/' },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'white', py: { xs: 6, md: 8 }, px: { xs: 2, md: 0 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" sx={{ color: '#012c6d', fontWeight: 700, mb: 2 }}>
              CLINIX
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              CLINIX Internet SL
              <br />
              C/ Josep Pla 2 - Edificio B2, planta 13
              <br />
              08019 Barcelona, España
            </Typography>
            <Button
              variant="outlined"
              href="#contact"
              sx={{
                borderColor: '#3d83df',
                color: '#3d83df',
                '&:hover': { bgcolor: 'rgba(61,131,223,0.04)' },
              }}
            >
              Contáctanos
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: { xs: '50%', sm: 'auto' } }}>
                <Typography variant="subtitle2" sx={{ color: '#012c6d', mb: 1 }}>
                  Más vistos
                </Typography>
                <Link href="#" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Producto
                </Link>
                <Link href="#pricing" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Precios
                </Link>
                <Link href="#" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Guías
                </Link>
                <Link href="#faq" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                  Preguntas frecuentes
                </Link>
              </Box>
              <Box sx={{ width: { xs: '50%', sm: 'auto' } }}>
                <Typography variant="subtitle2" sx={{ color: '#012c6d', mb: 1 }}>
                  CLINIX
                </Typography>
                <Link href="#" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Quiénes somos
                </Link>
                <Link href="#" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Términos y condiciones
                </Link>
                <Link href="#" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Protección de datos
                </Link>
                <Link href="#" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                  Activar telemedicina
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            mb: 2,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 2, md: 0 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              clinix.pe © 2026 - ¡Agenda tu consulta online!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Para proporcionar nuestros servicios, utilizamos cookies tal y como se establece en
              nuestra Política de privacidad.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            Somos líderes en 13 países:
          </Typography>
          {countryLinks.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target="_blank"
              variant="caption"
              color="text.secondary"
              sx={{ mx: 0.5, whiteSpace: 'nowrap' }}
            >
              {c.label}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
