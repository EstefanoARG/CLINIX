import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqData = [
  {
    question: '¿Los planes tienen compromiso de permanencia?',
    answer: 'Sí, la suscripción a un plan tiene un periodo de permanencia para que podamos asegurarte los mejores resultados.',
  },
  {
    question: '¿Cuáles son las modalidades de pago disponibles para los planes?',
    answer: 'El pago de la suscripción es anual. Si lo deseas, también puedes contratar nuestro servicio de página web junto con tu Plan CLINIX.',
  },
  {
    question: '¿Necesito conocimientos de cómputo para usar la plataforma de CLINIX?',
    answer: 'La gestión de la agenda CLINIX y todas sus características es muy sencilla, no requiere instalación alguna ni la intervención de personal técnico.',
  },
  {
    question: '¿Hay un límite de destinatarios a los que puedo enviar una campaña?',
    answer: 'Sí. El límite de destinatarios se basa en el número de correos electrónicos o SMS que tienes disponibles al mes, no en los usuarios únicos.',
  },
  {
    question: '¿Qué posición ocuparé con mi plan en los listados de CLINIX?',
    answer: 'Tener un Plan CLINIX te permite posicionarte por delante de los usuarios con perfil gratuito.',
  },
  {
    question: '¿Cómo puedo ver mis facturas?',
    answer: 'Enviamos las facturas directamente a la dirección de correo asociada a tu perfil. Además, podrás acceder a todas ellas desde el apartado de facturación de tu perfil de CLINIX.',
  },
];

export default function FAQ() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const leftItems = faqData.slice(0, 3);
  const rightItems = faqData.slice(3, 6);

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', color: '#012c6d', fontWeight: 700, mb: 4 }}
        >
          Preguntas frecuentes
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {leftItems.map((item, idx) => (
              <Accordion
                key={`left-${idx}`}
                expanded={expanded === `panel-left-${idx}`}
                onChange={handleChange(`panel-left-${idx}`)}
                sx={{
                  boxShadow: 'none',
                  borderBottom: '1px solid #dcdfe3',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ color: '#012c6d', fontWeight: 500 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {rightItems.map((item, idx) => (
              <Accordion
                key={`right-${idx}`}
                expanded={expanded === `panel-right-${idx}`}
                onChange={handleChange(`panel-right-${idx}`)}
                sx={{
                  boxShadow: 'none',
                  borderBottom: '1px solid #dcdfe3',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ color: '#012c6d', fontWeight: 500 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
