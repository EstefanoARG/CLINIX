import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Snackbar, Alert,
  Autocomplete, CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Stethoscope, ClipboardList, Pill, FileText } from 'lucide-react';
import api from '../../services/api';
import type { AgendaCitaItem } from '../../types';

interface Cie10Option {
  codigo: string;
  descripcion: string;
  categoria: string | null;
  especialidad_id: number;
  especialidad_nombre: string | null;
}

interface FichaAtencionModalProps {
  open: boolean;
  cita: AgendaCitaItem;
  onClose: () => void;
  onSaved: () => void;
}

export default function FichaAtencionModal({ open, cita, onClose, onSaved }: FichaAtencionModalProps) {
  const [anamnesis, setAnamnesis] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [diagnosticoCode, setDiagnosticoCode] = useState<string | null>(null);
  const [tratamiento, setTratamiento] = useState('');
  const [prescripcion, setPrescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [cie10Options, setCie10Options] = useState<Cie10Option[]>([]);

  useEffect(() => {
    if (open) {
      setAnamnesis('');
      setDiagnostico('');
      setDiagnosticoCode(null);
      setTratamiento('');
      setPrescripcion('');
      setObservaciones('');
      setSnackbar(null);
      api.get<{ items: Cie10Option[] }>('/cie10').then(({ data }) => {
        setCie10Options(data.items || []);
      });
    }
  }, [open, cita.cita_id]);

  const handleSubmit = async () => {
    if (!diagnostico.trim() || !tratamiento.trim()) {
      setSnackbar({ message: 'Diagnóstico y Tratamiento son obligatorios', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const diagFinal = diagnosticoCode
        ? `${diagnosticoCode} - ${diagnostico}`
        : diagnostico;

      await api.post(`/pacientes/${cita.paciente_id}/historias`, {
          medico_id: 0,
          cita_id: cita.cita_id,
          anamnesis,
          diagnostico: diagFinal,
          tratamiento,
          prescripcion,
          observaciones,
        });

      await api.put(`/citas/${cita.cita_id}`, {
        estado_cita: 'Completada',
      });

      setSnackbar({ message: 'Historia clínica guardada correctamente', severity: 'success' });
      setTimeout(onSaved, 1000);
    } catch {
      setSnackbar({ message: 'Error al guardar la historia clínica', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#F8FAFC',
      transition: 'all 0.2s ease',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB', borderWidth: 2 },
      },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB', fontWeight: 600 },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            },
          },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
            px: 3,
            py: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ClipboardList size={22} color="rgba(255,255,255,0.9)" />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: 0.3 }}>
              Ficha de Atención
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 4 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.95rem' }}>
              {cita.paciente_nombre}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ADE80' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                {new Date(cita.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                p: 2.5,
                mb: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                  Paciente
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', mt: 0.3 }}>
                  {cita.paciente_nombre}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                  DNI
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#0F172A', mt: 0.3 }}>
                  {cita.paciente_dni}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                  Hora
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#0F172A', mt: 0.3 }}>
                  {new Date(cita.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Anamnesis"
                multiline
                rows={3}
                fullWidth
                value={anamnesis}
                onChange={(e) => setAnamnesis(e.target.value)}
                placeholder="Motivo de consulta, síntomas, antecedentes..."
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 1, pt: 0.5 }}>
                        <Stethoscope size={18} color="#64748B" />
                      </Box>
                    ),
                  },
                }}
              />

              <Autocomplete
                options={cie10Options}
                getOptionLabel={(opt) => `${opt.codigo} - ${opt.descripcion}`}
                value={cie10Options.find((c) => c.codigo === diagnosticoCode) || null}
                onChange={(_, v) => {
                  setDiagnosticoCode(v?.codigo || null);
                  setDiagnostico(v?.descripcion || '');
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.codigo} — {option.descripcion}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.categoria} {option.especialidad_nombre ? `· ${option.especialidad_nombre}` : ''}
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Diagnóstico CIE-10"
                    placeholder="Buscar código o diagnóstico..."
                    sx={fieldSx}
                  />
                )}
                size="small"
              />

              <TextField
                label="Tratamiento"
                multiline
                rows={3}
                fullWidth
                value={tratamiento}
                onChange={(e) => setTratamiento(e.target.value)}
                placeholder="Plan de tratamiento indicado..."
                required
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 1, pt: 0.5 }}>
                        <Pill size={18} color="#64748B" />
                      </Box>
                    ),
                  },
                }}
              />

              <TextField
                label="Prescripción / Medicamentos"
                multiline
                rows={2}
                fullWidth
                value={prescripcion}
                onChange={(e) => setPrescripcion(e.target.value)}
                placeholder="Medicamentos recetados, dosis, frecuencia..."
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 1, pt: 0.5 }}>
                        <FileText size={18} color="#64748B" />
                      </Box>
                    ),
                  },
                }}
              />

              <TextField
                label="Observaciones"
                multiline
                rows={2}
                fullWidth
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                sx={fieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', pr: 1, pt: 0.5 }}>
                        <FileText size={18} color="#64748B" />
                      </Box>
                    ),
                  },
                }}
              />
            </Box>
          </motion.div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderColor: '#E5E7EB',
              color: '#64748B',
              '&:hover': { borderColor: '#2563EB', color: '#2563EB', bgcolor: 'rgba(37,99,235,0.04)' },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3.5,
              py: 1,
              background: loading ? undefined : 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              '&:hover': {
                background: loading ? undefined : 'linear-gradient(135deg, #1D4ED8 0%, #0A3A6B 100%)',
                boxShadow: '0 6px 16px rgba(37,99,235,0.4)',
              },
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} /> : null}
            {loading ? 'Guardando...' : 'Guardar y Completar Atención'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
