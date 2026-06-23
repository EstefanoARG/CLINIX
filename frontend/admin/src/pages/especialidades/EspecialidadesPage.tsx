import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import type { Especialidad } from '../../types';

export default function EspecialidadesPage() {
  const [items, setItems] = useState<Especialidad[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Especialidad | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(() => {
    api.get<Especialidad[]>('/especialidades')
      .then(({ data }) => setItems(data))
      .catch(() => setMessage({ text: 'No se pudieron cargar las especialidades', error: true }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showForm = (item?: Especialidad) => {
    setEditing(item ?? null);
    setNombre(item?.nombre_especialidad ?? '');
    setDescripcion(item?.descripcion ?? '');
    setOpen(true);
  };

  const save = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const payload = { nombre_especialidad: nombre.trim(), descripcion: descripcion.trim() || null };
      if (editing) await api.put(`/especialidades/${editing.especialidad_id}`, payload);
      else await api.post('/especialidades', payload);
      setOpen(false);
      setMessage({ text: editing ? 'Especialidad actualizada' : 'Especialidad creada' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo guardar', error: true });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Especialidad) => {
    if (!window.confirm(`¿Eliminar la especialidad "${item.nombre_especialidad}"?`)) return;
    try {
      await api.delete(`/especialidades/${item.especialidad_id}`);
      setMessage({ text: 'Especialidad eliminada' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo eliminar', error: true });
    }
  };

  const filtered = items.filter((item) =>
    `${item.nombre_especialidad} ${item.descripcion ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Especialidades</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => showForm()}>
          Nueva especialidad
        </Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField size="small" label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.especialidad_id} hover>
                <TableCell>{item.especialidad_id}</TableCell>
                <TableCell>{item.nombre_especialidad}</TableCell>
                <TableCell>{item.descripcion ?? '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => showForm(item)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => remove(item)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow><TableCell colSpan={4} align="center">Sin registros</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar especialidad' : 'Nueva especialidad'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '16px !important' }}>
          <TextField label="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <TextField label="Descripción" multiline rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={saving || !nombre.trim()} onClick={save}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.error ? 'error' : 'success'}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
