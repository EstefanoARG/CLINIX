import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';

export default function LandingLayout() {
  return (
    <Box>
      <Navbar />
      <Box component="main">
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
