import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, Link, Alert, CircularProgress,
  Checkbox, FormControlLabel, useMediaQuery, useTheme,
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import PublicFooter from '../../components/layout/PublicFooter';

function MedicalCross({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <path d="M40.9 17.8 A18 18 0 1 0 40.9 30.2"
        fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      <rect x={16} y={22} width={16} height={4} rx={2} fill="currentColor" />
      <rect x={22} y={16} width={4} height={16} rx={2} fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Ingrese un correo válido';
    }
    if (password.length < 6) {
      errors.password = 'Mínimo 6 caracteres';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const role = await login({ email, password });
      if (role === 'Médico') navigate('/panel/doctor');
      else if (role === 'Enfermero') navigate('/panel/enfermeria');
      else if (role === 'Recepcionista') navigate('/bandeja');
      else navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailBlur = () => {
    if (email && (!email.includes('@') || !email.includes('.'))) {
      setFieldErrors((prev) => ({ ...prev, email: 'Ingrese un correo válido' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordBlur = () => {
    if (password && password.length < 6) {
      setFieldErrors((prev) => ({ ...prev, password: 'Mínimo 6 caracteres' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const formCard = (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
        px: 4, py: 3,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44, borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.15)',
        }}>
          <MedicalCross size={24} />
        </Box>
        <Box>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
            Clinix
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 400 }}>
            Portal administrativo
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3.5, py: 3 }}>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5, fontSize: 13 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Box sx={{ mb: 2 }}>
            <Box
              component="label"
              htmlFor="login-email"
              sx={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', mb: 0.5 }}
            >
              Correo electrónico
            </Box>
            <TextField
              id="login-email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
              onBlur={handleEmailBlur}
              required
              placeholder="admin@clinix.pe"
              autoComplete="email"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#94A3B8' }}>
                      <Mail size={16} />
                    </Box>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  fontSize: 14,
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#2563EB' },
                  '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box
              component="label"
              htmlFor="login-password"
              sx={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', mb: 0.5 }}
            >
              Contraseña
            </Box>
            <TextField
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
              onBlur={handlePasswordBlur}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#94A3B8' }}>
                      <Lock size={16} />
                    </Box>
                  ),
                  endAdornment: (
                    <Box
                      onClick={() => setShowPassword((v) => !v)}
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#94A3B8', '&:hover': { color: '#64748B' } }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Box>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  fontSize: 14,
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#2563EB' },
                  '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  size="small"
                  sx={{
                    color: '#94A3B8',
                    '&.Mui-checked': { color: '#2563EB' },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: 13, color: '#64748B' }}>Recordarme</Typography>}
              sx={{ ml: -0.5 }}
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                fontSize: 12, color: '#94A3B8', textDecoration: 'none', fontWeight: 500,
                '&:hover': { color: '#2563EB', textDecoration: 'underline' },
              }}
            >
              ¿Olvidó su contraseña?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.4,
              borderRadius: 2,
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
              color: '#FFFFFF',
              '&:hover': { background: 'linear-gradient(135deg, #1D4ED8, #0A3A6B)' },
              '&.Mui-disabled': { background: '#94A3B8', color: '#FFFFFF' },
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: '#FFFFFF' }} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LogIn size={16} />
                Entrar
              </Box>
            )}
          </Button>
        </form>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Brand panel - desktop */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: -100, right: -100, width: 300, height: 300,
            borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -60, left: -60, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
            pointerEvents: 'none',
          }} />

          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1, px: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ color: '#FFFFFF', mb: 4 }}>
                <MedicalCross size={120} />
              </Box>
              <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 48, mb: 2, letterSpacing: '-0.5px' }}>
                Clinix
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, fontWeight: 400, maxWidth: 360, mx: 'auto', lineHeight: 1.5 }}>
                Tu salud, nuestra prioridad
              </Typography>
            </motion.div>
          </Box>

          <Box sx={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              &copy; {new Date().getFullYear()} Clinix
            </Typography>
          </Box>
        </Box>

        {/* Form panel - desktop & mobile */}
        <Box sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F8FAFC',
          position: 'relative',
        }}>
          {/* Mobile brand bar */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
            px: 3, py: 2.5,
            alignItems: 'center', gap: 2,
          }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.15)',
            }}>
              <MedicalCross size={20} />
            </Box>
            <Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                Clinix
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 400 }}>
                Portal administrativo
              </Typography>
            </Box>
          </Box>

          {/* Background decoration */}
          <Box sx={{
            position: 'absolute', top: -120, right: -120, width: 400, height: 400,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -80, left: -80, width: 300, height: 300,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,76,129,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 600, height: 600,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 },
          }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: isDesktop ? 0.1 : 0 }}
              style={{ width: '100%', maxWidth: 420 }}
            >
              {formCard}
            </motion.div>
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <PublicFooter />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
