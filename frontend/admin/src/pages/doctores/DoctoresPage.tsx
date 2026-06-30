import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Select, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ScheduleIcon from '@mui/icons-material/Schedule';
import api from '../../services/api';
import type { Departamento, Especialidad, HorarioMedico, Medico, UbicacionFisica } from '../../types';

const EMPTY_FORM = {
  nombre: '', apellido: '', dni: '', email: '', telefono: '', password: 'clinix123',
  numero_colegiatura: '', especialidad_id: 0, departamento_id: 0, ubicacion_id: 0,
};
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DoctoresPage() {
  const [items, setItems] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [especialidadesFiltradas, setEspecialidadesFiltradas] = useState<Especialidad[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medico | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [scheduleDoctor, setScheduleDoctor] = useState<Medico | null>(null);
  const [schedules, setSchedules] = useState<HorarioMedico[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ dia_semana: 1, hora_inicio: '08:00', hora_fin: '12:00', intervalo_citas: 30 });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(() => {
    api.get<{ items: Medico[] }>('/medicos?limit=500')
      .then(({ data }) => setItems(data.items))
      .catch(() => setMessage({ text: 'No se pudieron cargar los médicos', error: true }));
  }, []);

  useEffect(() => {
    load();
    Promise.all([
      api.get<Especialidad[]>('/especialidades'),
      api.get<Departamento[]>('/departamentos?activo=true'),
      api.get<UbicacionFisica[]>('/ubicaciones'),
    ]).then(([a, b, c]) => {
      setEspecialidades(a.data);
      setEspecialidadesFiltradas(a.data);
      setDepartamentos(b.data);
      setUbicaciones(c.data);
    });
  }, [load]);

  const showForm = (item?: Medico) => {
    setEditing(item ?? null);
    const col = item?.numero_colegiatura?.replace(/^CMP[- ]?/i, '') ?? '';
    setForm(item ? {
      nombre: item.nombre ?? '', apellido: item.apellido ?? '', dni: '', email: item.email ?? '',
      telefono: item.telefono ?? '', password: 'clinix123', numero_colegiatura: col,
      especialidad_id: item.especialidad_id, departamento_id: item.departamento_id, ubicacion_id: 0,
    } : EMPTY_FORM);
    if (!item?.departamento_id) setEspecialidadesFiltradas(especialidades);
    setOpen(true);
  };

  const save = async () => {
    const colegiatura = form.numero_colegiatura.toUpperCase().startsWith('CMP')
      ? form.numero_colegiatura
      : `CMP-${form.numero_colegiatura}`;
    try {
      if (editing) {
        await api.put(`/medicos/${editing.medico_id}`, {
          especialidad_id: form.especialidad_id,
          departamento_id: form.departamento_id,
          numero_colegiatura: colegiatura,
        });
      } else {
        await api.post('/medicos', {
          ...form,
          numero_colegiatura: colegiatura,
          clinical_id: 1,
          ubicacion_id: form.ubicacion_id || null,
        });
      }
      setOpen(false);
      setMessage({ text: editing ? 'Médico actualizado' : 'Médico registrado' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo guardar', error: true });
    }
  };

  const deactivate = async (item: Medico) => {
    if (!window.confirm(`¿Desactivar a ${item.nombre} ${item.apellido}?`)) return;
    try {
      await api.delete(`/medicos/${item.medico_id}`);
      setMessage({ text: 'Médico desactivado' });
      load();
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo desactivar', error: true });
    }
  };

  const openSchedules = async (doctor: Medico) => {
    setScheduleDoctor(doctor);
    const { data } = await api.get<HorarioMedico[]>(`/medicos/${doctor.medico_id}/horarios`);
    setSchedules(data);
  };

  const addSchedule = async () => {
    if (!scheduleDoctor) return;
    try {
      await api.post('/horarios', { medico_id: scheduleDoctor.medico_id, ...scheduleForm });
      await openSchedules(scheduleDoctor);
      setMessage({ text: 'Horario agregado' });
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.detail ?? 'No se pudo agregar el horario', error: true });
    }
  };

  const deleteSchedule = async (schedule: HorarioMedico) => {
    if (!scheduleDoctor) return;
    await api.delete(`/horarios/${schedule.horario_id}`);
    await openSchedules(scheduleDoctor);
  };

  useEffect(() => {
    if (!open || !form.departamento_id) {
      if (open && !form.departamento_id) setEspecialidadesFiltradas(especialidades);
      return;
    }
    api.get<Especialidad[]>(`/especialidades?departamento_id=${form.departamento_id}`)
      .then(({ data }) => {
        setEspecialidadesFiltradas(data.length ? data : especialidades);
        if (!data.find(e => e.especialidad_id === form.especialidad_id)) {
          setForm(prev => ({ ...prev, especialidad_id: 0 }));
        }
      })
      .catch(() => setEspecialidadesFiltradas(especialidades));
  }, [form.departamento_id, open]);

  const filtered = items.filter((item) =>
    `${item.nombre} ${item.apellido} ${item.especialidad} ${item.numero_colegiatura}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Doctores</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => showForm()}>Nuevo médico</Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField size="small" label="Buscar médico" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>
      <Paper>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Nombre</TableCell><TableCell>Especialidad</TableCell><TableCell>Departamento</TableCell>
            <TableCell>Colegiatura</TableCell><TableCell>Contacto</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.medico_id} hover>
                <TableCell>{item.nombre} {item.apellido}</TableCell>
                <TableCell>{item.especialidad}</TableCell>
                <TableCell>{item.departamento}</TableCell>
                <TableCell>{item.numero_colegiatura}</TableCell>
                <TableCell>{item.email}<br />{item.telefono}</TableCell>
                <TableCell><Chip size="small" label={item.activo ? 'Activo' : 'Inactivo'} color={item.activo ? 'success' : 'default'} /></TableCell>
                <TableCell>
                  <Tooltip title="Horarios"><IconButton onClick={() => openSchedules(item)}><ScheduleIcon /></IconButton></Tooltip>
                  <Tooltip title="Editar"><IconButton onClick={() => showForm(item)}><EditIcon /></IconButton></Tooltip>
                  {item.activo && <Tooltip title="Desactivar"><IconButton onClick={() => deactivate(item)}><DeleteIcon /></IconButton></Tooltip>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Editar médico' : 'Registrar médico'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: '16px !important' }}>
          {!editing && <>
            <TextField label="Nombres" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextField label="Apellidos" required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            <TextField label="DNI" required value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            <TextField label="Email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <TextField label="Contraseña inicial" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </>}
          <TextField label="Número de colegiatura" required value={form.numero_colegiatura}
            onChange={(e) => setForm({ ...form, numero_colegiatura: e.target.value })}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">CMP-</InputAdornment>,
              },
            }}
          />
          <FormControl required><InputLabel>Especialidad</InputLabel><Select label="Especialidad" value={form.especialidad_id} onChange={(e) => setForm({ ...form, especialidad_id: Number(e.target.value) })}>
            <MenuItem value={0} disabled>Seleccione</MenuItem>{especialidadesFiltradas.map((item) => <MenuItem key={item.especialidad_id} value={item.especialidad_id}>{item.nombre_especialidad}</MenuItem>)}
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

      <Dialog open={!!scheduleDoctor} onClose={() => setScheduleDoctor(null)} fullWidth maxWidth="md">
        <DialogTitle>Horarios — {scheduleDoctor?.nombre} {scheduleDoctor?.apellido}</DialogTitle>
        <DialogContent>
          <Table size="small"><TableHead><TableRow><TableCell>Día</TableCell><TableCell>Inicio</TableCell><TableCell>Fin</TableCell><TableCell>Intervalo</TableCell><TableCell /></TableRow></TableHead>
            <TableBody>{schedules.filter((item) => item.activo).map((item) => <TableRow key={item.horario_id}>
              <TableCell>{DIAS[item.dia_semana - 1]}</TableCell><TableCell>{item.hora_inicio}</TableCell><TableCell>{item.hora_fin}</TableCell>
              <TableCell>{item.intervalo_citas} min</TableCell><TableCell><IconButton onClick={() => deleteSchedule(item)}><DeleteIcon /></IconButton></TableCell>
            </TableRow>)}</TableBody>
          </Table>
          <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Día</InputLabel><Select label="Día" value={scheduleForm.dia_semana} onChange={(e) => setScheduleForm({ ...scheduleForm, dia_semana: Number(e.target.value) })}>
              {DIAS.map((day, index) => <MenuItem key={day} value={index + 1}>{day}</MenuItem>)}
            </Select></FormControl>
            <TextField size="small" type="time" label="Inicio" slotProps={{ inputLabel: { shrink: true } }} value={scheduleForm.hora_inicio} onChange={(e) => setScheduleForm({ ...scheduleForm, hora_inicio: e.target.value })} />
            <TextField size="small" type="time" label="Fin" slotProps={{ inputLabel: { shrink: true } }} value={scheduleForm.hora_fin} onChange={(e) => setScheduleForm({ ...scheduleForm, hora_fin: e.target.value })} />
            <TextField size="small" type="number" label="Intervalo" value={scheduleForm.intervalo_citas} onChange={(e) => setScheduleForm({ ...scheduleForm, intervalo_citas: Number(e.target.value) })} />
            <Button variant="contained" onClick={addSchedule}>Agregar</Button>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setScheduleDoctor(null)}>Cerrar</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.error ? 'error' : 'success'}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
