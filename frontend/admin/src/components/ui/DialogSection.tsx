import { Box, Typography } from '@mui/material';

interface DialogSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function DialogSection({ icon, title, children }: DialogSectionProps) {
  return (
    <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ color: '#1565C0', display: 'flex', fontSize: 20 }}>{icon}</Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.3 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
