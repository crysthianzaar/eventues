import Script from 'next/script';

export default function SiteNavigationJsonLd() {
  // Define as principais seções do site para aparecerem como tabs no Google
  const navigationItems = [
    {
      name: 'Eventos',
      url: 'https://eventues.com.br',
      description: 'Encontre os melhores eventos perto de você! Calendário completo com os melhores eventos.'
    },
    {
      name: 'Login para participantes',
      url: 'https://eventues.com.br/login',
      description: 'Área do Participante com calendário, próximos eventos e histórico de participações.'
    },
    {
      name: 'Meus Eventos',
      url: 'https://eventues.com.br/meus_eventos',
      description: 'Confira os seus eventos.'
    },
    {
      name: 'Sobre a plataforma',
      url: 'https://eventues.com.br/seja_organizador',
      description: 'O Eventues é uma plataforma completa para organização e participação em eventos.'
    },
  ];

  // Estrutura do SiteNavigationElement para o Google mostrar as tabs
  const navigationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Eventues',
    'url': 'https://eventues.com.br',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://eventues.com.br/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    'hasPart': navigationItems.map(item => ({
      '@type': 'WebPage',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'Eventues',
        'url': 'https://eventues.com.br'
      },
      'name': item.name,
      'description': item.description,
      'url': item.url
    }))
  };

  // Estrutura específica para SiteNavigationElement
  const siteNavJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': navigationItems.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      'position': index + 1,
      'name': item.name,
      'description': item.description,
      'url': item.url
    }))
  };

  // BreadcrumbList para melhorar ainda mais o SEO
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': navigationItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };

  return (
    <>
      <Script id="website-navigation-jsonld" type="application/ld+json">
        {JSON.stringify(navigationJsonLd)}
      </Script>
      <Script id="site-navigation-jsonld" type="application/ld+json">
        {JSON.stringify(siteNavJsonLd)}
      </Script>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
