import type { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function PageHeader({ title, actionLabel, onAction, children }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {children}
        {actionLabel && onAction && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
