import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import type { Departamento, Enfermero, UbicacionFisica } from '../../types';

const EMPTY_FORM = {
  nombre: '', apellido: '', dni: '', email: '', telefono: '', password: 'clinix123',
  numero_licencia: '', turno: 'Mañana', departamento_id: 0, ubicacion_id: 0,
};

export default function EnfermerasPage() {
  const [items, setItems] = useState<Enfermero[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Enfermero | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(() => {
    api.get<{ items: Enfermero[] }>('/enfermeros?limit=500')
      .then(({ data }) => setItems(data.items))
      .catch(() => setMessage({ text: 'No se pudo cargar enfermería', error: true }));
  }, []);

  useEffect(() => {
    load();
    Promise.all([
      api.get<Departamento[]>('/departamentos?activo=true'),
      api.get<UbicacionFisica[]>('/ubicaciones'),
    ]).then(([a, b]) => {
      setDepartamentos(a.data);
      setUbicaciones(b.data);
    });
  }, [load]);

  const showForm = (item?: Enfermero) => {
    setEditing(item ?? null);
    setForm(item ? {
      nombre: item.nombre ?? '', apellido: item.apellido ?? '', dni: '', email: item.email ?? '',
      telefono: '', password: 'clinix123', numero_licencia: item.numero_licencia,
      turno: item.turno, departamento_id: item.departamento_id, ubicacion_id: 0,
    } : EMPTY_FORM);
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/enfermeros/${editing.enfermero_id}`, {
          departamento_id: form.departamento_id,
          numero_licencia: form.numero_licencia,
          turno: form.turno,
        });
      } else {
        await api.post('/enfermeros', {
          ...form,
          clinical_id: 1,
          ubicacion_id: form.ubicacion_id || null,
        });
      }
      setOpen(false);
      setMessage({ text: editing ? 'Enfermero actualizado' : 'Enfermero registrado' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo guardar', error: true });
    }
  };

  const deactivate = async (item: Enfermero) => {
    if (!window.confirm(`¿Desactivar a ${item.nombre} ${item.apellido}?`)) return;
    try {
      await api.delete(`/enfermeros/${item.enfermero_id}`);
      setMessage({ text: 'Enfermero desactivado' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo desactivar', error: true });
    }
  };

  const filtered = items.filter((item) =>
    `${item.nombre} ${item.apellido} ${item.numero_licencia} ${item.turno}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Enfermería</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => showForm()}>Nuevo enfermero</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}><TextField size="small" label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} /></Paper>
      <Paper>
        <Table size="small">
          <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Licencia</TableCell><TableCell>Departamento</TableCell><TableCell>Turno</TableCell><TableCell>Email</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
          <TableBody>{filtered.map((item) => (
            <TableRow key={item.enfermero_id} hover>
              <TableCell>{item.nombre} {item.apellido}</TableCell><TableCell>{item.numero_licencia}</TableCell>
              <TableCell>{departamentos.find((d) => d.departamento_id === item.departamento_id)?.nombre ?? item.departamento_id}</TableCell>
              <TableCell>{item.turno}</TableCell><TableCell>{item.email}</TableCell>
              <TableCell><Chip size="small" label={item.activo ? 'Activo' : 'Inactivo'} color={item.activo ? 'success' : 'default'} /></TableCell>
              <TableCell>
                <Tooltip title="Editar"><IconButton onClick={() => showForm(item)}><EditIcon /></IconButton></Tooltip>
                {item.activo && <Tooltip title="Desactivar"><IconButton onClick={() => deactivate(item)}><DeleteIcon /></IconButton></Tooltip>}
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Editar enfermero' : 'Registrar enfermero'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: '16px !important' }}>
          {!editing && <>
            <TextField label="Nombres" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextField label="Apellidos" required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            <TextField label="DNI" required value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            <TextField label="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <TextField label="Contraseña inicial" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </>}
          <TextField label="Número de licencia" required value={form.numero_licencia} onChange={(e) => setForm({ ...form, numero_licencia: e.target.value })} />
          <FormControl required><InputLabel>Turno</InputLabel><Select label="Turno" value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}>
            {['Mañana', 'Tarde', 'Noche', 'Rotativo'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select></FormControl>
          <FormControl required><InputLabel>Departamento</InputLabel><Select label="Departamento" value={form.departamento_id} onChange={(e) => setForm({ ...form, departamento_id: Number(e.target.value) })}>
            <MenuItem value={0} disabled>Seleccione</MenuItem>{departamentos.map((item) => <MenuItem key={item.departamento_id} value={item.departamento_id}>{item.nombre}</MenuItem>)}
          </Select></FormControl>
          {!editing && <FormControl><InputLabel>Ubicación</InputLabel><Select label="Ubicación" value={form.ubicacion_id} onChange={(e) => setForm({ ...form, ubicacion_id: Number(e.target.value) })}>
            <MenuItem value={0}>Sin ubicación</MenuItem>{ubicaciones.map((item) => <MenuItem key={item.ubicacion_id} value={item.ubicacion_id}>{item.nombre}</MenuItem>)}
          </Select></FormControl>}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.error ? 'error' : 'success'}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
