import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/callback/',
          '/auth/',
          '/configurar_perfil/',
          '/meus_eventos/',
          '/meus_ingressos/',
          '/criar_evento/',
          '/*?*utm_*', // Block UTM parameters
          '/*?*fbclid*', // Block Facebook click IDs
          '/*?*gclid*', // Block Google click IDs
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/callback/',
          '/auth/',
          '/configurar_perfil/',
          '/meus_eventos/',
          '/meus_ingressos/',
          '/criar_evento/',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/callback/',
          '/auth/',
          '/configurar_perfil/',
          '/meus_eventos/',
          '/meus_ingressos/',
          '/criar_evento/',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
