import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  IconButton, Tooltip, Chip, Snackbar, Alert, Button, TextField,
  Dialog, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import api from '../../services/api';

interface Ubicacion {
  ubicacion_id: number;
  departamento_id: number;
  nombre: string;
  tipo: string;
  piso: string | null;
  activo: boolean;
}

interface Departamento {
  departamento_id: number;
  nombre: string;
  activo: boolean;
}

const TIPOS = ['Consultorio', 'Operaciones', 'Emergencias', 'Laboratorio', 'Imagenologia', 'Otro'];

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptoFilter, setDeptoFilter] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Ubicacion | null>(null);
  const [formDeptoId, setFormDeptoId] = useState(0);
  const [formNombre, setFormNombre] = useState('');
  const [formTipo, setFormTipo] = useState('');
  const [formPiso, setFormPiso] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchUbicaciones = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (deptoFilter > 0) params.set('departamento_id', String(deptoFilter));
    if (search) params.set('search', search);
    api.get<Ubicacion[]>(`/ubicaciones?${params.toString()}`)
      .then(({ data }) => setUbicaciones(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, deptoFilter]);

  useEffect(() => {
    api.get<Departamento[]>('/departamentos')
      .then(({ data }) => setDepartamentos(data.filter((d) => d.activo)))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchUbicaciones(); }, [fetchUbicaciones]);

  const getDeptoNombre = (id: number) => departamentos.find((d) => d.departamento_id === id)?.nombre ?? `ID ${id}`;

  const openCreate = () => {
    setEditItem(null);
    setFormDeptoId(deptoFilter > 0 ? deptoFilter : 0);
    setFormNombre('');
    setFormTipo('');
    setFormPiso('');
    setModalOpen(true);
  };

  const openEdit = (u: Ubicacion) => {
    setEditItem(u);
    setFormDeptoId(u.departamento_id);
    setFormNombre(u.nombre);
    setFormTipo(u.tipo);
    setFormPiso(u.piso ?? '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formNombre.trim() || !formTipo || formDeptoId === 0) return;
    setSaving(true);
    try {
      const body = {
        departamento_id: formDeptoId,
        nombre: formNombre.trim(),
        tipo: formTipo,
        piso: formPiso.trim() || undefined,
      };
      if (editItem) {
        await api.put(`/ubicaciones/${editItem.ubicacion_id}`, body);
        setSnackbar({ message: 'Ubicación actualizada', severity: 'success' });
      } else {
        await api.post('/ubicaciones', body);
        setSnackbar({ message: 'Ubicación creada', severity: 'success' });
      }
      setModalOpen(false);
      fetchUbicaciones();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al guardar';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: Ubicacion) => {
    if (!window.confirm(`¿Eliminar la ubicación "${u.nombre}"?`)) return;
    try {
      await api.delete(`/ubicaciones/${u.ubicacion_id}`);
      setSnackbar({ message: 'Ubicación desactivada', severity: 'success' });
      fetchUbicaciones();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al eliminar';
      setSnackbar({ message: msg, severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Ubicaciones</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nueva Ubicación
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Buscar por nombre..." value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 250 }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Departamento</InputLabel>
            <Select value={deptoFilter} label="Departamento" onChange={(e) => setDeptoFilter(Number(e.target.value))}>
              <MenuItem value={0}>Todos los departamentos</MenuItem>
              {departamentos.map((d) => (
                <MenuItem key={d.departamento_id} value={d.departamento_id}>{d.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Departamento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Piso</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center"><Typography sx={{ py: 4, color: '#94a3b8' }}>Cargando...</Typography></TableCell></TableRow>
              ) : ubicaciones.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center"><Typography sx={{ py: 4, color: '#94a3b8' }}>Sin registros</Typography></TableCell></TableRow>
              ) : ubicaciones.map((u) => (
                <TableRow key={u.ubicacion_id} hover>
                  <TableCell>{u.ubicacion_id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{u.nombre}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{getDeptoNombre(u.departamento_id)}</TableCell>
                  <TableCell><Chip label={u.tipo} size="small" variant="outlined" /></TableCell>
                  <TableCell>{u.piso ?? '-'}</TableCell>
                  <TableCell>
                    <Chip label={u.activo ? 'Activo' : 'Inactivo'} size="small"
                      sx={{ bgcolor: u.activo ? '#E8F5E9' : '#FFF8E1', color: u.activo ? '#2E7D32' : '#F57F17', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton size="small" onClick={() => handleDelete(u)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <MeetingRoomIcon sx={{ color: '#1565C0', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{editItem ? 'Editar Ubicación' : 'Nueva Ubicación'}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Departamento</InputLabel>
              <Select value={formDeptoId} label="Departamento" onChange={(e) => setFormDeptoId(Number(e.target.value))}>
                <MenuItem value={0} disabled>Seleccionar departamento</MenuItem>
                {departamentos.map((d) => (
                  <MenuItem key={d.departamento_id} value={d.departamento_id}>{d.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Nombre" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} required fullWidth />
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select value={formTipo} label="Tipo" onChange={(e) => setFormTipo(e.target.value)}>
                <MenuItem value="" disabled>Seleccionar tipo</MenuItem>
                {TIPOS.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Piso" value={formPiso} onChange={(e) => setFormPiso(e.target.value)} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formNombre.trim() || !formTipo || formDeptoId === 0}
            sx={{ bgcolor: '#1565C0', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#0D47A1' } }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snackbar ? <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
