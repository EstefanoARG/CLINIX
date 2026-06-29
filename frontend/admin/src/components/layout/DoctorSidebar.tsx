import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box,
} from '@mui/material';
import { CalendarDays, Users, Stethoscope } from 'lucide-react';

const DRAWER_WIDTH = 260;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: 'Agenda Médica', path: '/panel/doctor', icon: <CalendarDays size={20} /> },
  { label: 'Mis Pacientes', path: '/panel/doctor/pacientes', icon: <Users size={20} /> },
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
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
        },
      }}
    >
      <Toolbar sx={{ px: 2.5, gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: '#0F4C81',
          }}
        >
          <Stethoscope size={26} strokeWidth={2} />
          <Box sx={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, lineHeight: 1 }}>
            CLINIX
          </Box>
        </Box>
      </Toolbar>
      <Box sx={{ overflow: 'auto', py: 1.5 }}>
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
                sx={{
                  borderRadius: 2,
                  mx: 1.5,
                  my: 0.3,
                  px: 2,
                  ...(isActive
                    ? {
                        bgcolor: '#DBEAFE',
                        color: '#2563EB',
                        borderLeft: '3px solid #2563EB',
                        pl: 1.5,
                        '&:hover': { bgcolor: '#DBEAFE' },
                        '& .MuiListItemText-primary': { fontWeight: 600 },
                        '&.Mui-selected': { bgcolor: '#DBEAFE' },
                      }
                    : {
                        color: '#475569',
                        '&:hover': { bgcolor: '#F8FAFC' },
                      }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#2563EB' : '#94A3B8',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { sx: { fontSize: 14, fontWeight: isActive ? 600 : 500 } },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
