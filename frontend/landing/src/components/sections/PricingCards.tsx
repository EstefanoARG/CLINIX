import { useState } from 'react';
import type { ElementType } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Check, Crown, Info, Star, Zap } from 'lucide-react';
import type { PricingPlan } from '../../types';

const planIcons: Record<string, ElementType> = {
  star: Star,
  zap: Zap,
  crown: Crown,
  starter: Star,
  plus: Zap,
  vip: Crown,
};

interface PricingCardsProps {
  plans: PricingPlan[];
}

export default function PricingCards({ plans }: PricingCardsProps) {
  const [webEnabled, setWebEnabled] = useState(false);

  if (plans.length === 0) return null;

  return (
    <Box id="pricing" sx={{ bgcolor: '#F8FAFC', py: { xs: 6, md: 10 }, scrollMarginTop: '80px' }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {plans.map((plan, idx) => {
            const currentPrice = webEnabled ? plan.hiddenPrice : plan.price;
            const PlanIcon = planIcons[plan.icon] ?? planIcons[plan.id] ?? Star;

            return (
              <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                    <Box sx={{ position: 'relative' }}>
                      {plan.popular && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -14,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            px: 2.5,
                            py: 0.6,
                            borderRadius: '20px',
                            zIndex: 2,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {plan.popularLabel ?? 'Más Popular'}
                        </Box>
                      )}

                      <Card
                        sx={{
                          borderRadius: '24px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: plan.popular
                            ? '0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                            : '0 2px 16px rgba(0,0,0,0.06)',
                          border: plan.popular ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          maxWidth: 360,
                          mx: 'auto',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: plan.popular
                              ? '0 16px 48px rgba(37,99,235,0.18)'
                              : '0 12px 40px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                      <CardContent sx={{ p: 3.5 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              bgcolor: `${plan.accentColor}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 1.5,
                            }}
                          >
                            <PlanIcon size={26} color={plan.accentColor} />
                          </Box>
                          <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 700 }}>
                            {plan.name}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ textAlign: 'center', mb: 3, px: 1, lineHeight: 1.5, color: '#64748B' }}
                        >
                          {plan.description}
                        </Typography>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              color: '#0F4C81',
                              fontWeight: 800,
                              display: 'inline',
                              fontSize: { xs: '1.75rem', md: '2rem' },
                            }}
                          >
                            S/ {currentPrice.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 0.3 }}>
                            {plan.period}
                          </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#F8FAFC', borderRadius: '12px', p: 1.5, mb: 2.5 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={webEnabled}
                                onChange={() => setWebEnabled((value) => !value)}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#93C5FD' },
                                  '& .MuiSwitch-track': { bgcolor: '#E2E8F0' },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                                  Página web profesional
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  S/55 por mes, con cargo anual
                                </Typography>
                              </Box>
                            }
                            sx={{ mx: 0 }}
                          />
                        </Box>

                        <Button
                          fullWidth
                          variant={plan.popular ? 'contained' : 'outlined'}
                          href={plan.buttonHref ?? '#contact'}
                          sx={{
                            mb: 2.5,
                            py: 1.3,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            ...(plan.popular
                              ? {
                                  background: 'linear-gradient(135deg, #2563EB, #0F4C81)',
                                  color: 'white',
                                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1D4ED8, #0A3A6B)',
                                    boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                                  },
                                }
                              : {
                                  borderColor: '#2563EB',
                                  color: '#2563EB',
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderColor: '#1D4ED8',
                                    bgcolor: 'rgba(37,99,235,0.04)',
                                    borderWidth: 2,
                                  },
                                }),
                          }}
                        >
                          {plan.buttonText ?? 'Elegir plan'}
                        </Button>

                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: '#64748B',
                            mb: 2,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {plan.benefitsIntro ?? 'Beneficios incluidos:'}
                        </Typography>

                        {plan.features.map((feature) => (
                          <Box
                            key={feature.text}
                            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}
                          >
                            <Box
                              sx={{
                                mt: 0.2,
                                flexShrink: 0,
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: '#DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Check size={12} color="#2563EB" strokeWidth={3} />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>
                                {feature.text}
                              </Typography>
                              {feature.tooltip && (
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: '#94A3B8',
                                    '&:hover': { color: '#2563EB' },
                                  }}
                                  title={feature.tooltip}
                                >
                                  <Info size={14} />
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
