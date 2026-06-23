import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Toolbar } from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import DoctorSidebar from './DoctorSidebar';
import AdminHeader from './AdminHeader';

const DRAWER_WIDTH = 260;
const APPBAR_HEIGHT = 56;

export default function DoctorLayout() {
  const { user, loading } = useAuth();

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Médico') return <Navigate to="/dashboard" replace />;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <DoctorSidebar role={user.role} />
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
