import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

const DRAWER_WIDTH = 260;
const APPBAR_HEIGHT = 56;

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role={user?.role ?? null} />
      <Box sx={{ flexGrow: 1, width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
        <AdminHeader />
        <Toolbar sx={{ minHeight: `${APPBAR_HEIGHT}px !important` }} />
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)` }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
