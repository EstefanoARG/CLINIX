import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Paper, Select, Snackbar, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import type { Admision, Enfermero, Habitacion, Medico, Paciente } from '../../types';

const EMPTY_FORM = {
  paciente_id: 0, medico_id: 0, enfermero_id: 0, habitacion_id: 0,
  motivo_ingreso: '', diagnostico_ingreso: '', observaciones: '',
};

export default function AdmisionesPage() {
  const [items, setItems] = useState<Admision[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [enfermeros, setEnfermeros] = useState<Enfermero[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [estado, setEstado] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [alta, setAlta] = useState<Admision | null>(null);
  const [altaForm, setAltaForm] = useState({ diagnostico_alta: '', tipo_alta: 'Médica', observaciones: '' });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(() => {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    api.get<{ items: Admision[] }>(`/admisiones${query}`)
      .then(({ data }) => setItems(data.items))
      .catch(() => setMessage({ text: 'No se pudieron cargar las admisiones', error: true }));
    api.get<Habitacion[]>('/habitaciones?estado=Disponible').then(({ data }) => setHabitaciones(data));
  }, [estado]);

  useEffect(() => {
    load();
    Promise.all([
      api.get<{ items: Paciente[] }>('/pacientes?activo=true&limit=500'),
      api.get<{ items: Medico[] }>('/medicos?activo=true&limit=500'),
      api.get<{ items: Enfermero[] }>('/enfermeros?activo=true&limit=500'),
    ]).then(([a, b, c]) => {
      setPacientes(a.data.items);
      setMedicos(b.data.items);
      setEnfermeros(c.data.items);
    });
  }, [load]);

  const create = async () => {
    try {
      await api.post('/admisiones', {
        ...form,
        enfermero_id: form.enfermero_id || null,
      });
      setOpen(false);
      setForm(EMPTY_FORM);
      setMessage({ text: 'Admisión registrada' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo registrar la admisión', error: true });
    }
  };

  const discharge = async () => {
    if (!alta) return;
    try {
      await api.post(`/admisiones/${alta.admision_id}/alta`, altaForm);
      setAlta(null);
      setMessage({ text: 'Alta médica registrada' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo registrar el alta', error: true });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Admisiones</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Nueva admisión</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Estado</InputLabel><Select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>{['Activa', 'Alta', 'Trasladado'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </Select></FormControl>
      </Paper>
      <Paper>
        <Table size="small"><TableHead><TableRow>
          <TableCell>ID</TableCell><TableCell>Paciente</TableCell><TableCell>Médico</TableCell><TableCell>Enfermero</TableCell>
          <TableCell>Habitación</TableCell><TableCell>Ingreso</TableCell><TableCell>Motivo</TableCell><TableCell>Estado</TableCell><TableCell>Acción</TableCell>
        </TableRow></TableHead><TableBody>
          {items.map((item) => <TableRow key={item.admision_id} hover>
            <TableCell>{item.admision_id}</TableCell><TableCell>{item.paciente_nombre}</TableCell><TableCell>{item.medico_nombre}</TableCell>
            <TableCell>{item.enfermero_nombre ?? '-'}</TableCell><TableCell>{item.habitacion_numero}</TableCell>
            <TableCell>{new Date(item.fecha_ingreso).toLocaleString()}</TableCell><TableCell>{item.motivo_ingreso}</TableCell>
            <TableCell><Chip size="small" label={item.estado} color={item.estado === 'Activa' ? 'warning' : 'success'} /></TableCell>
            <TableCell>{item.estado === 'Activa' && <Button size="small" onClick={() => setAlta(item)}>Dar alta</Button>}</TableCell>
          </TableRow>)}
        </TableBody></Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Nueva admisión</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: '16px !important' }}>
          <FormControl required><InputLabel>Paciente</InputLabel><Select label="Paciente" value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: Number(e.target.value) })}>
            <MenuItem value={0} disabled>Seleccione</MenuItem>{pacientes.map((item) => <MenuItem key={item.paciente_id} value={item.paciente_id}>{item.nombre} {item.apellido} — {item.dni}</MenuItem>)}
          </Select></FormControl>
          <FormControl required><InputLabel>Médico</InputLabel><Select label="Médico" value={form.medico_id} onChange={(e) => setForm({ ...form, medico_id: Number(e.target.value) })}>
            <MenuItem value={0} disabled>Seleccione</MenuItem>{medicos.map((item) => <MenuItem key={item.medico_id} value={item.medico_id}>{item.nombre} {item.apellido}</MenuItem>)}
          </Select></FormControl>
          <FormControl><InputLabel>Enfermero</InputLabel><Select label="Enfermero" value={form.enfermero_id} onChange={(e) => setForm({ ...form, enfermero_id: Number(e.target.value) })}>
            <MenuItem value={0}>Sin asignar</MenuItem>{enfermeros.map((item) => <MenuItem key={item.enfermero_id} value={item.enfermero_id}>{item.nombre} {item.apellido}</MenuItem>)}
          </Select></FormControl>
          <FormControl required><InputLabel>Habitación disponible</InputLabel><Select label="Habitación disponible" value={form.habitacion_id} onChange={(e) => setForm({ ...form, habitacion_id: Number(e.target.value) })}>
            <MenuItem value={0} disabled>Seleccione</MenuItem>{habitaciones.map((item) => <MenuItem key={item.habitacion_id} value={item.habitacion_id}>{item.numero} — {item.tipo}</MenuItem>)}
          </Select></FormControl>
          <TextField required label="Motivo de ingreso" multiline rows={2} value={form.motivo_ingreso} onChange={(e) => setForm({ ...form, motivo_ingreso: e.target.value })} />
          <TextField label="Diagnóstico de ingreso" multiline rows={2} value={form.diagnostico_ingreso} onChange={(e) => setForm({ ...form, diagnostico_ingreso: e.target.value })} />
          <TextField label="Observaciones" multiline rows={2} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={create}>Registrar</Button></DialogActions>
      </Dialog>

      <Dialog open={!!alta} onClose={() => setAlta(null)} fullWidth maxWidth="sm">
        <DialogTitle>Dar de alta a {alta?.paciente_nombre}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '16px !important' }}>
          <FormControl><InputLabel>Tipo de alta</InputLabel><Select label="Tipo de alta" value={altaForm.tipo_alta} onChange={(e) => setAltaForm({ ...altaForm, tipo_alta: e.target.value })}>
            {['Médica', 'Voluntaria', 'Traslado', 'Defunción'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select></FormControl>
          <TextField label="Diagnóstico de alta" multiline rows={3} value={altaForm.diagnostico_alta} onChange={(e) => setAltaForm({ ...altaForm, diagnostico_alta: e.target.value })} />
          <TextField label="Observaciones" multiline rows={2} value={altaForm.observaciones} onChange={(e) => setAltaForm({ ...altaForm, observaciones: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setAlta(null)}>Cancelar</Button><Button variant="contained" onClick={discharge}>Confirmar alta</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.error ? 'error' : 'success'}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
