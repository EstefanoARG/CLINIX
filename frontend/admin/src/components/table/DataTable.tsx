import {
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, TablePagination, TextField, Box, IconButton, Tooltip, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  loading?: boolean;
}

export default function DataTable<T>({
  columns, data, total, page, rowsPerPage, onPageChange, onRowsPerPageChange,
  searchValue, onSearchChange, searchPlaceholder, onEdit, onDelete, onView,
}: DataTableProps<T>) {
  return (
    <Paper sx={{ width: '100%' }}>
      {(searchValue !== undefined || onEdit || onDelete || onView) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, pb: 0 }}>
          {searchValue !== undefined && onSearchChange && (
            <TextField
              size="small"
              placeholder={searchPlaceholder ?? 'Buscar...'}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ minWidth: 300 }}
            />
          )}
        </Box>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 700 }}>{col.label}</TableCell>
              ))}
              {(onEdit || onDelete || onView) && <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} hover>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode ?? '-'}
                  </TableCell>
                ))}
                {(onEdit || onDelete || onView) && (
                  <TableCell>
                    {onView && (
                      <Tooltip title="Ver"><IconButton size="small" onClick={() => onView(row)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                    {onEdit && (
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => onEdit(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Eliminar"><IconButton size="small" onClick={() => onDelete(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} align="center">
                <Typography color="text.secondary" sx={{ py: 4 }}>Sin registros</Typography>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}
