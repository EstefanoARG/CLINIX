import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider,
} from '@mui/material';
import PatientsIcon from '@mui/icons-material/Accessible';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ClinixLogo from '../ClinixLogo';

const DRAWER_WIDTH = 260;
const ACTIVE_BG = '#303F9F';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: 'Agenda Médica', path: '/panel/doctor', icon: <MedicalServicesIcon /> },
  { label: 'Mis Pacientes', path: '/panel/doctor/pacientes', icon: <PatientsIcon /> },
];

interface DoctorSidebarProps {
  role: string | null;
}

export default function DoctorSidebar(_props: DoctorSidebarProps) {
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
          {menuItems.map((item) => {
            const isActive = item.path === '/panel/doctor'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
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
