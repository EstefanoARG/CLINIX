import { Helmet } from 'react-helmet-async';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'CLINIX',
      description: 'Sistema de gestión hospitalaria con agendamiento, telemedicina, historias clínicas digitales y facturación.',
      applicationCategory: 'MedicalApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        offerCount: 3,
        offers: [
          { '@type': 'Offer', name: 'Starter', description: 'Plan básico para consultorios individuales' },
          { '@type': 'Offer', name: 'Plus', description: 'Plan profesional con página web' },
          { '@type': 'Offer', name: 'VIP', description: 'Plan completo para clínicas y hospitales' },
        ],
      },
    },
    {
      '@type': 'Organization',
      name: 'CLINIX',
      url: 'https://clinix.pe',
      address: { '@type': 'PostalAddress', streetAddress: 'C/ Josep Pla 2 - Edificio B2, planta 13', addressLocality: 'Barcelona', addressCountry: 'ES' },
    },
  ],
};

export default function SeoHead() {
  return (
    <Helmet>
      <html lang="es" />
      <title>CLINIX — Sistema de Gestión Hospitalaria para tu Clínica</title>
      <meta name="description" content="Optimiza cada aspecto de tu clínica con herramientas de agendamiento, telemedicina, historias clínicas digitales y facturación, todo en un solo lugar." />
      <meta name="keywords" content="gestión hospitalaria, clínica, agendamiento, telemedicina, historias clínicas, facturación, Perú" />
      <meta property="og:title" content="CLINIX — Sistema de Gestión Hospitalaria" />
      <meta property="og:description" content="Optimiza tu clínica con herramientas de agendamiento, telemedicina y facturación." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://clinix.pe" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
