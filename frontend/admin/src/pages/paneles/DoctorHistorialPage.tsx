import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
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

  useEffect(() => {
    if (!pacienteId) return;
    api.get<any>(`/pacientes/${pacienteId}`).then(({ data }) =>
      setPaciente({ paciente_id: data.paciente_id, nombre: data.nombre, apellido: data.apellido, dni: data.dni })
    );
    api.get<HistoriaClinica[]>(`/pacientes/${pacienteId}/historias`).then(({ data }) => setHistorias(data));
  }, [pacienteId]);

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
      <Paper>
        {historias.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h6">Sin historias clínicas</Typography>
            <Typography variant="body2">Este paciente aún no tiene historias registradas. Las historias se crean desde la Agenda Médica al atender una cita.</Typography>
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
    </Box>
  );
}
