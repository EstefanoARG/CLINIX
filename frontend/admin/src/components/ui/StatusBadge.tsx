import { Chip } from '@mui/material';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  Activo: 'success',
  Disponible: 'success',
  Pendiente: 'warning',
  Programada: 'info',
  Confirmada: 'success',
  Cancelada: 'error',
  Ocupada: 'error',
  'Dada de Alta': 'success',
  Convertida: 'success',
  Rechazada: 'error',
  Mantenimiento: 'warning',
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? 'default';
  return <Chip label={status} color={color} size="small" />;
}
