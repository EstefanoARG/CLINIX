import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import NotificationBell from '../ui/NotificationBell';

const DRAWER_WIDTH = 260;
const APPBAR_HEIGHT = 56;

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const avatarLetter = user?.nombre
    ? user.nombre.split(' ').pop()?.charAt(0).toUpperCase() ?? 'U'
    : 'U';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        color: 'text.primary',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 2, minHeight: APPBAR_HEIGHT, px: 3 }}>
        {user?.role === 'Médico' && (
          <NotificationBell medicoId={user?.medico_id || null} />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: 13 }}>
            {user?.nombre ?? 'Admin'}
          </Typography>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563EB', fontSize: 13, fontWeight: 700 }}>
            {avatarLetter}
          </Avatar>
          <IconButton
            onClick={() => { logout(); navigate('/login'); }}
            size="small"
            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
          >
            <LogOut size={16} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
