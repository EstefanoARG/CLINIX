import { useEffect, useState } from 'react';
import {
  Box, Typography, Dialog, DialogContent, DialogActions,
  Grid, Button, TextField, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import api from '../../services/api';
import type { Cita, UbicacionFisica } from '../../types';
import { DialogSection, InfoField } from './DialogSection';

const ESTADOS_CITA = ['Programada', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió'];

interface EditarCitaModalProps {
  open: boolean;
  onClose: () => void;
  cita: Cita | null;
  onActualizada: () => void;
}

export default function EditarCitaModal({ open, onClose, cita, onActualizada }: EditarCitaModalProps) {
  const [fechaHora, setFechaHora] = useState('');
  const [estadoCita, setEstadoCita] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [ubicacionId, setUbicacionId] = useState(0);
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (open && cita) {
      setFechaHora(cita.fecha_hora ? new Date(cita.fecha_hora).toISOString().slice(0, 16) : '');
      setEstadoCita(cita.estado_cita);
      setObservaciones(cita.observaciones ?? '');
      setUbicacionId(cita.ubicacion_id ?? 0);
      setSnackbar(null);
      api.get<UbicacionFisica[]>('/ubicaciones')
        .then(({ data }) => setUbicaciones(data))
        .catch(() => {});
    }
  }, [open, cita]);

  const handleSubmit = async () => {
    if (!cita) return;
    setLoading(true);
    try {
      await api.put(`/citas/${cita.cita_id}`, {
        fecha_hora: fechaHora ? new Date(fechaHora).toISOString() : undefined,
        estado_cita: estadoCita || undefined,
        observaciones: observaciones || undefined,
        ubicacion_id: ubicacionId > 0 ? ubicacionId : undefined,
      });
      onActualizada();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al actualizar cita';
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
          <EditIcon sx={{ color: '#1565C0', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Editar Cita #{cita?.cita_id}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <DialogSection icon={<PersonIcon />} title="Información actual">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><InfoField label="Paciente" value={cita?.paciente_nombre ?? '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="Médico" value={cita?.medico_nombre ?? '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="Especialidad" value={cita?.especialidad_nombre ?? '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="Motivo consulta" value={cita?.motivo_consulta ?? '-'} /></Grid>
              </Grid>
            </DialogSection>
            <DialogSection icon={<CalendarMonthIcon />} title="Editar datos">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Fecha y Hora"
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select value={estadoCita} label="Estado" onChange={(e) => setEstadoCita(e.target.value)}>
                    {ESTADOS_CITA.map((est) => (
                      <MenuItem key={est} value={est}>{est}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  select label="Ubicación" value={ubicacionId}
                  onChange={(e) => setUbicacionId(Number(e.target.value))} fullWidth
                >
                  <MenuItem value={0}>Sin ubicación</MenuItem>
                  {ubicaciones.map((u) => (
                    <MenuItem key={u.ubicacion_id} value={u.ubicacion_id}>
                      {u.nombre} {u.piso ? `(${u.piso})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Observaciones" value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  multiline rows={3} fullWidth
                />
              </Box>
            </DialogSection>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}
            sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#0D47A1' } }}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snackbar ? <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </>
  );
}
