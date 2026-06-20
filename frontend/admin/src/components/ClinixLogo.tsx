import { Box, Typography } from '@mui/material';

interface Props {
  size?: number;
}

export default function ClinixLogo({ size = 36 }: Props) {
  const fontSize = Math.round(size * 1);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: size, height: size, flexShrink: 0 }}>
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <defs>
            <linearGradient id="c-logo" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#2979FF" />
              <stop offset="100%" stopColor="#304FFE" />
            </linearGradient>
          </defs>
          <path d="M40.9 17.8 A18 18 0 1 0 40.9 30.2"
            fill="none" stroke="url(#c-logo)" strokeWidth={7} strokeLinecap="round" />
          <rect x={16} y={22} width={16} height={4} rx={2} fill="#2979FF" />
          <rect x={22} y={16} width={4} height={16} rx={2} fill="#2979FF" />
        </svg>
      </Box>
      <Typography sx={{
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #1A237E 0%, #283593 50%, #1565C0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        letterSpacing: -0.5,
      }}>
        Clinix
      </Typography>
    </Box>
  );
}
