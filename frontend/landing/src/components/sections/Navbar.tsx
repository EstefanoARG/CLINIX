import { useState } from 'react';
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
import MenuIcon from '@mui/icons-material/Menu';

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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(false);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'white',
          boxShadow: '0 1px 7px rgba(0,0,0,0.12)',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box
              component="a"
              href="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}
              >
                CLINIX
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1 }}>
              {navLinks.map((link) => (
                <Box key={link.label}>
                  {link.children ? (
                    <>
                      <Button
                        color="inherit"
                        sx={{ color: '#012c6d', fontWeight: 500, textTransform: 'none' }}
                        onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                      >
                        {link.label}
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        slotProps={{ paper: { onMouseLeave: () => setAnchorEl(null) } }}
                        sx={{ mt: 1 }}
                      >
                        {link.children.map((child) => (
                          <MenuItem key={child.label} onClick={() => setAnchorEl(null)}>
                            <Box sx={{ py: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: '#012c6d' }}>
                                {child.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
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
                      sx={{ color: '#012c6d', fontWeight: 500, textTransform: 'none' }}
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
                  bgcolor: '#3d83df',
                  '&:hover': { bgcolor: '#1565C0' },
                  borderRadius: '4px',
                  px: 3,
                }}
              >
                Solicitar una demostración
              </Button>
            </Box>

            <IconButton
              sx={{ display: { lg: 'none' } }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
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
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <Box key={link.label}>
                {link.children ? (
                  <>
                    <ListItemButton onClick={() => setMobileSubmenu(!mobileSubmenu)}>
                      <ListItemText primary={link.label} sx={{ color: '#012c6d' }} />
                    </ListItemButton>
                    {mobileSubmenu &&
                      link.children.map((child) => (
                        <ListItem key={child.label} disablePadding sx={{ pl: 2 }}>
                          <ListItemButton>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: '#012c6d' }}>
                                {child.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {child.desc}
                              </Typography>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                  </>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemText primary={link.label} sx={{ color: '#012c6d' }} />
                    </ListItemButton>
                  </ListItem>
                )}
              </Box>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ px: 2 }}>
            <Button
              fullWidth
              variant="contained"
              href="#contact"
              sx={{ bgcolor: '#3d83df' }}
            >
              Solicitar una demostración
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Toolbar />
    </>
  );
}
