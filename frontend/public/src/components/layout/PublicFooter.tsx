import { Box, Typography } from '@mui/material';

export default function PublicFooter() {
  return (
    <Box sx={{ textAlign: 'center', py: 2, px: 2 }}>
      <Typography
        variant="body2"
        sx={{
          color: '#94a3b8',
          fontWeight: 500,
          letterSpacing: '0.5px',
          fontSize: '0.85rem',
        }}
      >
        Powered by{' '}
        <Box
          component="span"
          sx={{
            color: '#1565C0',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: '#0D47A1',
            },
          }}
        >
          Clinix
        </Box>
      </Typography>
    </Box>
  );
}
