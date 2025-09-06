'use client';

const WebsiteJsonLd = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eventues',
    alternateName: 'Eventues - Plataforma de Eventos Esportivos',
    description: 'A maior plataforma de eventos esportivos do Brasil. Encontre corridas, maratonas, competições e torneios em todo o país.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'Eventues',
      url: baseUrl
    },
    inLanguage: 'pt-BR',
    copyrightYear: new Date().getFullYear(),
    publisher: {
      '@type': 'Organization',
      name: 'Eventues',
      url: baseUrl
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default WebsiteJsonLd;
