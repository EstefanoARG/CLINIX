import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, keyframes, Fade } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ClinixLogo from '../../components/ClinixLogo';

const blob1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.08); }
  66% { transform: translate(-20px, 20px) scale(0.92); }
`;

const blob2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-25px, 25px) scale(1.06); }
  66% { transform: translate(20px, -20px) scale(0.94); }
`;

const ADMIN_URL = import.meta.env.VITE_PUBLIC_ADMIN_URL;

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 30%, #90CAF9 60%, #64B5F6 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
        top: '-15%',
        right: '-10%',
        animation: `${blob1} 22s ease-in-out infinite`,
      }} />
      <Box sx={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
        bottom: '-15%',
        left: '-10%',
        animation: `${blob2} 25s ease-in-out infinite`,
      }} />
      <Box sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(21, 101, 192, 0.06) 1px, transparent 0)
        `,
        backgroundSize: '40px 40px',
      }} />

      <Fade in timeout={800}>
        <Box sx={{
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
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px rgba(21, 101, 192, 0.12)',
        }}>
          <ClinixLogo size={80} />

          <Typography variant="h5" sx={{
            fontWeight: 700,
            textAlign: 'center',
            color: '#1565C0',
            letterSpacing: -0.3,
          }}>
            ¡Bienvenido a{' '}
            <Box component="span" sx={{
              background: 'linear-gradient(135deg, #1565C0, #1976D2, #42A5F5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Clinix
            </Box>
            !
          </Typography>

          <Typography variant="body1" sx={{
            color: '#546E7A',
            textAlign: 'center',
            mb: 1,
            letterSpacing: 0.3,
            fontWeight: 400,
          }}>
            Simplifica la gestión de la salud en línea
          </Typography>

          <Button variant="contained" size="large" fullWidth
            startIcon={<CalendarMonthIcon />}
            onClick={() => navigate('/solicitar-cita')}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: 1,
              bgcolor: '#1565C0',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#0D47A1',
                boxShadow: '0 4px 20px rgba(21, 101, 192, 0.35)',
                transform: 'translateY(-1px)',
              },
            }}>
            SOLICITUD CITA
          </Button>

          <Divider sx={{
            width: '100%',
            my: 1,
            borderColor: 'rgba(0, 0, 0, 0.06)',
          }} />

          <Button
            startIcon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={() => { window.location.href = `${ADMIN_URL}/login`; }}
            sx={{
              color: '#78909C',
              fontWeight: 500,
              letterSpacing: 1,
              fontSize: '0.75rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#1565C0',
                background: 'rgba(21, 101, 192, 0.06)',
              },
            }}>
            ACCESO ADMINISTRADOR
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}
