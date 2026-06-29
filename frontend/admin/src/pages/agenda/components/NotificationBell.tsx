import { useEffect, useState, useRef } from 'react';
import { Bell, BellRing, X, Calendar, UserX } from 'lucide-react';
import {
  Box, IconButton, Badge, Popover, Typography, Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

interface NotificationBellProps {
  medicoId: number | null;
  onNewNotification?: () => void;
}

export default function NotificationBell({ medicoId, onNewNotification }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [novedades, setNovedades] = useState<string[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const prevCount = useRef(0);

  const today = new Date().toISOString().slice(0, 10);

  const checkNotifications = async () => {
    if (!medicoId) return;
    try {
      const [pendingRes, cancelledRes] = await Promise.all([
        api.get(`/medico/mis-citas?estado=Programada&fecha_desde=${today}&fecha_hasta=${today}`),
        api.get(`/medico/mis-citas?estado=Cancelada&fecha_desde=${today}&fecha_hasta=${today}&limit=5`),
      ]);

      const pendientes = pendingRes.data?.data ?? pendingRes.data ?? [];
      const total = Array.isArray(pendientes) ? pendientes.length : (pendientes.total ?? 0);

      setTotalPendientes(total);

      const nuevasNovedades: string[] = [];

      if (total > prevCount.current) {
        const diff = total - prevCount.current;
        nuevasNovedades.push(`${diff} nueva${diff > 1 ? 's' : ''} cita${diff > 1 ? 's' : ''} pendiente${diff > 1 ? 's' : ''}`);
      }

      const cancelados = cancelledRes.data?.data ?? cancelledRes.data ?? [];
      if (Array.isArray(cancelados) && cancelados.length > 0) {
        nuevasNovedades.push(`${cancelados.length} cita${cancelados.length > 1 ? 's' : ''} cancelada${cancelados.length > 1 ? 's' : ''} hoy`);
      }

      if (nuevasNovedades.length > 0) {
        setHasNew(true);
        setNovedades(nuevasNovedades);
        onNewNotification?.();
      } else if (total === 0) {
        setNovedades([]);
        setHasNew(false);
      }

      prevCount.current = total;
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    if (!medicoId) return;
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [medicoId]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setOpen(true);
    setHasNew(false);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} sx={{ position: 'relative' }}>
        <Badge
          variant="dot"
          invisible={!hasNew}
          sx={{
            '& .MuiBadge-dot': {
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#EF4444',
              right: 2,
              top: 2,
            },
          }}
        >
          {totalPendientes > 0 ? (
            <BellRing size={20} color="#2563EB" />
          ) : (
            <Bell size={20} color="#64748B" />
          )}
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#F8FAFC',
              border: '1px solid #E5E7EB',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              minWidth: 280,
              maxWidth: 360,
              p: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0F4C81' }}>
            Notificaciones
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <X size={14} />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#E5E7EB' }} />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Calendar size={16} color="#2563EB" />
            <Typography sx={{ fontSize: 13, color: '#1E293B' }}>
              <strong>{totalPendientes}</strong> cita{totalPendientes !== 1 ? 's' : ''} pendiente{totalPendientes !== 1 ? 's' : ''} hoy
            </Typography>
          </Box>
          {novedades.length > 0 ? (
            <AnimatePresence>
              {novedades.map((novedad, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <UserX size={14} color="#EF4444" />
                    <Typography sx={{ fontSize: 12, color: '#EF4444' }}>
                      {novedad}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Typography sx={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
              No hay novedades
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
}
