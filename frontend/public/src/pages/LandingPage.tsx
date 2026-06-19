import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <MedicalServicesIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
          Bienvenido a CLINIX
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: 600, mx: 'auto' }}>
          Sistema integral de gestión hospitalaria. Solicite sus citas médicas de forma rápida y sencilla.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={() => navigate('/solicitar-cita')}>
            Solicitar Cita
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
            Ingresar
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CalendarMonthIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Reserva Online</Typography>
              <Typography variant="body2" color="text.secondary">Solicite citas médicas desde la comodidad de su hogar.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Especialistas</Typography>
              <Typography variant="body2" color="text.secondary">Acceda a médicos de diversas especialidades.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <MedicalServicesIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Gestión Integral</Typography>
              <Typography variant="body2" color="text.secondary">Plataforma completa para administración hospitalaria.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
