import { useEffect, useState } from 'react';
import {
  Box, Typography, Dialog, DialogContent, DialogActions,
  Grid, Button, TextField, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../../services/api';
import type { ReservaWebOut, UbicacionFisica } from '../../types';
import { DialogSection, InfoField } from './DialogSection';

interface ConvertirCitaModalProps {
  open: boolean;
  onClose: () => void;
  reserva: ReservaWebOut | null;
  onConvertida: () => void;
  departamentos: { departamento_id: number; nombre: string }[];
}

export default function ConvertirCitaModal({ open, onClose, reserva, onConvertida, departamentos }: ConvertirCitaModalProps) {
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [departamentoId, setDepartamentoId] = useState(0);
  const [ubicacionId, setUbicacionId] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchUbicaciones = (departamento_id?: number) => {
    const url = departamento_id && departamento_id > 0
      ? `/ubicaciones?departamento_id=${departamento_id}`
      : '/ubicaciones';
    api.get<UbicacionFisica[]>(url).then(({ data }) => setUbicaciones(data));
  };

  useEffect(() => {
    if (open) {
      setUbicacionId(0);
      setDepartamentoId(0);
      setObservaciones('');
      setSnackbar(null);
      fetchUbicaciones();
    }
  }, [open]);

  const handleDepartamentoChange = (id: number) => {
    setDepartamentoId(id);
    setUbicacionId(0);
    fetchUbicaciones(id > 0 ? id : undefined);
  };

  const handleSubmit = async () => {
    if (!reserva || ubicacionId === 0) return;
    setLoading(true);
    try {
      await api.post(`/reservas/${reserva.reserva_id}/convertir`, {
        ubicacion_id: ubicacionId,
        observaciones: observaciones || undefined,
      });
      onConvertida();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al convertir reserva';
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
          <CheckCircleIcon sx={{ color: '#43A047', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Convertir Reserva #{reserva?.reserva_id} a Cita</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <DialogSection icon={<PersonIcon />} title="Información del Paciente">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><InfoField label="Nombre" value={reserva?.nombre_solicitante ?? '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="DNI" value={reserva?.dni_solicitante ?? '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="Fecha deseada" value={reserva?.fecha_hora_deseada ? new Date(reserva.fecha_hora_deseada).toLocaleString() : '-'} /></Grid>
                <Grid size={{ xs: 6 }}><InfoField label="Médico" value={reserva?.medico_nombre ?? '-'} /></Grid>
                <Grid size={{ xs: 12 }}><InfoField label="Motivo consulta" value={reserva?.motivo_consulta ?? '-'} /></Grid>
              </Grid>
            </DialogSection>
            <DialogSection icon={<LocationOnIcon />} title="Ubicación de la Cita">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={departamentoId}
                    label="Departamento"
                    onChange={(e) => handleDepartamentoChange(Number(e.target.value))}
                  >
                    <MenuItem value={0}>Todos los departamentos</MenuItem>
                    {departamentos.map((d) => (
                      <MenuItem key={d.departamento_id} value={d.departamento_id}>{d.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  select
                  label="Ubicación *"
                  value={ubicacionId}
                  onChange={(e) => setUbicacionId(Number(e.target.value))}
                  required
                  fullWidth
                >
                  <MenuItem value={0} disabled>Seleccione una ubicación</MenuItem>
                  {ubicaciones.map((u) => (
                    <MenuItem key={u.ubicacion_id} value={u.ubicacion_id}>
                      {u.nombre} {u.piso ? `(${u.piso})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </DialogSection>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={ubicacionId === 0 || loading}
            sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#0D47A1' } }}>
            {loading ? 'Convirtiendo...' : 'Confirmar Conversión'}
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
