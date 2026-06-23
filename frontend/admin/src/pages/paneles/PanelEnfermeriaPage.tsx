import { useEffect, useState } from 'react';
import { Box, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import api from '../../services/api';
import type { Admision } from '../../types';

export default function PanelEnfermeriaPage() {
  const [items, setItems] = useState<Admision[]>([]);

  useEffect(() => {
    api.get<Admision[]>('/enfermero/mis-pacientes').then(({ data }) => setItems(data));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Panel de enfermería</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Pacientes hospitalizados asignados: {items.length}</Typography>
      <Paper><Table size="small"><TableHead><TableRow>
        <TableCell>Paciente</TableCell><TableCell>Habitación</TableCell><TableCell>Médico</TableCell>
        <TableCell>Fecha de ingreso</TableCell><TableCell>Motivo</TableCell><TableCell>Estado</TableCell>
      </TableRow></TableHead><TableBody>
        {items.map((item) => <TableRow key={item.admision_id}>
          <TableCell>{item.paciente_nombre}</TableCell><TableCell>{item.habitacion_numero}</TableCell><TableCell>{item.medico_nombre}</TableCell>
          <TableCell>{new Date(item.fecha_ingreso).toLocaleString()}</TableCell><TableCell>{item.motivo_ingreso}</TableCell>
          <TableCell><Chip size="small" label={item.estado} color="warning" /></TableCell>
        </TableRow>)}
      </TableBody></Table></Paper>
    </Box>
  );
}
