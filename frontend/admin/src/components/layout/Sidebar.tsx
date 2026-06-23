import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WomanIcon from '@mui/icons-material/Woman';
import PatientsIcon from '@mui/icons-material/Accessible';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BusinessIcon from '@mui/icons-material/Business';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import InboxIcon from '@mui/icons-material/Inbox';
import HotelIcon from '@mui/icons-material/Hotel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ClinixLogo from '../ClinixLogo';

const DRAWER_WIDTH = 260;
const ACTIVE_BG = '#303F9F';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['Administrador'] },
  { label: 'Bandeja Recepción', path: '/bandeja', icon: <InboxIcon />, roles: ['Administrador', 'Recepcionista'] },
  { label: 'Doctores', path: '/doctores', icon: <PeopleIcon />, roles: ['Administrador'] },
  { label: 'Enfermeras', path: '/enfermeras', icon: <WomanIcon />, roles: ['Administrador'] },
  { label: 'Pacientes', path: '/pacientes', icon: <PatientsIcon />, roles: ['Administrador', 'Recepcionista'] },
  { label: 'Especialidades', path: '/especialidades', icon: <LocalHospitalIcon />, roles: ['Administrador'] },
  { label: 'Departamentos', path: '/departamentos', icon: <BusinessIcon />, roles: ['Administrador'] },
  { label: 'Ubicaciones', path: '/ubicaciones', icon: <MeetingRoomIcon />, roles: ['Administrador'] },
  { label: 'Citas', path: '/citas', icon: <CalendarMonthIcon />, roles: ['Administrador', 'Recepcionista'] },
  { label: 'Reservas Web', path: '/reservas', icon: <BookOnlineIcon />, roles: ['Administrador', 'Recepcionista'] },
  { label: 'Habitaciones', path: '/habitaciones', icon: <HotelIcon />, roles: ['Administrador'] },
  { label: 'Admisiones', path: '/admisiones', icon: <AssignmentIcon />, roles: ['Administrador', 'Recepcionista', 'Enfermero'] },
  { label: 'Auditoría', path: '/auditoria', icon: <ReceiptLongIcon />, roles: ['Administrador'] },
  { label: 'Panel Enfermería', path: '/panel/enfermeria', icon: <MedicalServicesIcon />, roles: ['Enfermero'] },
];

interface SidebarProps {
  role: string | null;
}

export default function Sidebar({ role }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #E0E0E0' },
      }}
    >
      <Toolbar sx={{ px: 2 }}>
        <ClinixLogo size={32} />
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List>
          {menuItems
            .filter((item) => !item.roles || (role && item.roles.includes(role)))
            .map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={[
                    { borderRadius: 2, mx: 1, my: 0.3 },
                    isActive && {
                      bgcolor: `${ACTIVE_BG} !important`,
                      color: '#FFFFFF !important',
                      '&:hover': { bgcolor: '#3949AB !important' },
                      '& .MuiListItemIcon-root': { color: '#FFFFFF !important' },
                      '& .MuiListItemText-primary': { fontWeight: 600, color: '#FFFFFF !important' },
                      '&.Mui-selected': { bgcolor: `${ACTIVE_BG} !important` },
                    },
                  ]}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
        </List>
      </Box>
    </Drawer>
  );
}
