import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    secondary: { main: '#26A69A' },
    error: { main: '#E53935' },
    warning: { main: '#FFA726' },
    background: { default: '#F5F7FA' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#F5F7FA',
          },
        },
      },
    },
  },
});

export default theme;
