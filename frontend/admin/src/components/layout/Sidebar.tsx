import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box,
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
import HotelIcon from '@mui/icons-material/Hotel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const DRAWER_WIDTH = 260;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Doctores', path: '/doctores', icon: <PeopleIcon /> },
  { label: 'Enfermeras', path: '/enfermeras', icon: <WomanIcon /> },
  { label: 'Pacientes', path: '/pacientes', icon: <PatientsIcon /> },
  { label: 'Especialidades', path: '/especialidades', icon: <LocalHospitalIcon /> },
  { label: 'Departamentos', path: '/departamentos', icon: <BusinessIcon /> },
  { label: 'Ubicaciones', path: '/ubicaciones', icon: <MeetingRoomIcon /> },
  { label: 'Citas', path: '/citas', icon: <CalendarMonthIcon /> },
  { label: 'Reservas Web', path: '/reservas', icon: <BookOnlineIcon /> },
  { label: 'Habitaciones', path: '/habitaciones', icon: <HotelIcon /> },
  { label: 'Admisiones', path: '/admisiones', icon: <AssignmentIcon /> },
  { label: 'Auditoría', path: '/auditoria', icon: <ReceiptLongIcon /> },
  { label: 'Panel Médico', path: '/panel/doctor', icon: <MedicalServicesIcon />, roles: ['Médico'] },
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
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar sx={{ fontWeight: 700, fontSize: 20, color: 'primary.main' }}>
        CLINIX Admin
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems
            .filter((item) => !item.roles || (role && item.roles.includes(role)))
            .map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname.startsWith(item.path)}
                onClick={() => navigate(item.path)}
                sx={{ borderRadius: 1, mx: 1, my: 0.3 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
        </List>
      </Box>
    </Drawer>
  );
}
