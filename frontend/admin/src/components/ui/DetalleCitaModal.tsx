import { Box, Typography, Dialog, DialogContent, DialogActions, Grid, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import { DialogSection, InfoField } from './DialogSection';
import type { Cita } from '../../types';

interface DetalleCitaModalProps {
  open: boolean;
  onClose: () => void;
  cita: Cita | null;
}

export default function DetalleCitaModal({ open, onClose, cita }: DetalleCitaModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', boxShadow: '0px 10px 30px rgba(0,0,0,0.08)' } } }}>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #f1f5f9' }}>
        <CalendarMonthIcon sx={{ color: '#1565C0', fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Cita #{cita?.cita_id}</Typography>
      </Box>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <DialogSection icon={<PersonIcon />} title="Paciente">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}><InfoField label="Nombre" value={cita?.paciente_nombre ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Paciente ID" value={cita ? String(cita.paciente_id) : '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Motivo consulta" value={cita?.motivo_consulta ?? '-'} /></Grid>
            </Grid>
          </DialogSection>
          <DialogSection icon={<LocalHospitalIcon />} title="Médico y Especialidad">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><InfoField label="Médico" value={cita?.medico_nombre ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Especialidad" value={cita?.especialidad_nombre ?? '-'} /></Grid>
            </Grid>
          </DialogSection>
          <DialogSection icon={<CalendarMonthIcon />} title="Fecha y Horario">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <InfoField label="Fecha y Hora" value={cita?.fecha_hora ? new Date(cita.fecha_hora).toLocaleString() : '-'} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <InfoField label="Duración" value={cita ? `${cita.duracion_minutos} min` : '-'} />
              </Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Estado" value={cita?.estado_cita ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Fecha creación" value={cita?.fecha_creacion ? new Date(cita.fecha_creacion).toLocaleDateString() : '-'} /></Grid>
            </Grid>
          </DialogSection>
          {cita?.ubicacion_id && (
            <DialogSection icon={<LocationOnIcon />} title="Ubicación">
              <InfoField label="Ubicación ID" value={String(cita.ubicacion_id)} />
            </DialogSection>
          )}
          {cita?.observaciones && (
            <DialogSection icon={<NotesIcon />} title="Observaciones">
              <Typography variant="body2" sx={{ color: '#475569' }}>{cita.observaciones}</Typography>
            </DialogSection>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
