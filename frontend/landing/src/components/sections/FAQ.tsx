import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

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

import type { Variants } from 'framer-motion';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function FAQ() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 800, color: '#0F4C81', mb: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}
          >
            Preguntas frecuentes
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: '#64748b', mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Resolvemos tus dudas sobre nuestros planes y servicios
          </Typography>
        </motion.div>

        <Accordion.Root type="single" collapsible>
          {faqData.map((item, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={itemVariants}
            >
              <Box
                component={Accordion.Item}
                value={`item-${idx}`}
                sx={{
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    style={{
                      all: 'unset',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '16px 0',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: '#0F4C81', fontWeight: 600, fontSize: '1rem', textAlign: 'left', pr: 2 }}
                    >
                      {item.question}
                    </Typography>
                    <ChevronDown
                      size={20}
                      className="accordion-chevron"
                      style={{
                        color: '#2563EB',
                        flexShrink: 0,
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content
                  className="accordion-content"
                  style={{
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ pb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}
                    >
                      {item.answer}
                    </Typography>
                  </Box>
                </Accordion.Content>
              </Box>
            </motion.div>
          ))}
        </Accordion.Root>
      </Container>

      <style>{`
        .accordion-chevron[data-state="open"] {
          transform: rotate(180deg);
        }
        .accordion-content[data-state="open"] {
          animation: slideDown 0.3s ease-out;
        }
        .accordion-content[data-state="closed"] {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideDown {
          from { height: 0; opacity: 0; }
          to { height: var(--radix-accordion-content-height); opacity: 1; }
        }
        @keyframes slideUp {
          from { height: var(--radix-accordion-content-height); opacity: 1; }
          to { height: 0; opacity: 0; }
        }
      `}</style>
    </Box>
  );
}
