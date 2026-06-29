import { CalendarDays, Stethoscope, Pill, FileText, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

interface TimelineItem {
  historial_id: number;
  fecha_registro: string;
  diagnostico: string;
  tratamiento: string;
  prescripcion: string | null;
  observaciones: string | null;
  anamnesis: string | null;
}

interface PatientTimelineProps {
  historias: TimelineItem[];
  pacienteNombre: string;
}

export default function PatientTimeline({ historias }: PatientTimelineProps) {
  const sorted = [...historias].sort(
    (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CalendarDays size={18} color="#2563EB" />
        <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0F4C81' }}>
          Línea de tiempo clínica
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#94A3B8', ml: 'auto' }}>
          {sorted.length} registro{sorted.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {sorted.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <FileText size={28} color="#E5E7EB" style={{ marginBottom: 8 }} />
          <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
            Sin historial clínico disponible
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {sorted.map((item, idx) => (
            <motion.div
              key={item.historial_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
            >
              <Box sx={{ display: 'flex', gap: 2, pb: 2.5, position: 'relative' }}>
                {/* Timeline dot + line */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
                  <Box sx={{
                    width: 10, height: 10, borderRadius: '50%',
                    bgcolor: idx === 0 ? '#2563EB' : '#CBD5E1',
                    border: '2px solid #FFFFFF',
                    boxShadow: idx === 0 ? '0 0 0 2px #DBEAFE' : 'none',
                    zIndex: 1, mt: 0.5,
                  }} />
                  {idx < sorted.length - 1 && (
                    <Box sx={{ width: 2, flex: 1, bgcolor: '#E5E7EB', mt: 0.5 }} />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, color: '#94A3B8', mb: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(item.fecha_registro).toLocaleDateString('es-PE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Typography>
                  <Box sx={{
                    bgcolor: '#F8FAFC', borderRadius: 1.5, p: 1.5,
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#2563EB', bgcolor: '#FAFBFF' },
                  }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0F4C81', mb: 1 }}>
                      {item.diagnostico}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                        <Stethoscope size={13} color="#2563EB" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                          {item.tratamiento || 'Sin tratamiento registrado'}
                        </Typography>
                      </Box>
                      {item.anamnesis && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                          <ClipboardCheck size={13} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
                            {item.anamnesis.length > 100 ? item.anamnesis.slice(0, 100) + '...' : item.anamnesis}
                          </Typography>
                        </Box>
                      )}
                      {item.prescripcion && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                          <Pill size={13} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
                            {item.prescripcion.length > 80 ? item.prescripcion.slice(0, 80) + '...' : item.prescripcion}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}
