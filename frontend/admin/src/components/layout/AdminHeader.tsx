import { AppBar, Toolbar, Typography, Avatar, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

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
        bgcolor: '#FAFBFC',
        borderBottom: '1px solid #E0E0E0',
        color: 'text.primary',
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 2, minHeight: APPBAR_HEIGHT }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {user?.nombre ?? 'Admin'}
        </Typography>
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1565C0', fontSize: 14, fontWeight: 700 }}>
          {avatarLetter}
        </Avatar>
        <IconButton onClick={() => { logout(); navigate('/login'); }} size="small" sx={{ color: 'text.secondary' }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
