import { lazy } from 'react';
import { Alert, Box, Button, Container } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { useLandingData } from '../hooks/useLandingData';
import { HeroSkeleton, CardsSkeleton, StatsSkeleton, TableSkeleton } from '../components/LandingSkeleton';
import PricingHero from '../components/sections/PricingHero';

const PricingCards = lazy(() => import('../components/sections/PricingCards'));
const Stats = lazy(() => import('../components/sections/Stats'));
const ComparisonTable = lazy(() => import('../components/sections/ComparisonTable'));
const Testimonials = lazy(() => import('../components/sections/Testimonials'));
const SupportSection = lazy(() => import('../components/sections/SupportSection'));
const FAQ = lazy(() => import('../components/sections/FAQ'));
const ExistingCustomer = lazy(() => import('../components/sections/ExistingCustomer'));
const ContactForm = lazy(() => import('../components/sections/ContactForm'));

export default function HomePage() {
  const { data, loading, error, retry } = useLandingData();

  if (loading) {
    return (
      <Box>
        <HeroSkeleton />
        <CardsSkeleton />
        <StatsSkeleton />
        <TableSkeleton />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC', p: 3 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            No se pudo cargar el contenido del landing desde la API.
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} />}
            onClick={retry}
            sx={{
              background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
            }}
          >
            Reintentar
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <PricingHero />
      <PricingCards plans={data.plans} />
      <Stats metrics={data.metrics} />
      <ComparisonTable plans={data.plans} rows={data.comparisonRows} />
      <Testimonials reviews={data.testimonials} />
      <SupportSection />
      <FAQ items={data.faqs} />
      <ExistingCustomer />
      <ContactForm />
    </Box>
  );
}
