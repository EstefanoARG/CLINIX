import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, Link, Alert, CircularProgress,
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import PublicFooter from '../../components/layout/PublicFooter';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', position: 'relative' }}>
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: 400, position: 'relative', zIndex: 1 }}
      >
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}>
          {/* Gradient header */}
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
              <svg viewBox="0 0 48 48" width={24} height={24}>
                <path d="M40.9 17.8 A18 18 0 1 0 40.9 30.2"
                  fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
                <rect x={16} y={22} width={16} height={4} rx={2} fill="#FFFFFF" />
                <rect x={22} y={16} width={4} height={16} rx={2} fill="#FFFFFF" />
              </svg>
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

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#64748B', mb: 0.5 }}>
                  Correo electrónico
                </Typography>
                <TextField
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@clinix.pe"
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

              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#64748B', mb: 0.5 }}>
                  Contraseña
                </Typography>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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

            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
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
          </Box>
        </Card>

        <Box sx={{ mt: 2 }}>
          <PublicFooter />
        </Box>
      </motion.div>
    </Box>
  );
}
