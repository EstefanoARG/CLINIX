import { useEffect, useState } from 'react';
import {
  Box, Typography, Dialog, DialogContent, DialogActions,
  Grid, Button, TextField, Snackbar, Alert,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import api from '../../services/api';
import type { ReservaWebOut } from '../../types';
import { DialogSection, InfoField } from './DialogSection';

interface RechazarReservaModalProps {
  open: boolean;
  onClose: () => void;
  reserva: ReservaWebOut | null;
  onRechazada: () => void;
}

export default function RechazarReservaModal({ open, onClose, reserva, onRechazada }: RechazarReservaModalProps) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (open) {
      setMotivo('');
      setSnackbar(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!reserva || !motivo.trim()) return;
    setLoading(true);
    try {
      await api.post(`/reservas/${reserva.reserva_id}/rechazar`, {
        motivo_rechazo: motivo,
      });
      onRechazada();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al rechazar reserva';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', boxShadow: '0px 10px 30px rgba(0,0,0,0.08)' } } }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <CancelIcon sx={{ color: '#E53935', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Rechazar Reserva #{reserva?.reserva_id}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <DialogSection icon={<PersonIcon />} title="Información del Paciente">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><InfoField label="Nombre" value={reserva?.nombre_solicitante ?? '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="DNI" value={reserva?.dni_solicitante ?? '-'} /></Grid>
                <Grid size={{ xs: 12 }}><InfoField label="Fecha deseada" value={reserva?.fecha_hora_deseada ? new Date(reserva.fecha_hora_deseada).toLocaleString() : '-'} /></Grid>
              </Grid>
            </DialogSection>
            <DialogSection icon={<CancelIcon />} title="Motivo de Rechazo">
              <TextField
                label="Motivo de rechazo *"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                multiline
                rows={4}
                fullWidth
                required
                helperText="Este motivo será visible para el paciente"
              />
            </DialogSection>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!motivo.trim() || loading}
            sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#0D47A1' } }}>
            {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snackbar ? <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </>
  );
}
