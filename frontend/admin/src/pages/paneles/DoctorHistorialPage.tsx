import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Typography, alpha, Chip, Stack, Avatar,
} from '@mui/material';
import {
  ArrowLeft, ClipboardList, Stethoscope, Pill, FileText,
  Calendar, Circle, FlaskConical,
} from 'lucide-react';
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

  const grouped = historias.reduce<Record<string, HistoriaClinica[]>>((acc, h) => {
    const d = new Date(h.fecha_registro);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {});

  const meses = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 6 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 } }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/panel/doctor/pacientes')}
          sx={{ color: '#2563EB', textTransform: 'none', fontWeight: 500, mb: 2, '&:hover': { bgcolor: alpha('#2563EB', 0.08) } }}
        >
          Volver
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: '#DBEAFE', width: 48, height: 48 }}>
            <ClipboardList size={24} color="#2563EB" />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F4C81', lineHeight: 1.2 }}>
              Historial clínico
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
              {paciente?.nombre} {paciente?.apellido}
            </Typography>
          </Box>
          {paciente && (
            <Chip
              label={`DNI: ${paciente.dni}`}
              size="small"
              variant="outlined"
              sx={{ ml: 'auto', fontWeight: 600, borderColor: '#CBD5E1', color: '#64748B' }}
            />
          )}
        </Box>

        {historias.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ py: 10, textAlign: 'center', borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <ClipboardList size={72} strokeWidth={1} color="#D1D5DB" style={{ marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#6B7280' }}>Sin historias clínicas</Typography>
              <Typography variant="body2" color="#9CA3AF" sx={{ mt: 0.5 }}>
                Este paciente aún no tiene historias registradas.
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          <Stack spacing={4}>
            {meses.map((mes) => {
              const [year, month] = mes.split('-');
              const dateObj = new Date(Number(year), Number(month) - 1);
              const label = dateObj.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

              return (
                <Box key={mes}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <Calendar size={18} color="#64748B" />
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#475569', textTransform: 'capitalize' }}>
                      {label}
                    </Typography>
                    <Chip
                      label={`${grouped[mes].length} ${grouped[mes].length === 1 ? 'registro' : 'registros'}`}
                      size="small"
                      sx={{ bgcolor: '#E2E8F0', color: '#64748B', fontWeight: 600, fontSize: 11 }}
                    />
                  </Stack>

                  <Stack spacing={2}>
                    {grouped[mes].map((h, idx) => (
                      <motion.div
                        key={h.historial_id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                      >
                        <Paper
                          sx={{
                            borderRadius: 3,
                            bgcolor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#93C5FD', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' },
                          }}
                        >
                          <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#FAFBFF', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>
                              {new Date(h.fecha_registro).toLocaleDateString('es-PE', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
                              {new Date(h.fecha_registro).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>

                          <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                              <Box sx={{ mt: 0.25 }}>
                                <Stethoscope size={18} color="#2563EB" />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.25 }}>
                                  Diagnóstico
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#0F172A', lineHeight: 1.4 }}>
                                  {h.diagnostico}
                                </Typography>
                              </Box>
                            </Box>

                            <Stack spacing={1.5} sx={{ pl: 0.5 }}>
                              {h.anamnesis && (
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                  <FileText size={15} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                                  <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>Anamnesis</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{h.anamnesis}</Typography>
                                  </Box>
                                </Box>
                              )}
                              {h.tratamiento && (
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                  <FlaskConical size={15} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                                  <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>Tratamiento</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{h.tratamiento}</Typography>
                                  </Box>
                                </Box>
                              )}
                              {h.prescripcion && (
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                  <Pill size={15} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                                  <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>Prescripción</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{h.prescripcion}</Typography>
                                  </Box>
                                </Box>
                              )}
                              {!h.anamnesis && !h.tratamiento && !h.prescripcion && (
                                <Typography sx={{ fontSize: 12, color: '#CBD5E1', fontStyle: 'italic', pl: 3.5 }}>
                                  Sin detalles adicionales
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
