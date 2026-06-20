import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Divider } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClinixLogo from '../../components/ClinixLogo';

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 50%, #E3F2FD 0%, #BBDEFB 40%, #90CAF9 70%, #64B5F6 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      },
    }}>
      <Paper elevation={6} sx={{
        width: 420,
        maxWidth: '90vw',
        p: 5,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2.5,
        position: 'relative',
        zIndex: 1,
      }}>
        <ClinixLogo size={64} />

        <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
          ¡Bienvenido a Clinix!
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 1 }}>
          Simplifica la gestión de la salud en línea
        </Typography>

        <Button variant="contained" size="large" fullWidth
          startIcon={<CalendarMonthIcon />}
          onClick={() => navigate('/solicitar-cita')}
          sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, letterSpacing: 1 }}>
          SOLICITUD CITA
        </Button>

        <Divider sx={{ width: '100%', my: 1 }} />

        <Button variant="text" size="small"
          onClick={() => navigate('/admin/login')}
          sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: 1, fontSize: '0.75rem' }}>
          ACCESO ADMINISTRADOR
        </Button>
      </Paper>
    </Box>
  );
}
