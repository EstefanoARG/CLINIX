import { Box, Typography, Dialog, DialogContent, DialogActions, Grid, Button, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssignmentIcon from '@mui/icons-material/Assignment';
import type { ReservaWebOut } from '../../types';
import { DialogSection, InfoField } from './DialogSection';

interface DetalleReservaModalProps {
  open: boolean;
  onClose: () => void;
  reserva: ReservaWebOut | null;
}

function estadoChip(estado: string) {
  if (estado === 'Pendiente') return <Chip label="Pendiente" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />;
  if (estado === 'Convertida') return <Chip label="Convertida" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />;
  return <Chip label="Rechazada" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600 }} />;
}

export default function DetalleReservaModal({ open, onClose, reserva }: DetalleReservaModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', boxShadow: '0px 10px 30px rgba(0,0,0,0.08)' } } }}>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <VisibilityIcon sx={{ color: '#64748b', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Detalle de Reserva #{reserva?.reserva_id}</Typography>
        </Box>
        {reserva && estadoChip(reserva.estado)}
      </Box>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <DialogSection icon={<PersonIcon />} title="Información del Paciente">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><InfoField label="Nombre" value={reserva?.nombre_solicitante ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="DNI" value={reserva?.dni_solicitante ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Email" value={reserva?.email_solicitante ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Teléfono" value={reserva?.telefono_solicitante ?? '-'} /></Grid>
              <Grid size={{ xs: 12 }}><InfoField label="Dirección" value={reserva?.direccion_solicitante ?? '-'} /></Grid>
            </Grid>
          </DialogSection>
          <DialogSection icon={<LocalHospitalIcon />} title="Detalles de la Cita">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><InfoField label="Especialidad" value={reserva?.especialidad_nombre ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Médico" value={reserva?.medico_nombre ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Fecha deseada" value={reserva?.fecha_hora_deseada ? new Date(reserva.fecha_hora_deseada).toLocaleString() : '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Motivo consulta" value={reserva?.motivo_consulta ?? '-'} /></Grid>
            </Grid>
          </DialogSection>
          <DialogSection icon={<AssignmentIcon />} title="Seguimiento">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><InfoField label="Estado" value={reserva?.estado ?? '-'} /></Grid>
              <Grid size={{ xs: 6 }}><InfoField label="Fecha solicitud" value={reserva?.fecha_solicitud ? new Date(reserva.fecha_solicitud).toLocaleString() : '-'} /></Grid>
              {reserva?.fecha_respuesta && (
                <Grid size={{ xs: 6 }}><InfoField label="Fecha respuesta" value={new Date(reserva.fecha_respuesta).toLocaleString()} /></Grid>
              )}
              <Grid size={{ xs: 12 }}><InfoField label="Observación admin" value={reserva?.observacion_admin ?? '-'} /></Grid>
            </Grid>
          </DialogSection>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
