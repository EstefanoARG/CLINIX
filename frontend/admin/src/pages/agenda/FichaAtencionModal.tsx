import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Button, TextField, Typography, Box, Snackbar, Alert,
  Autocomplete,
} from '@mui/material';
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

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Ficha de Atención — {cita.paciente_nombre}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">Paciente</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{cita.paciente_nombre}</Typography>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Typography variant="body2" color="text.secondary">DNI</Typography>
                <Typography variant="body1">{cita.paciente_dni}</Typography>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Typography variant="body2" color="text.secondary">Hora</Typography>
                <Typography variant="body1">{new Date(cita.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Anamnesis"
                multiline
                rows={3}
                fullWidth
                value={anamnesis}
                onChange={(e) => setAnamnesis(e.target.value)}
                placeholder="Motivo de consulta, síntomas, antecedentes..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
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
                  <TextField {...params} label="Diagnóstico CIE-10" placeholder="Buscar código o diagnóstico..." />
                )}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Tratamiento"
                multiline
                rows={3}
                fullWidth
                value={tratamiento}
                onChange={(e) => setTratamiento(e.target.value)}
                placeholder="Plan de tratamiento indicado..."
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Prescripción / Medicamentos"
                multiline
                rows={2}
                fullWidth
                value={prescripcion}
                onChange={(e) => setPrescripcion(e.target.value)}
                placeholder="Medicamentos recetados, dosis, frecuencia..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Observaciones"
                multiline
                rows={2}
                fullWidth
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
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