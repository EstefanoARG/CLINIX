import { Box, Container, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 800, color: '#0F4C81', mb: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
          >
            Lo que dicen nuestros usuarios
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: '#64748b', mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Médicos reales, resultados reales
          </Typography>
        </motion.div>

        <Box ref={emblaRef} sx={{ overflow: 'hidden', cursor: 'grab' }}>
          <Box sx={{ display: 'flex', touchAction: 'pan-y' }}>
            {reviews.map((review, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: '0 0 100%',
                  minWidth: 0,
                  px: { xs: 1, md: 4 },
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#ffffff',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
                    p: { xs: 3, md: 5 },
                    border: '1px solid #f1f5f9',
                    textAlign: 'center',
                  }}
                >
                  <Quote size={32} style={{ color: '#DBEAFE', marginBottom: 16 }} />

                  <Typography
                    variant="body1"
                    sx={{ color: '#334155', lineHeight: 1.7, mb: 4, fontStyle: 'italic', fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                  >
                    "{review.text}"
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    <Avatar
                      src={review.avatar}
                      alt={review.name}
                      sx={{ width: 52, height: 52, border: '2px solid #DBEAFE' }}
                    />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle1" sx={{ color: '#0F4C81', fontWeight: 600, lineHeight: 1.2 }}>
                        {review.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 500 }}>
                        {review.specialty}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {review.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 4 }}>
          {reviews.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              sx={{
                width: selectedIndex === idx ? 28 : 10,
                height: 10,
                borderRadius: 5,
                bgcolor: selectedIndex === idx ? '#2563EB' : '#DBEAFE',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
