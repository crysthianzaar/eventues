import { MetadataRoute } from 'next';
import { getAllEvents, Event } from './apis/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com';
  
  try {
    // Obter todos os eventos ativos
    const events = await getAllEvents();
    
    // URLs estáticas principais do site
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/seja_organizador`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/meus_eventos`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/meus_ingressos`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/criar_evento`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/configurar_perfil`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      },
      {
        url: `${baseUrl}/contato`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy_policy`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms_of_service`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ] as MetadataRoute.Sitemap;
    
    // URLs dinâmicas dos eventos (alta prioridade para SEO)
    const eventUrls = events.map((event: Event) => ({
      url: `${baseUrl}/e/${event.slug}`,
      lastModified: new Date(event.updated_at || event.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.95, // Alta prioridade para eventos
    })) as MetadataRoute.Sitemap;
    
    // URLs das páginas de compra de ingressos
    const ticketUrls = events.map((event: Event) => ({
      url: `${baseUrl}/e/${event.slug}/tickets`,
      lastModified: new Date(event.updated_at || event.created_at || new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.85, // Alta prioridade para conversão
    })) as MetadataRoute.Sitemap;

    // URLs de categorias de eventos (para SEO por tipo)
    const eventTypes = Array.from(new Set(events.map(event => event.event_type)));
    const categoryUrls = eventTypes.map(type => ({
      url: `${baseUrl}/search?type=${encodeURIComponent(type)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })) as MetadataRoute.Sitemap;

    // URLs de eventos por cidade (para SEO local)
    const cities = Array.from(new Set(events.map(event => event.city)));
    const cityUrls = cities.map(city => ({
      url: `${baseUrl}/search?city=${encodeURIComponent(city)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })) as MetadataRoute.Sitemap;
    
    return [...staticUrls, ...eventUrls, ...ticketUrls, ...categoryUrls, ...cityUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Fallback para URLs estáticas apenas
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
    ];
  }
}
