import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';
import type { HistoriaClinica, Paciente } from '../../types';

const EMPTY_FORM = {
  dni: '', nombre: '', apellido: '', fecha_nacimiento: '', genero: '',
  direccion: '', telefono: '', email: '', grupo_sanguineo: '', alergias: '',
};

export default function PacientesPage() {
  const [items, setItems] = useState<Paciente[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detail, setDetail] = useState<Paciente | null>(null);
  const [histories, setHistories] = useState<HistoriaClinica[]>([]);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(() => {
    const url = search.trim()
      ? `/pacientes/buscar?q=${encodeURIComponent(search.trim())}&limit=500`
      : '/pacientes?limit=500';
    api.get<{ items: Paciente[] }>(url)
      .then(({ data }) => setItems(data.items))
      .catch((error: any) => {
        const detail = error?.response?.data?.detail;
        const msg = typeof detail === 'string' ? detail : 'No se pudieron cargar los pacientes';
        setMessage({ text: msg, error: true });
      });
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const showForm = (item?: Paciente) => {
    setEditing(item ?? null);
    setForm(item ? {
      dni: item.dni, nombre: item.nombre, apellido: item.apellido,
      fecha_nacimiento: item.fecha_nacimiento ?? '', genero: item.genero ?? '',
      direccion: item.direccion ?? '', telefono: item.telefono ?? '', email: item.email ?? '',
      grupo_sanguineo: item.grupo_sanguineo ?? '', alergias: item.alergias ?? '',
    } : EMPTY_FORM);
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      ...form,
      clinical_id: 1,
      fecha_nacimiento: form.fecha_nacimiento || null,
      genero: form.genero || null,
      grupo_sanguineo: form.grupo_sanguineo || null,
    };
    try {
      if (editing) await api.put(`/pacientes/${editing.paciente_id}`, payload);
      else await api.post('/pacientes', payload);
      setOpen(false);
      setMessage({ text: editing ? 'Paciente actualizado' : 'Paciente registrado' });
      load();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg).join('; ') : 'No se pudo guardar';
      setMessage({ text: msg, error: true });
    }
  };

  const showDetail = async (item: Paciente) => {
    setDetail(item);
    const { data } = await api.get<HistoriaClinica[]>(`/pacientes/${item.paciente_id}/historias`);
    setHistories(data);
  };

  const deactivate = async (item: Paciente) => {
    if (!window.confirm(`¿Desactivar a ${item.nombre} ${item.apellido}?`)) return;
    await api.delete(`/pacientes/${item.paciente_id}`);
    setMessage({ text: 'Paciente desactivado' });
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Pacientes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => showForm()}>Nuevo paciente</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}><TextField size="small" label="Buscar por DNI, nombre o email" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 320 }} /></Paper>
      <Paper>
        <Table size="small"><TableHead><TableRow>
          <TableCell>DNI</TableCell><TableCell>Paciente</TableCell><TableCell>Contacto</TableCell><TableCell>Nacimiento</TableCell><TableCell>Grupo sanguíneo</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell>
        </TableRow></TableHead><TableBody>
          {items.map((item) => <TableRow key={item.paciente_id} hover>
            <TableCell>{item.dni}</TableCell><TableCell>{item.nombre} {item.apellido}</TableCell>
            <TableCell>{item.email ?? '-'}<br />{item.telefono ?? '-'}</TableCell><TableCell>{item.fecha_nacimiento ?? '-'}</TableCell>
            <TableCell>{item.grupo_sanguineo ?? '-'}</TableCell>
            <TableCell><Chip size="small" label={item.activo ? 'Activo' : 'Inactivo'} color={item.activo ? 'success' : 'default'} /></TableCell>
            <TableCell>
              <Tooltip title="Detalle"><IconButton onClick={() => showDetail(item)}><VisibilityIcon /></IconButton></Tooltip>
              <Tooltip title="Editar"><IconButton onClick={() => showForm(item)}><EditIcon /></IconButton></Tooltip>
              {item.activo && <Tooltip title="Desactivar"><IconButton onClick={() => deactivate(item)}><DeleteIcon /></IconButton></Tooltip>}
            </TableCell>
          </TableRow>)}
        </TableBody></Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Editar paciente' : 'Registrar paciente'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: '16px !important' }}>
          <TextField label="DNI" required value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
          <TextField label="Nombres" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Apellidos" required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          <TextField type="date" label="Fecha de nacimiento" slotProps={{ inputLabel: { shrink: true } }} value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
          <FormControl><InputLabel>Género</InputLabel><Select label="Género" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })}>
            <MenuItem value="">Sin especificar</MenuItem>{['Masculino', 'Femenino', 'Otro'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select></FormControl>
          <FormControl><InputLabel>Grupo sanguíneo</InputLabel><Select label="Grupo sanguíneo" value={form.grupo_sanguineo} onChange={(e) => setForm({ ...form, grupo_sanguineo: e.target.value })}>
            <MenuItem value="">Sin especificar</MenuItem>{['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select></FormControl>
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <TextField label="Alergias" value={form.alergias} onChange={(e) => setForm({ ...form, alergias: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>

      <Dialog open={!!detail} onClose={() => setDetail(null)} fullWidth maxWidth="lg">
        <DialogTitle>Paciente — {detail?.nombre} {detail?.apellido}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            DNI: {detail?.dni} · Email: {detail?.email ?? '-'} · Teléfono: {detail?.telefono ?? '-'} · Alergias: {detail?.alergias ?? 'Ninguna registrada'}
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>Historia clínica</Typography>
          <Table size="small"><TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Médico ID</TableCell><TableCell>Diagnóstico</TableCell><TableCell>Tratamiento</TableCell><TableCell>Prescripción</TableCell></TableRow></TableHead>
            <TableBody>{histories.map((item) => <TableRow key={item.historial_id}><TableCell>{new Date(item.fecha_registro).toLocaleString()}</TableCell><TableCell>{item.medico_id}</TableCell><TableCell>{item.diagnostico}</TableCell><TableCell>{item.tratamiento}</TableCell><TableCell>{item.prescripcion ?? '-'}</TableCell></TableRow>)}</TableBody>
          </Table>
        </DialogContent>
        <DialogActions><Button onClick={() => setDetail(null)}>Cerrar</Button></DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.error ? 'error' : 'success'}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
