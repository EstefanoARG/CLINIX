import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useAuth } from '../../store/AuthContext';

export default function PublicLayout() {
  const { isAuthenticated, nombre, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'primary.main' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, cursor: 'pointer', mr: 'auto' }}
              onClick={() => navigate('/')}
            >
              CLINIX
            </Typography>
            <Button color="inherit" onClick={() => navigate('/medicos')}>Médicos</Button>
            <Button color="inherit" onClick={() => navigate('/solicitar-cita')}>Sacar Cita</Button>
            {isAuthenticated ? (
              <>
                <Button color="inherit" onClick={() => navigate('/mis-reservas')}>
                  Mis Reservas
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {nombre}
                </Typography>
                <Button variant="outlined" size="small" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button variant="contained" size="small" onClick={() => navigate('/login')}>
                Ingresar
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
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
