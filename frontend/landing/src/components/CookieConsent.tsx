import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

const STORAGE_KEY = 'clinix_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        bgcolor: '#0F172A',
        color: '#E2E8F0',
        px: { xs: 2, md: 4 },
        py: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderTop: '1px solid #1E293B',
      }}
    >
      <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', maxWidth: 600 }}>
        Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra Política de privacidad.
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={accept}
        sx={{
          flexShrink: 0,
          background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        Aceptar cookies
      </Button>
    </Box>
  );
}
