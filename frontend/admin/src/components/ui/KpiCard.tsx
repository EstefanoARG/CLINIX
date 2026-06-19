import type { ReactNode } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color?: string;
}

export default function KpiCard({ title, value, icon, color = 'primary.main' }: KpiCardProps) {
  return (
    <Card sx={{ minWidth: 180, flex: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
