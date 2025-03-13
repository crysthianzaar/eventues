import { Metadata } from 'next';
import { formatPrice } from '@/app/utils/formatters';
import { Event, Ingresso } from '@/app/apis/api';

/**
 * Gera os metadados para a página do evento
 * @param event Dados do evento
 * @param tickets Lista de ingressos disponíveis
 */
export function generateEventMetadata(
  event: Event,
  tickets?: Ingresso[]
): Metadata {
  // Encontra o ingresso mais barato para exibir no título
  const cheapestTicket = tickets?.reduce((prev, current) => {
    return prev.valor < current.valor ? prev : current;
  }, tickets[0]);

  // Formata o preço do ingresso mais barato, se disponível
  const priceText = cheapestTicket 
    ? `a partir de ${formatPrice(cheapestTicket.valor)}` 
    : '';

  // Construir uma descrição mais rica para SEO
  const description = event.event_description || 
    `Participe do evento ${event.name} em ${event.city}, ${event.state}. ${priceText}. Data: ${new Date(event.start_date).toLocaleDateString('pt-BR')}. Não perca esta oportunidade!`;

  // Construir tags para melhor indexação
  const keywords = `${event.name}, eventos em ${event.city}, ${event.event_type || 'evento'}, ${event.category || ''}, ingressos, ${event.state}`;

  // Construir JSON-LD para Event Schema.org
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: description,
    startDate: event.start_date,
    endDate: event.end_date || event.start_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.address_detail || `${event.city}, ${event.state}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address,
        addressLocality: event.city,
        addressRegion: event.state,
        addressCountry: 'BR'
      }
    },
    image: [
      `https://eventues.com.br/images/events/${event.event_id}.jpg`
    ],
    organizer: {
      '@type': 'Organization',
      name: event.organization_name || 'Eventues',
      url: 'https://eventues.com.br'
    },
    offers: tickets?.map(ticket => ({
      '@type': 'Offer',
      name: ticket.nome,
      price: ticket.valor,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      validFrom: event.start_date,
      url: `https://eventues.com.br/e/${event.slug}/tickets`
    })) || []
  };

  return {
    title: `${event.name} ${priceText} | Eventues`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: `${event.name} | Eventues`,
      description: description,
      url: `https://eventues.com.br/e/${event.slug}`,
      type: 'website',
      images: [
        {
          url: `https://eventues.com.br/images/events/${event.event_id}.jpg`,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      locale: 'pt_BR',
      siteName: 'Eventues',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name} | Eventues`,
      description: description,
      images: [`https://eventues.com.br/images/events/${event.event_id}.jpg`],
    },
    alternates: {
      canonical: `https://eventues.com.br/e/${event.slug}`,
    },
    other: {
      'application-name': 'Eventues',
      'msapplication-TileColor': '#2b5797',
      'theme-color': '#ffffff',
      'script:ld+json': JSON.stringify(jsonLd),
    },
  };
}
