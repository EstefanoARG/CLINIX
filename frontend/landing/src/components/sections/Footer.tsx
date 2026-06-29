import { Box, Container, Typography, Button, Grid, Link, Divider } from '@mui/material';
import { HeartPulse, ExternalLink } from 'lucide-react';

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
    <Box component="footer" sx={{ bgcolor: '#0F172A', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <HeartPulse size={28} color="#2563EB" strokeWidth={2} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                CLINIX
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: '#94A3B8', mb: 2, lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}
            >
              CLINIX Internet SL
              <br />
              C/ Josep Pla 2 - Edificio B2, planta 13
              <br />
              08019 Barcelona, España
            </Typography>
            <Button
              variant="outlined"
              href="#contact"
              endIcon={<ExternalLink size={16} />}
              sx={{
                borderColor: '#334155',
                color: '#E2E8F0',
                '&:hover': {
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  bgcolor: 'rgba(37,99,235,0.06)',
                },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                px: 3,
              }}
            >
              Contáctanos
            </Button>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
              <Box
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#2563EB', color: '#FFFFFF' },
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </Box>
              <Box
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#2563EB', color: '#FFFFFF' },
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17a4.77 4.77 0 00-8.13 4.35C7.16 9.4 4.07 7.88 2 5.56a4.77 4.77 0 001.48 6.38c-.77-.02-1.5-.24-2.13-.59v.06a4.77 4.77 0 003.83 4.68c-.7.2-1.44.22-2.16.08a4.78 4.78 0 004.46 3.32A9.58 9.58 0 010 21.54a13.5 13.5 0 007.33 2.15c8.8 0 13.62-7.3 13.62-13.63 0-.2 0-.42-.02-.63A9.7 9.7 0 0024 6.56a9.5 9.5 0 01-2.54.7z"/></svg>
              </Box>
              <Box
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#2563EB', color: '#FFFFFF' },
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 3.55A10 10 0 0110 21.5.5.5 0 019.5 21v-1.36H8.2a1.2 1.2 0 01-1.2-1.2v-1.76a1.2 1.2 0 00-1.2-1.2H4.5a1.5 1.5 0 01-1.5-1.5v-2.56a1.5 1.5 0 011.5-1.5h1.3a1.2 1.2 0 001.2-1.2V8.2a1.2 1.2 0 011.2-1.2h1.3a3.5 3.5 0 01.93-2.33 10 10 0 0110 2.88z"/></svg>
              </Box>
              <Box
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#2563EB', color: '#FFFFFF' },
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-.5 3h-2.3c-1.8 0-2.2.86-2.2 2.12V10.6h4.4l-.57 4.45h-3.83V21h-4.6v-5.95H5.9v-4.45h3.5V7.82c0-3.48 2.12-5.38 5.22-5.38 1.5 0 2.78.11 3.16.16v2.4z"/></svg>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, sm: 8 } }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Más vistos
                </Typography>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', mb: 0.75, textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Producto
                </Link>
                <Link
                  href="#pricing"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', mb: 0.75, textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Precios
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', mb: 0.75, textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Guías
                </Link>
                <Link
                  href="#faq"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Preguntas frecuentes
                </Link>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  CLINIX
                </Typography>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', mb: 0.75, textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Quiénes somos
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', mb: 0.75, textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Términos y condiciones
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', mb: 0.75, textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Protección de datos
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: '#94A3B8', display: 'block', textDecoration: 'none', '&:hover': { color: '#2563EB' }, fontFamily: 'Inter, sans-serif' }}
                >
                  Activar telemedicina
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5, borderColor: '#1E293B' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 3,
            gap: { xs: 1.5, md: 0 },
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: '#64748B', display: 'block', fontFamily: 'Inter, sans-serif' }}
          >
            clinix.pe © 2026 - ¡Agenda tu consulta online!
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#475569', display: 'block', fontFamily: 'Inter, sans-serif' }}
          >
            Para proporcionar nuestros servicios, utilizamos cookies tal y como se establece en
            nuestra Política de privacidad.
          </Typography>
        </Box>

        <Box
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}
        >
          <Typography
            variant="caption"
            sx={{ color: '#64748B', mr: 1, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
          >
            Somos líderes en 13 países:
          </Typography>
          {countryLinks.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target="_blank"
              variant="caption"
              sx={{
                color: '#64748B',
                mx: 0.5,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                '&:hover': { color: '#2563EB' },
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {c.label}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
