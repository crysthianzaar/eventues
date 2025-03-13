import { MetadataRoute } from 'next';
import { getAllEvents, Event } from './apis/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Obter todos os eventos
  const events = await getAllEvents();
  
  // URLs estáticas do site
  const staticUrls = [
    {
      url: 'https://eventues.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://eventues.com.br/meus_eventos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://eventues.com.br/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ] as MetadataRoute.Sitemap;
  
  // URLs dinâmicas dos eventos
  const eventUrls = events.map((event: Event) => ({
    url: `https://eventues.com.br/e/${event.slug}`,
    lastModified: new Date(event.updated_at || event.created_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.9,
  })) as MetadataRoute.Sitemap;
  
  // URLs das páginas de compra de ingressos
  const ticketUrls = events.map((event: Event) => ({
    url: `https://eventues.com.br/e/${event.slug}/tickets`,
    lastModified: new Date(event.updated_at || event.created_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) as MetadataRoute.Sitemap;
  
  return [...staticUrls, ...eventUrls, ...ticketUrls];
}
