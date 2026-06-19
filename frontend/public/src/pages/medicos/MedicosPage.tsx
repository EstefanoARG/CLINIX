import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import api from '../../services/api';
import type { Especialidad, Medico } from '../../types';

export default function MedicosPage() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [especialidadId, setEspecialidadId] = useState<number | ''>('');

  useEffect(() => {
    api.get<{ items: Medico[]; total: number }>('/public/medicos').then(({ data }) => setMedicos(data.items));
    api.get<Especialidad[]>('/especialidades').then(({ data }) => setEspecialidades(data));
  }, []);

  const handleFilter = (id: number) => {
    setEspecialidadId(id);
    api.get<{ items: Medico[]; total: number }>(`/public/medicos${id ? `?especialidad_id=${id}` : ''}`)
      .then(({ data }) => setMedicos(data.items));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Médicos</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Conozca a nuestros especialistas
      </Typography>

      <FormControl size="small" sx={{ minWidth: 250, mb: 3 }}>
        <InputLabel>Filtrar por especialidad</InputLabel>
        <Select value={especialidadId} label="Filtrar por especialidad" onChange={(e) => handleFilter(Number(e.target.value))}>
          <MenuItem value=""><em>Todas</em></MenuItem>
          {especialidades.map((esp) => (
            <MenuItem key={esp.especialidad_id} value={esp.especialidad_id}>{esp.nombre_especialidad}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {medicos.map((m) => (
          <Grid key={m.medico_id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/solicitar-cita?medico=${m.medico_id}`)}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{m.nombre} {m.apellido}</Typography>
                <Chip label={m.especialidad} size="small" color="primary" sx={{ mt: 1 }} />
                {m.telefono && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Tel: {m.telefono}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {medicos.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>No se encontraron médicos.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
