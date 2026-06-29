import { Box } from '@mui/material';
import PricingHero from '../components/sections/PricingHero';
import PricingCards from '../components/sections/PricingCards';
import Stats from '../components/sections/Stats';
import ComparisonTable from '../components/sections/ComparisonTable';
import Testimonials from '../components/sections/Testimonials';
import SupportSection from '../components/sections/SupportSection';
import FAQ from '../components/sections/FAQ';
import ExistingCustomer from '../components/sections/ExistingCustomer';
import ContactForm from '../components/sections/ContactForm';

export default function HomePage() {
  return (
    <Box>
      <PricingHero />
      <PricingCards />
      <Stats />
      <ComparisonTable />
      <Testimonials />
      <SupportSection />
      <FAQ />
      <ExistingCustomer />
      <ContactForm />
    </Box>
  );
}
