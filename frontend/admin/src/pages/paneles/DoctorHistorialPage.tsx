import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Alert, Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import type { HistoriaClinica } from '../../types';

interface DoctorPatient {
  paciente_id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

export default function DoctorHistorialPage() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<DoctorPatient | null>(null);
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ anamnesis: '', diagnostico: '', tratamiento: '', prescripcion: '' });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (!pacienteId) return;
    api.get<any>(`/pacientes/${pacienteId}`).then(({ data }) =>
      setPaciente({ paciente_id: data.paciente_id, nombre: data.nombre, apellido: data.apellido, dni: data.dni })
    );
    api.get<HistoriaClinica[]>(`/pacientes/${pacienteId}/historias`).then(({ data }) => setHistorias(data));
  }, [pacienteId]);

  const saveHistoria = async () => {
    try {
      await api.post(`/pacientes/${pacienteId}/historias`, { medico_id: 0, ...form });
      setOpen(false);
      setForm({ anamnesis: '', diagnostico: '', tratamiento: '', prescripcion: '' });
      const { data } = await api.get<HistoriaClinica[]>(`/pacientes/${pacienteId}/historias`);
      setHistorias(data);
      setMessage({ text: 'Historia clínica guardada' });
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg).join('; ') : 'No se pudo guardar';
      setMessage({ text: msg, error: true });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/panel/doctor/pacientes')}>Volver</Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Historial — {paciente?.nombre} {paciente?.apellido}
        </Typography>
      </Box>
      {paciente && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>DNI: {paciente.dni}</Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>Nueva Historia</Button>
      </Box>
      <Paper>
        {historias.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h6">Sin historias clínicas</Typography>
            <Typography variant="body2">Este paciente aún no tiene historias registradas.</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Anamnesis</TableCell>
                <TableCell>Diagnóstico</TableCell>
                <TableCell>Tratamiento</TableCell>
                <TableCell>Prescripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historias.map((h) => (
                <TableRow key={h.historial_id}>
                  <TableCell>{new Date(h.fecha_registro).toLocaleString()}</TableCell>
                  <TableCell>{h.anamnesis ?? '-'}</TableCell>
                  <TableCell>{h.diagnostico}</TableCell>
                  <TableCell>{h.tratamiento}</TableCell>
                  <TableCell>{h.prescripcion ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nueva historia clínica</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '16px !important' }}>
          <TextField label="Anamnesis" multiline rows={2} value={form.anamnesis}
            onChange={(e) => setForm({ ...form, anamnesis: e.target.value })} />
          <TextField label="Diagnóstico (CIE-10)" required multiline value={form.diagnostico}
            onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} />
          <TextField label="Tratamiento" required multiline rows={2} value={form.tratamiento}
            onChange={(e) => setForm({ ...form, tratamiento: e.target.value })} />
          <TextField label="Prescripción" multiline rows={2} value={form.prescripcion}
            onChange={(e) => setForm({ ...form, prescripcion: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveHistoria}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.error ? 'error' : 'success'}>{message.text}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
