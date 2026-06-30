import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'Producto', href: '#' },
  { label: 'Precios', href: '#pricing' },
  {
    label: 'Recursos gratuitos',
    href: '#',
    children: [
      { label: 'Guías', href: '#', desc: 'Manuales que le ayudarán a sacarle el máximo provecho.' },
      { label: 'Preguntas frecuentes', href: '#faq', desc: 'Respuestas a las dudas más frecuentes.' },
    ],
  },
];

const SECTION_IDS = ['pricing', 'faq'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.2, rootMargin: '-80px 0px 0px 0px' },
    );

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el!));
    return () => elements.forEach((el) => observer.unobserve(el!));
  }, []);

  const closeDrawer = () => {
    setMobileOpen(false);
    setMobileSubmenu(false);
  };

  const handleDropdownEnter = (label: string, el: HTMLElement) => {
    setActiveDropdown(label);
    setAnchorEl(el);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: '#FFFFFF',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: '#E2E8F0',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72 }}>
            <Box
              component="a"
              href="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1.5 }}
            >
              <svg viewBox="0 0 48 48" width={28} height={28}>
                <path d="M40.9 17.8 A18 18 0 1 0 40.9 30.2"
                  fill="none" stroke="url(#c-logo-nav)" strokeWidth={7} strokeLinecap="round" />
                <rect x={16} y={22} width={16} height={4} rx={2} fill="#2979FF" />
                <rect x={22} y={16} width={4} height={16} rx={2} fill="#2979FF" />
                <defs>
                  <linearGradient id="c-logo-nav" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="50%" stopColor="#2979FF" />
                    <stop offset="100%" stopColor="#304FFE" />
                  </linearGradient>
                </defs>
              </svg>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1A237E 0%, #283593 50%, #1565C0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Clinix
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => (
                <Box key={link.label}
                  onMouseEnter={(e) => link.children && handleDropdownEnter(link.label, e.currentTarget)}
                  onMouseLeave={handleDropdownLeave}
                >
                  {link.children ? (
                    <>
                      <Button
                        color="inherit"
                        sx={{
                          color: activeDropdown === link.label ? '#2563EB' : '#475569',
                          fontWeight: 500,
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          px: 2,
                          py: 1,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: activeDropdown === link.label ? '60%' : 0,
                            height: 2.5,
                            bgcolor: '#2563EB',
                            borderRadius: '2px',
                            transition: 'width 0.25s ease',
                          },
                          '&:hover::after': { width: '60%' },
                          '&:hover': { bgcolor: 'transparent', color: '#2563EB' },
                        }}
                        endIcon={<ChevronDown size={16} />}
                      >
                        {link.label}
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={activeDropdown === link.label}
                        onClose={handleDropdownLeave}
                        slotProps={{
                          list: { onMouseLeave: handleDropdownLeave },
                          paper: {
                            sx: {
                              mt: 1.5,
                              borderRadius: 2,
                              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                              border: '1px solid #E2E8F0',
                              minWidth: 280,
                              p: 0.5,
                            },
                          },
                        }}
                        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                      >
                        {link.children.map((child) => (
                          <MenuItem
                            key={child.label}
                            onClick={handleDropdownLeave}
                            sx={{ py: 1.5, px: 2, borderRadius: 1.5, mx: 0.5 }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem' }}
                              >
                                {child.label}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.8rem' }}>
                                {child.desc}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  ) : (
                    <Button
                      href={link.href}
                      sx={{
                        color: link.href === `#${activeSection}` ? '#2563EB' : '#475569',
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        px: 2,
                        py: 1,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: link.href === `#${activeSection}` ? '60%' : 0,
                          height: 2.5,
                          bgcolor: '#2563EB',
                          borderRadius: '2px',
                          transition: 'width 0.25s ease',
                        },
                        '&:hover::after': { width: '60%' },
                        '&:hover': { bgcolor: 'transparent', color: '#2563EB' },
                      }}
                    >
                      {link.label}
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                variant="contained"
                href="#contact"
                sx={{
                  ml: 2,
                  background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #0A3B6D 100%)',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                  },
                  borderRadius: '8px',
                  px: 3,
                  py: 1.25,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                }}
              >
                Solicitar una demostración
              </Button>
            </Box>

            <IconButton
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              sx={{
                display: { lg: 'none' },
                color: '#0F172A',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => {
          setMobileOpen(false);
          setMobileSubmenu(false);
        }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              bgcolor: '#FFFFFF',
              pt: 2,
            },
          },
        }}
      >
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <svg viewBox="0 0 48 48" width={24} height={24}>
            <path d="M40.9 17.8 A18 18 0 1 0 40.9 30.2"
              fill="none" stroke="url(#c-logo-mob)" strokeWidth={7} strokeLinecap="round" />
            <rect x={16} y={22} width={16} height={4} rx={2} fill="#2979FF" />
            <rect x={22} y={16} width={4} height={16} rx={2} fill="#2979FF" />
            <defs>
              <linearGradient id="c-logo-mob" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="50%" stopColor="#2979FF" />
                <stop offset="100%" stopColor="#304FFE" />
              </linearGradient>
            </defs>
          </svg>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #1A237E 0%, #283593 50%, #1565C0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Clinix
          </Typography>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, x: 24 }}
              animate={mobileOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
              transition={{ delay: idx * 0.06, duration: 0.25, ease: 'easeOut' }}
            >
              <Box>
                {link.children ? (
                  <>
                    <ListItemButton
                      onClick={() => setMobileSubmenu(!mobileSubmenu)}
                      sx={{ borderRadius: 2, mx: 1, my: 0.25 }}
                    >
                      <ListItemText
                        primary={link.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: 600,
                              color: '#0F172A',
                              fontSize: '0.95rem',
                              fontFamily: 'Inter, sans-serif',
                            }
                          }
                        }}
                      />
                      <ChevronDown
                        size={18}
                        style={{
                          transform: mobileSubmenu ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                          color: '#64748B',
                          flexShrink: 0,
                        }}
                      />
                    </ListItemButton>
                    {mobileSubmenu &&
                      link.children.map((child) => (
                        <ListItem key={child.label} disablePadding sx={{ pl: 2 }}>
                          <ListItemButton sx={{ borderRadius: 2, mx: 1 }}>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.875rem' }}
                              >
                                {child.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: '#64748B', fontSize: '0.75rem', mt: 0.25 }}
                              >
                                {child.desc}
                              </Typography>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                  </>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton
                      component="a"
                      href={link.href}
                      onClick={closeDrawer}
                      sx={{ borderRadius: 2, mx: 1, my: 0.25 }}
                    >
                      <ListItemText
                        primary={link.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: 600,
                              color: '#0F172A',
                              fontSize: '0.95rem',
                              fontFamily: 'Inter, sans-serif',
                            }
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </Box>
            </motion.div>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ px: 2 }}>
          <Button
            fullWidth
            variant="contained"
            href="#contact"
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #0F4C81 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #0A3B6D 100%)',
              },
              borderRadius: '8px',
              py: 1.25,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Solicitar una demostración
          </Button>
        </Box>
      </Drawer>

      <Toolbar sx={{ height: 72 }} />
    </>
  );
}
