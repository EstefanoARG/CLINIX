import { useCallback, useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableHead, TablePagination,
  TableRow, TextField, Typography,
} from '@mui/material';
import api from '../../services/api';
import type { LogAuditoria } from '../../types';

export default function AuditoriaPage() {
  const [items, setItems] = useState<LogAuditoria[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(25);
  const [accion, setAccion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams({ skip: String(page * rows), limit: String(rows) });
    if (accion) params.set('accion', accion);
    if (desde) params.set('fecha_desde', desde);
    if (hasta) params.set('fecha_hasta', hasta);
    api.get<{ items: LogAuditoria[]; total: number }>(`/auditoria?${params}`)
      .then(({ data }) => { setItems(data.items); setTotal(data.total); });
  }, [accion, desde, hasta, page, rows]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Auditoría</Typography>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label="Acción" value={accion} onChange={(e) => { setAccion(e.target.value); setPage(0); }} />
        <TextField size="small" type="date" label="Desde" slotProps={{ inputLabel: { shrink: true } }} value={desde} onChange={(e) => { setDesde(e.target.value); setPage(0); }} />
        <TextField size="small" type="date" label="Hasta" slotProps={{ inputLabel: { shrink: true } }} value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(0); }} />
      </Paper>
      <Paper>
        <Table size="small"><TableHead><TableRow>
          <TableCell>Fecha</TableCell><TableCell>Usuario</TableCell><TableCell>Acción</TableCell>
          <TableCell>Entidad</TableCell><TableCell>Registro</TableCell><TableCell>Detalle</TableCell><TableCell>IP</TableCell>
        </TableRow></TableHead><TableBody>
          {items.map((item) => <TableRow key={item.log_id} hover>
            <TableCell>{new Date(item.fecha).toLocaleString()}</TableCell><TableCell>{item.usuario_nombre ?? 'Sistema'}</TableCell>
            <TableCell>{item.accion}</TableCell><TableCell>{item.tabla_afectada ?? '-'}</TableCell>
            <TableCell>{item.registro_id ?? '-'}</TableCell><TableCell>{item.detalle ?? '-'}</TableCell><TableCell>{item.direccion_ip ?? '-'}</TableCell>
          </TableRow>)}
        </TableBody></Table>
        <TablePagination component="div" count={total} page={page} rowsPerPage={rows}
          onPageChange={(_, value) => setPage(value)}
          onRowsPerPageChange={(e) => { setRows(Number(e.target.value)); setPage(0); }}
          labelRowsPerPage="Filas por página" />
      </Paper>
    </Box>
  );
}
