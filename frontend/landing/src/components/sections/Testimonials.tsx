import { Box, Container, Typography, Avatar, Card, CardContent } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface Review {
  name: string;
  specialty: string;
  location: string;
  avatar: string;
  text: string;
}

const reviews: Review[] = [
  {
    name: 'Dr. Ricardo Muñoz Leon',
    specialty: 'Pediatra',
    location: 'Lima',
    avatar: 'https://pro.clinix.pe/hubfs/2021%20DOC%20FAC%20merge%20project/Peru/Customers/Headshots/pe-headshot-ricardo-munoz-leon.png',
    text: 'Soy Pediatra y puedo dar fe de que luego de utilizar las herramientas de CLINIX he visto un gran crecimiento en mi lista de pacientes. Esta plataforma superó mis expectativas, ahora tengo una mejor comunicación con mis pacientes y cuento con un sistema de mensajes automáticos que es muy fácil de usar. ¡Y todo por un costo muy accesible!',
  },
  {
    name: 'Dr. Ruslan Golovliov',
    specialty: 'Gastroenterólogo',
    location: 'Lima',
    avatar: 'https://pro.clinix.pe/hubfs/2021%20DOC%20FAC%20merge%20project/Peru/Customers/Headshots/pe-headshot-ruslan-golovliov.png',
    text: 'CLINIX me ha ayudado a retener mis pacientes. Ellos recurren a mí cada vez más para agendar una consulta en línea.',
  },
  {
    name: 'Dr. Juan Manuel Menéndez',
    specialty: 'Cardiólogo',
    location: 'Lima',
    avatar: 'https://pro.clinix.pe/hubfs/2021%20DOC%20FAC%20merge%20project/Peru/Customers/Headshots/pe-headshot-juan-manuel-menendez.png',
    text: 'Las opiniones me han servido mucho para mejorar mi presencia en Internet. CLINIX me facilita recibir buenas recomendaciones sobre mis servicios y atención como médico.',
  },
];

export default function Testimonials() {
  return (
    <Box sx={{ bgcolor: '#f7f9fa', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {reviews.map((review, idx) => (
            <Card
              key={idx}
              sx={{
                minWidth: { xs: '80vw', sm: 450 },
                maxWidth: 500,
                boxShadow: '0 1px 7px rgba(0,0,0,0.15)',
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  <FormatQuoteIcon sx={{ color: '#e0e0e0', fontSize: 36 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#012c6d', mb: 3, flex: 1, lineHeight: 1.6 }}
                >
                  {review.text}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={review.avatar}
                    alt={review.name}
                    sx={{ width: 50, height: 50 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#012c6d', fontWeight: 500 }}>
                      {review.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {review.specialty}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.location}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
