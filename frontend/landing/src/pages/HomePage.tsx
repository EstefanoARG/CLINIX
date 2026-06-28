import { Box } from '@mui/material';
import PricingHero from '../components/sections/PricingHero';
import PricingCards from '../components/sections/PricingCards';
import SupportSection from '../components/sections/SupportSection';
import ComparisonTable from '../components/sections/ComparisonTable';
import ExistingCustomer from '../components/sections/ExistingCustomer';
import FAQ from '../components/sections/FAQ';
import Testimonials from '../components/sections/Testimonials';
import ContactForm from '../components/sections/ContactForm';

export default function HomePage() {
  return (
    <Box>
      <PricingHero />
      <PricingCards />
      <SupportSection />
      <ComparisonTable />
      <ExistingCustomer />
      <Testimonials />
      <FAQ />
      <ContactForm />
    </Box>
  );
}
