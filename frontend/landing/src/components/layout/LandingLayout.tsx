import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import ScrollToTop from '../ScrollToTop';

export default function LandingLayout() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navbar />
      <Box component="main">
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
