import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, ListItemButton, ListItemText, Avatar, Chip,
} from '@mui/material';
import { Search, Command, ArrowRight, CalendarX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

interface PatientResult {
  paciente_id: number;
  dni: string;
  nombre: string;
  apellido: string;
  ultima_cita: string | null;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectPatient: (slotId: number) => void;
  pacientes: { paciente_id: number; id: number; name: string; status: string }[];
}

export default function CommandPalette({ open, onClose, onSelectPatient, pacientes }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedIndex(0);
    setLoaded(false);
    api.get('/medico/mis-pacientes?limit=200')
      .then(({ data }) => {
        setPatients(data.items || []);
        setLoaded(true);
      })
      .catch(() => { setLoaded(true); });
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const todayIds = new Set(pacientes.filter((p) => p.status !== 'libre').map((p) => p.paciente_id));

  const filtered = patients.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(q);
  }).slice(0, 10);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((p: PatientResult) => {
    const slot = pacientes.find((s) => s.paciente_id === p.paciente_id && s.status !== 'libre');
    if (slot) {
      onSelectPatient(slot.id);
    }
    onClose();
  }, [pacientes, onSelectPatient, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '12vh',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              width: '100%', maxWidth: 560,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
              <Search size={18} color="#94A3B8" style={{ marginRight: 10, flexShrink: 0 }} />
              <TextField
                inputRef={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar paciente por nombre o DNI..."
                variant="standard"
                fullWidth
                slotProps={{
                  htmlInput: {
                    sx: { fontSize: 15, fontWeight: 400, color: '#0F172A', '&::placeholder': { color: '#94A3B8', opacity: 1 } },
                  },
                }}
                sx={{
                  '& .MuiInput-root:before': { border: 'none' },
                  '& .MuiInput-root:after': { border: 'none' },
                  '& .MuiInput-root:hover:before': { border: 'none' },
                }}
              />
            </Box>

            {/* Results */}
            <Box sx={{ maxHeight: 360, overflowY: 'auto', py: 0.5 }}>
              {!loaded ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>Cargando pacientes...</Typography>
                </Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>
                    {query ? `No se encontró "${query}"` : 'No hay pacientes registrados'}
                  </Typography>
                </Box>
              ) : (
                filtered.map((p, i) => {
                  const enAgenda = todayIds.has(p.paciente_id);
                  return (
                    <ListItemButton
                      key={p.paciente_id}
                      selected={i === selectedIndex}
                      onClick={() => handleSelect(p)}
                      sx={{
                        px: 2.5, py: 1.5, mx: 0.5, borderRadius: 1,
                        '&.Mui-selected': { bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#EFF6FF' } },
                        '&:hover': { bgcolor: '#F8FAFC' },
                        opacity: enAgenda ? 1 : 0.6,
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: enAgenda ? '#DBEAFE' : '#F3F4F6', color: enAgenda ? '#2563EB' : '#9CA3AF', fontSize: 12, mr: 1.5, fontWeight: 600 }}>
                        {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={`${p.nombre} ${p.apellido}`}
                        secondary={`${p.dni}${p.ultima_cita ? ` · Última cita: ${new Date(p.ultima_cita).toLocaleDateString('es-PE')}` : ''}`}
                        slotProps={{
                          primary: { sx: { fontSize: 13, fontWeight: 500, color: '#0F172A' } },
                          secondary: { sx: { fontSize: 11, color: '#94A3B8' } },
                        }}
                      />
                      {enAgenda ? (
                        <Chip
                          label="En agenda"
                          size="small"
                          sx={{ height: 20, fontSize: 10, bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#CBD5E1' }}>
                          <CalendarX size={12} />
                          <Typography sx={{ fontSize: 10, color: '#CBD5E1', whiteSpace: 'nowrap' }}>Sin cita hoy</Typography>
                        </Box>
                      )}
                      <ArrowRight size={14} color={i === selectedIndex ? '#2563EB' : '#E5E7EB'} style={{ marginLeft: 6, flexShrink: 0 }} />
                    </ListItemButton>
                  );
                })
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 2.5, py: 1, borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Command size={12} color="#94A3B8" />
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>K</Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>Abrir</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box component="span" sx={{ fontSize: 10, color: '#94A3B8', border: '1px solid #E5E7EB', borderRadius: 0.5, px: 0.5 }}>↑↓</Box>
              </Box>
              <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>Navegar</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box component="span" sx={{ fontSize: 10, color: '#94A3B8', border: '1px solid #E5E7EB', borderRadius: 0.5, px: 0.5 }}>Esc</Box>
              </Box>
              <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>Cerrar</Typography>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
