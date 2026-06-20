import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

export default function PublicLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
      <Box component="footer" sx={{ bgcolor: 'grey.100', py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; CLINIX — Todos los derechos reservados
        </Typography>
      </Box>
    </Box>
  );
}
