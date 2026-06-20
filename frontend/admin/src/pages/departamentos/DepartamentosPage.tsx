import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  IconButton, Tooltip, Chip, Snackbar, Alert,
  Dialog, DialogContent, DialogActions, Button, TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import api from '../../services/api';

interface Departamento {
  departamento_id: number;
  clinical_id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Departamento | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const fetchDepartamentos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    api.get<Departamento[]>(`/departamentos?${params.toString()}`)
      .then(({ data }) => setDepartamentos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchDepartamentos(); }, [fetchDepartamentos]);

  const openCreate = () => {
    setEditItem(null);
    setFormNombre('');
    setFormDescripcion('');
    setModalOpen(true);
  };

  const openEdit = (d: Departamento) => {
    setEditItem(d);
    setFormNombre(d.nombre);
    setFormDescripcion(d.descripcion ?? '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formNombre.trim()) return;
    setSaving(true);
    try {
      const body = { nombre: formNombre.trim(), descripcion: formDescripcion.trim() || undefined };
      if (editItem) {
        await api.put(`/departamentos/${editItem.departamento_id}`, body);
        setSnackbar({ message: 'Departamento actualizado', severity: 'success' });
      } else {
        await api.post('/departamentos', { ...body, clinical_id: 1 });
        setSnackbar({ message: 'Departamento creado', severity: 'success' });
      }
      setModalOpen(false);
      fetchDepartamentos();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al guardar';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: Departamento) => {
    if (!window.confirm(`¿Eliminar el departamento "${d.nombre}"?`)) return;
    try {
      await api.delete(`/departamentos/${d.departamento_id}`);
      setSnackbar({ message: 'Departamento desactivado', severity: 'success' });
      fetchDepartamentos();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al eliminar';
      setSnackbar({ message: msg, severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Departamentos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nuevo Departamento
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3, p: 2 }}>
        <TextField
          size="small" placeholder="Buscar por nombre..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
        />
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center"><Typography sx={{ py: 4, color: '#94a3b8' }}>Cargando...</Typography></TableCell></TableRow>
              ) : departamentos.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center"><Typography sx={{ py: 4, color: '#94a3b8' }}>Sin registros</Typography></TableCell></TableRow>
              ) : departamentos.map((d) => (
                <TableRow key={d.departamento_id} hover>
                  <TableCell>{d.departamento_id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{d.nombre}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{d.descripcion ?? '-'}</TableCell>
                  <TableCell>
                    <Chip label={d.activo ? 'Activo' : 'Inactivo'} size="small"
                      sx={{ bgcolor: d.activo ? '#E8F5E9' : '#FFF8E1', color: d.activo ? '#2E7D32' : '#F57F17', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(d)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton size="small" onClick={() => handleDelete(d)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
          <BusinessIcon sx={{ color: '#1565C0', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{editItem ? 'Editar Departamento' : 'Nuevo Departamento'}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nombre" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} required fullWidth />
            <TextField label="Descripción" value={formDescripcion} onChange={(e) => setFormDescripcion(e.target.value)} multiline rows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formNombre.trim()}
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
