import { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  X, Clock, AlertTriangle, Stethoscope, Pill, FileText, Droplets, HeartPulse,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import type { HistoriaClinica } from '../../../types';

interface PatientHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  pacienteId: number | null;
  historias: HistoriaClinica[];
}

interface PatientInfo {
  alergias: string | null;
  grupo_sanguineo: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
}

export default function PatientHistoryPanel({ open, onClose, pacienteId, historias }: PatientHistoryPanelProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

  useEffect(() => {
    if (!pacienteId) return;
    api.get(`/pacientes/${pacienteId}`).then(({ data }) => {
      setPatientInfo({
        alergias: data.alergias || null,
        grupo_sanguineo: data.grupo_sanguineo || null,
        fecha_nacimiento: data.fecha_nacimiento || null,
        genero: data.genero || null,
      });
    }).catch(() => {});
  }, [pacienteId]);

  const calcEdad = (fn: string) => {
    const diff = Date.now() - new Date(fn).getTime();
    return Math.floor(diff / 31557600000);
  };

  const sorted = [...historias].sort(
    (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{
            overflow: 'hidden',
            borderLeft: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: 380 }}>
            {/* Header */}
            <Box sx={{
              px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} color="#2563EB" />
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0F4C81' }}>
                  Historial Clínico
                </Typography>
              </Box>
              <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
                <X size={16} />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 2 } }}>
              {/* Patient Info Card */}
              {patientInfo && (
                <Box sx={{
                  bgcolor: '#F8FAFC', borderRadius: 2, p: 2, mb: 2,
                  border: '1px solid #E5E7EB',
                }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#64748B', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Información del paciente
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {patientInfo.alergias && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={14} color="#EF4444" />
                        <Box>
                          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Alergias</Typography>
                          <Typography sx={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>{patientInfo.alergias}</Typography>
                        </Box>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {patientInfo.grupo_sanguineo && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Droplets size={14} color="#EF4444" />
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Grupo</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{patientInfo.grupo_sanguineo}</Typography>
                          </Box>
                        </Box>
                      )}
                      {patientInfo.fecha_nacimiento && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HeartPulse size={14} color="#2563EB" />
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Edad</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{calcEdad(patientInfo.fecha_nacimiento)} años</Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Timeline */}
              <Typography sx={{ fontWeight: 600, fontSize: 12, color: '#64748B', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Consultas anteriores ({sorted.length})
              </Typography>

              {sorted.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <FileText size={32} color="#E5E7EB" style={{ marginBottom: 8 }} />
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                    Sin historial clínico previo
                  </Typography>
                </Box>
              ) : (
                sorted.map((h, idx) => (
                  <motion.div
                    key={h.historial_id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                  >
                    <Box sx={{
                      position: 'relative',
                      pl: 3,
                      pb: 2.5,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 7,
                        top: 8,
                        bottom: 0,
                        width: 2,
                        bgcolor: idx === 0 ? '#2563EB' : '#E5E7EB',
                      },
                      '&:last-child::before': { display: 'none' },
                    }}>
                      <Box sx={{
                        position: 'absolute', left: 2, top: 4,
                        width: 12, height: 12, borderRadius: '50%',
                        bgcolor: idx === 0 ? '#2563EB' : '#E5E7EB',
                        border: '2px solid #FFFFFF',
                        boxShadow: idx === 0 ? '0 0 0 2px #DBEAFE' : 'none',
                        zIndex: 1,
                      }} />
                      <Typography sx={{ fontSize: 11, color: '#94A3B8', mb: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(h.fecha_registro).toLocaleDateString('es-PE', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </Typography>
                      <Box sx={{
                        bgcolor: '#F8FAFC', borderRadius: 1.5, p: 1.5,
                        border: '1px solid #E5E7EB',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.75 }}>
                          <Stethoscope size={12} color="#2563EB" style={{ marginTop: 3 }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0F4C81', lineHeight: 1.3 }}>
                            {h.diagnostico}
                          </Typography>
                        </Box>
                        {h.tratamiento && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                            <Pill size={12} color="#64748B" style={{ marginTop: 3 }} />
                            <Typography sx={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
                              {h.tratamiento.length > 120 ? h.tratamiento.slice(0, 120) + '...' : h.tratamiento}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                ))
              )}
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}