'use client';

import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items?: BreadcrumbItem[];
  eventName?: string;
}

const BreadcrumbJsonLd: React.FC<BreadcrumbJsonLdProps> = ({ items, eventName }) => {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com';

  // Generate breadcrumb items based on pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Eventues', url: baseUrl }
    ];

    const pathSegments = pathname.split('/').filter(Boolean);
    
    pathSegments.forEach((segment, index) => {
      const url = `${baseUrl}/${pathSegments.slice(0, index + 1).join('/')}`;
      
      switch (segment) {
        case 'e':
          // Skip the 'e' segment, will be handled by event name
          break;
        case 'search':
          breadcrumbs.push({ name: 'Buscar Eventos', url });
          break;
        case 'seja_organizador':
          breadcrumbs.push({ name: 'Seja Organizador', url });
          break;
        case 'meus_eventos':
          breadcrumbs.push({ name: 'Meus Eventos', url });
          break;
        case 'meus_ingressos':
          breadcrumbs.push({ name: 'Meus Ingressos', url });
          break;
        case 'criar_evento':
          breadcrumbs.push({ name: 'Criar Evento', url });
          break;
        case 'tickets':
          breadcrumbs.push({ name: 'Ingressos', url });
          break;
        case 'contato':
          breadcrumbs.push({ name: 'Contato', url });
          break;
        default:
          // For event slugs or other dynamic segments
          if (eventName && pathSegments[index - 1] === 'e') {
            breadcrumbs.push({ name: eventName, url });
          }
          break;
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default BreadcrumbJsonLd;
