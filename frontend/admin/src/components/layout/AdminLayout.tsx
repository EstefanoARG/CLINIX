import { Outlet } from 'react-router-dom';
import { Box, Toolbar, IconButton, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../store/AuthContext';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar role={user?.role ?? null} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {user?.nombre} ({user?.role})
          </Typography>
          <IconButton onClick={logout} size="small">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
        <Outlet />
      </Box>
    </Box>
  );
}
