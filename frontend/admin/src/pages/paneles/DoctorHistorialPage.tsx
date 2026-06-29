import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, alpha,
} from '@mui/material';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/panel/doctor/pacientes')}
          sx={{ color: '#2563EB', textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: alpha('#2563EB', 0.08) } }}
        >
          Volver
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ClipboardList size={28} color="#2563EB" />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F4C81' }}>
            Historial — {paciente?.nombre} {paciente?.apellido}
          </Typography>
        </Box>
      </Box>

      {paciente && (
        <Paper sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, mb: 3, borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>DNI:</Typography>
          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>{paciente.dni}</Typography>
        </Paper>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        {historias.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
              <ClipboardList size={64} strokeWidth={1} color="#D1D5DB" style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#6B7280' }}>Sin historias clínicas</Typography>
              <Typography variant="body2" color="#9CA3AF">Este paciente aún no tiene historias registradas. Las historias se crean desde la Agenda Médica al atender una cita.</Typography>
            </Box>
          </motion.div>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#DBEAFE' }}>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Fecha</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Anamnesis</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Diagnóstico</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Tratamiento</TableCell>
                <TableCell sx={{ color: '#1E40AF', fontWeight: 600, py: 1.5 }}>Prescripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historias.map((h, index) => (
                <motion.div
                  key={h.historial_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TableRow
                    hover
                    sx={{ '&:hover': { bgcolor: '#EEF2FF' }, '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ color: '#374151', fontWeight: 500 }}>
                      {new Date(h.fecha_registro).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>{h.anamnesis ?? '-'}</TableCell>
                    <TableCell sx={{ color: '#111827', fontWeight: 500 }}>{h.diagnostico}</TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>{h.tratamiento}</TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>{h.prescripcion ?? '-'}</TableCell>
                  </TableRow>
                </motion.div>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
