'use client';

import { Event } from '../apis/api';
import Script from 'next/script';

interface EventsJsonLdProps {
  events: Event[];
}

export default function EventsJsonLd({ events }: EventsJsonLdProps) {
  // Criar o JSON-LD para a lista de eventos
  const eventsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.name,
        description: event.event_description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: {
          '@type': 'Place',
          name: event.address_detail || `${event.city}, ${event.state}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.city,
            addressRegion: event.state,
            addressCountry: 'BR'
          }
        },
        organizer: {
          '@type': 'Organization',
          name: event.organization_name
        },
        image: `https://eventues.com.br/images/events/${event.event_id}.jpg`,
        url: `https://eventues.com.br/e/${event.slug}`
      }
    }))
  };

  // Criar o JSON-LD para a organização
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eventues',
    url: 'https://eventues.com.br',
    logo: 'https://eventues.com.br/images/logo.png',
    sameAs: [
      'https://facebook.com/eventues',
      'https://instagram.com/eventues',
      'https://twitter.com/eventues'
    ]
  };

  // Criar o JSON-LD para o website
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eventues',
    url: 'https://eventues.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://eventues.com.br/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <Script id="events-jsonld" type="application/ld+json">
        {JSON.stringify(eventsJsonLd)}
      </Script>
      <Script id="organization-jsonld" type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </Script>
      <Script id="website-jsonld" type="application/ld+json">
        {JSON.stringify(websiteJsonLd)}
      </Script>
    </>
  );
}
