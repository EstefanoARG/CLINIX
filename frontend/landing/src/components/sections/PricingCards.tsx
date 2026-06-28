import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface PlanFeature {
  text: string;
  tooltip: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  hiddenPrice: number;
  period: string;
  accentColor: string;
  icon: string;
  features: PlanFeature[];
  popular?: boolean;
  popularLabel?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Digitalízate y gana visibilidad con reservas en línea y recordatorios de visitas.',
    price: 199.17,
    hiddenPrice: 254.17,
    period: 'Al mes, con cargo anual',
    accentColor: '#D85F99',
    icon: '★',
    features: [
      { text: 'Calendario para consulta en línea', tooltip: 'Permite que tus pacientes reserven consultas en línea en un calendario especializado.' },
      { text: 'Recordatorios de visitas por correo electrónico y notificaciones push', tooltip: 'Reduce las ausencias con recordatorios automáticos.' },
      { text: 'Campañas de SMS', tooltip: 'Mantente en contacto con tus pacientes.' },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Ofrece una excelente experiencia a tus pacientes y haz más eficiente tu práctica.',
    price: 249.17,
    hiddenPrice: 304.17,
    period: 'Al mes, con cargo anual',
    accentColor: '#1662C6',
    icon: '★★',
    popular: true,
    popularLabel: 'MOST POPULAR',
    features: [
      { text: 'Episodios clínicos', tooltip: 'Recopila toda la información de tus pacientes.' },
      { text: 'Recordatorios de visitas mediante SMS', tooltip: 'Reduce las ausencias con recordatorios automáticos vía SMS.' },
      { text: 'Consulta en línea', tooltip: 'Videoconsulta segura con tus pacientes.' },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Impulsa tu éxito con las mejores herramientas para ti y tus pacientes.',
    price: 299.17,
    hiddenPrice: 354.17,
    period: 'Al mes, con cargo anual',
    accentColor: '#F9A83E',
    icon: '★★★',
    features: [
      { text: 'Diseño de tu perfil', tooltip: 'Perfil público optimizado para destacar.' },
      { text: 'Lista de espera', tooltip: 'Notifica a tus pacientes si se libera un espacio.' },
      { text: 'Envíos masivos', tooltip: 'Cancela citas y envía mensajes masivos.' },
    ],
  },
];

export default function PricingCards() {
  const [webEnabled, setWebEnabled] = useState(false);

  return (
    <Box sx={{ bgcolor: '#f7f9fa', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {plans.map((plan) => {
            const currentPrice = webEnabled ? plan.hiddenPrice : plan.price;

            return (
              <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                <Box sx={{ position: 'relative' }}>
                  {plan.popular && (
                    <Chip
                      label={plan.popularLabel}
                      sx={{
                        position: 'absolute',
                        top: -16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: plan.accentColor,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 30,
                        borderRadius: '4px 4px 0 0',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <Card
                    sx={{
                      borderTop: `4px solid ${plan.accentColor}`,
                      borderRadius: 2,
                      boxShadow: '0 1px 7px rgba(0,0,0,0.12)',
                      maxWidth: 350,
                      mx: 'auto',
                      position: 'relative',
                      ...(plan.popular && {
                        transform: { md: 'scale(1.05)' },
                      }),
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography
                          variant="h4"
                          sx={{ color: plan.accentColor, fontWeight: 600 }}
                        >
                          {plan.icon} {plan.name}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', mb: 3, px: 1 }}
                      >
                        {plan.description}
                      </Typography>

                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography
                          variant="h3"
                          sx={{ color: '#012c6d', fontWeight: 700, display: 'inline' }}
                        >
                          S/ {currentPrice.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                          {plan.period}
                        </Typography>
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={webEnabled}
                            onChange={() => setWebEnabled(!webEnabled)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#3d83df',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                bgcolor: '#3d83df',
                              },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ color: '#012c6d' }}>
                              Página web profesional
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              S/55 por mes, con cargo anual
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 2 }}
                      />

                      <Button
                        fullWidth
                        variant={plan.popular ? 'contained' : 'outlined'}
                        href="#"
                        sx={{
                          mb: 2,
                          ...(plan.popular
                            ? { bgcolor: '#3d83df' }
                            : {
                                borderColor: '#3d83df',
                                color: '#3d83df',
                              }),
                        }}
                      >
                        Elegir plan
                      </Button>

                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#012c6d', mb: 2, fontSize: '0.9rem' }}
                      >
                        {plan.id === 'starter'
                          ? 'Todo lo del perfil gratuito y:'
                          : plan.id === 'plus'
                          ? 'Todos los beneficios del plan Starter y:'
                          : 'Todos los beneficios del plan Plus y:'}
                      </Typography>

                      {plan.features.map((feature) => (
                        <Box
                          key={feature.text}
                          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}
                        >
                          <CheckCircleIcon sx={{ color: '#012c6d', fontSize: 18, mt: 0.3 }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: '#012c6d' }}>
                              {feature.text}
                            </Typography>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                              }}
                              title={feature.tooltip}
                            >
                              <InfoOutlinedIcon
                                sx={{ fontSize: 14, color: 'text.secondary', ml: 0.5 }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
