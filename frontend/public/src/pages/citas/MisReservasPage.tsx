import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import api from '../../services/api';
import type { ReservaWeb } from '../../types';
import { useAuth } from '../../store/AuthContext';

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  Pendiente: 'warning',
  Aprobada: 'info',
  Convertida: 'success',
  Rechazada: 'error',
};

export default function MisReservasPage() {
  const { isAuthenticated } = useAuth();
  const [reservas, setReservas] = useState<ReservaWeb[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get<ReservaWeb[]>('/public/mis-reservas').then(({ data }) => setReservas(data));
    }
  }, [isAuthenticated]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Mis Reservas</Typography>
      {!isAuthenticated ? (
        <Typography color="text.secondary">Debe iniciar sesión para ver sus reservas.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Fecha solicitada</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservas.map((r) => (
              <TableRow key={r.reserva_id}>
                <TableCell>{r.reserva_id}</TableCell>
                <TableCell>{r.especialidad_id}</TableCell>
                <TableCell>{new Date(r.fecha_hora_deseada).toLocaleString()}</TableCell>
                <TableCell><Chip label={r.estado} color={STATUS_COLORS[r.estado] ?? 'default'} size="small" /></TableCell>
              </TableRow>
            ))}
            {reservas.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">No tiene reservas registradas.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
