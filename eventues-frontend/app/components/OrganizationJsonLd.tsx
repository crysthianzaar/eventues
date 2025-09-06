'use client';

interface OrganizationJsonLdProps {
  organizationName?: string;
  description?: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    email?: string;
  };
}

const OrganizationJsonLd: React.FC<OrganizationJsonLdProps> = ({
  organizationName = "Eventues",
  description = "Plataforma líder em eventos esportivos no Brasil. Encontre, organize e participe dos melhores eventos esportivos em todo o país.",
  logo,
  contactPoint
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizationName,
    description: description,
    url: baseUrl,
    logo: logo || `${baseUrl}/logo.png`,
    sameAs: [
      'https://www.facebook.com/eventues',
      'https://www.instagram.com/eventues',
      'https://www.twitter.com/eventues',
      'https://www.linkedin.com/company/eventues'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactPoint?.telephone || '+55-11-99999-9999',
      email: contactPoint?.email || 'contato@eventues.com',
      contactType: 'customer service',
      areaServed: 'BR',
      availableLanguage: 'Portuguese'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressLocality: 'São Paulo',
      addressRegion: 'SP'
    },
    foundingDate: '2024',
    knowsAbout: [
      'Eventos Esportivos',
      'Corridas',
      'Maratonas',
      'Competições',
      'Torneios',
      'Campeonatos',
      'Inscrições Online',
      'Gestão de Eventos'
    ],
    serviceArea: {
      '@type': 'Country',
      name: 'Brasil'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default OrganizationJsonLd;
