import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import PricingHero from '../components/sections/PricingHero';
import PricingCards from '../components/sections/PricingCards';
import Stats from '../components/sections/Stats';
import ComparisonTable from '../components/sections/ComparisonTable';
import Testimonials from '../components/sections/Testimonials';
import SupportSection from '../components/sections/SupportSection';
import FAQ from '../components/sections/FAQ';
import ExistingCustomer from '../components/sections/ExistingCustomer';
import ContactForm from '../components/sections/ContactForm';
import { getLandingData } from '../services/landingApi';
import type { LandingData } from '../types';

export default function HomePage() {
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLandingData()
      .then((data) => {
        setLandingData(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !landingData) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC', p: 3 }}>
        <Alert severity="error">No se pudo cargar el contenido del landing desde la API.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PricingHero />
      <PricingCards plans={landingData.plans} />
      <Stats metrics={landingData.metrics} />
      <ComparisonTable plans={landingData.plans} rows={landingData.comparisonRows} />
      <Testimonials reviews={landingData.testimonials} />
      <SupportSection />
      <FAQ items={landingData.faqs} />
      <ExistingCustomer />
      <ContactForm />
    </Box>
  );
}
