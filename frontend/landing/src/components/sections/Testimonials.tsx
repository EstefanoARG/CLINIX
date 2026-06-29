import { useCallback, useEffect, useState } from 'react';
import { Avatar, Box, Container, Typography } from '@mui/material';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Review } from '../../types';

interface TestimonialsProps {
  reviews: Review[];
}

export default function Testimonials({ reviews }: TestimonialsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: reviews.length > 1, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return undefined;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (reviews.length === 0) return null;

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
            Medicos reales, resultados reales
          </Typography>
        </motion.div>

        <Box ref={emblaRef} sx={{ overflow: 'hidden', cursor: reviews.length > 1 ? 'grab' : 'default' }}>
          <Box sx={{ display: 'flex', touchAction: 'pan-y' }}>
            {reviews.map((review, idx) => (
              <Box key={`${review.name}-${idx}`} sx={{ flex: '0 0 100%', minWidth: 0, px: { xs: 1, md: 4 } }}>
                <Box
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '24px',
                    p: { xs: 4, md: 5 },
                    textAlign: 'center',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                  }}
                >
                  <Quote size={32} color="#2563EB" style={{ marginBottom: 16 }} />
                  <Typography
                    variant="body1"
                    sx={{ color: '#334155', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.1rem' }, mb: 3, fontStyle: 'italic' }}
                  >
                    "{review.text}"
                  </Typography>
                  <Avatar
                    src={review.avatar ?? undefined}
                    alt={review.name}
                    sx={{ width: 72, height: 72, mx: 'auto', mb: 2, border: '3px solid #DBEAFE' }}
                  >
                    {review.name.slice(0, 1)}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {review.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {review.specialty} | {review.location}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {reviews.length > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
            {reviews.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: selectedIndex === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: selectedIndex === idx ? '#2563EB' : '#CBD5E1',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
