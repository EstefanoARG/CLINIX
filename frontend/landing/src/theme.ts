import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#2563EB', light: '#DBEAFE', dark: '#0F4C81' },
    secondary: { main: '#0F4C81' },
    success: { main: '#10B981' },
    error: { main: '#E53935' },
    warning: { main: '#FFA726' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body1: { color: '#475569' },
    body2: { color: '#475569' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          padding: '10px 24px',
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #0A3D6B 100%)',
            boxShadow: '0 8px 25px rgba(37,99,235,0.3)',
          },
        },
        outlined: {
          borderColor: '#DBEAFE',
          color: '#2563EB',
          '&:hover': {
            borderColor: '#2563EB',
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563EB',
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
  },
});

export default theme;
