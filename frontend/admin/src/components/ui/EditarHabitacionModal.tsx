import { useEffect, useState } from 'react';
import {
  Box, Typography, Dialog, DialogContent, DialogActions,
  Button, TextField, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import api from '../../services/api';
import type { Habitacion } from '../../types';

interface Departamento {
  departamento_id: number;
  nombre: string;
  activo: boolean;
}

const TIPOS_HABITACION = ['UCI', 'Privado', 'Compartido', 'Post-op', 'Pediatria', 'Neonatal', 'Emergencia', 'Aislamiento'];
const ESTADOS_HABITACION = ['Disponible', 'Ocupada', 'Mantenimiento', 'Reservada'];

interface EditarHabitacionModalProps {
  open: boolean;
  onClose: () => void;
  habitacion: Habitacion | null;
  onActualizada: () => void;
}

export default function EditarHabitacionModal({ open, onClose, habitacion, onActualizada }: EditarHabitacionModalProps) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [deptoId, setDeptoId] = useState(0);
  const [numero, setNumero] = useState('');
  const [piso, setPiso] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidad, setCapacidad] = useState(1);
  const [estado, setEstado] = useState('Disponible');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const isEdit = !!habitacion;

  useEffect(() => {
    if (open) {
      api.get<Departamento[]>('/departamentos')
        .then(({ data }) => setDepartamentos(data.filter((d) => d.activo)))
        .catch(() => {});
      if (habitacion) {
        setDeptoId(habitacion.departamento_id);
        setNumero(habitacion.numero);
        setPiso(habitacion.piso ?? '');
        setTipo(habitacion.tipo);
        setCapacidad(habitacion.capacidad);
        setEstado(habitacion.estado);
      } else {
        setDeptoId(0);
        setNumero('');
        setPiso('');
        setTipo('');
        setCapacidad(1);
        setEstado('Disponible');
      }
      setSnackbar(null);
    }
  }, [open, habitacion]);

  const handleSubmit = async () => {
    if (!numero.trim() || !tipo || deptoId === 0) return;
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/habitaciones/${habitacion!.habitacion_id}`, {
          piso: piso.trim() || undefined,
          tipo,
          capacidad,
          estado: estado !== 'Disponible' ? estado : undefined,
        });
        setSnackbar({ message: 'Habitación actualizada', severity: 'success' });
      } else {
        await api.post('/habitaciones', {
          departamento_id: deptoId,
          numero: numero.trim(),
          piso: piso.trim() || undefined,
          tipo,
          capacidad,
        });
        setSnackbar({ message: 'Habitación creada', severity: 'success' });
      }
      onActualizada();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al guardar';
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
          <HotelIcon sx={{ color: '#1565C0', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {isEdit ? `Editar Habitación ${habitacion!.numero}` : 'Nueva Habitación'}
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Departamento</InputLabel>
              <Select value={deptoId} label="Departamento" onChange={(e) => setDeptoId(Number(e.target.value))}>
                <MenuItem value={0} disabled>Seleccionar departamento</MenuItem>
                {departamentos.map((d) => (
                  <MenuItem key={d.departamento_id} value={d.departamento_id}>{d.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Número" value={numero} onChange={(e) => setNumero(e.target.value)}
              required fullWidth disabled={isEdit}
            />
            <TextField label="Piso" value={piso} onChange={(e) => setPiso(e.target.value)} fullWidth />
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select value={tipo} label="Tipo" onChange={(e) => setTipo(e.target.value)}>
                <MenuItem value="" disabled>Seleccionar tipo</MenuItem>
                {TIPOS_HABITACION.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Capacidad (camas)" type="number" value={capacidad}
              onChange={(e) => setCapacidad(Math.max(1, parseInt(e.target.value) || 1))}
              slotProps={{ htmlInput: { min: 1 } }} fullWidth
            />
            {isEdit && (
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
                  {ESTADOS_HABITACION.map((e) => (
                    <MenuItem key={e} value={e}>{e}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !numero.trim() || !tipo || deptoId === 0}
            sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#0D47A1' } }}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Habitación'}
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
