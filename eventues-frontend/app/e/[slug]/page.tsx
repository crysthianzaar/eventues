import React from 'react';
import { Metadata } from 'next';
import axios from 'axios';
import { notFound } from 'next/navigation';
import EventDetails from './components/EventDetails';
import PageViewTracker from './components/PageViewTracker';
import { formatDate } from '@/utils/formatters';
import { Box } from '@mui/material';

interface PublicEventDetail {
  event_id: string;
  slug: string;
  name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  city: string;
  state: string;
  address: string;
  event_description: string;
  banner_image_url: string;
  organization_name: string;
  tickets: Array<{
    id: string;
    nome: string;
    tipo: 'Simples' | 'Lotes' | 'Gratuito';
    valor: number;
    totalIngressos: string;
    ingressosDisponiveis: string;
    inicioVendas: string;
    fimVendas: string;
    taxaServico: 'absorver' | 'repassar';
    lotes?: Array<{
      valor: number;
      quantidade: number;
      viradaProximoLote: {
        data: string;
        quantidade: number;
      };
    }>;
  }>;
}

const fetchPublicEventDetail = async (slug: string): Promise<PublicEventDetail | null> => {
  try {
    const response = await axios.get<PublicEventDetail>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/slug/${slug}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching event details:", error);
    return null;
  }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const eventDetail = await fetchPublicEventDetail(slug);
  const absoluteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com';
  
  if (!eventDetail) {
    const notFoundImage = `${absoluteBaseUrl}/images/default_banner.jpg`;
    return {
      title: "Evento não encontrado | Eventues",
      description: "O evento que você está procurando não foi encontrado.",
      openGraph: {
        type: "website",
        url: `${absoluteBaseUrl}/e/${slug}`,
        title: "Evento não encontrado | Eventues",
        description: "O evento que você está procurando não foi encontrado.",
        images: [{ 
          url: notFoundImage, 
          width: 1200, 
          height: 630,
          alt: "Evento não encontrado"
        }],
        siteName: "Eventues - Plataforma de eventos esportivos",
        locale: 'pt_BR',
      },
      twitter: {
        card: 'summary_large_image',
        title: "Evento não encontrado | Eventues",
        description: "O evento que você está procurando não foi encontrado.",
        images: [notFoundImage],
        site: '@eventues',
      },
      // Facebook App ID é adicionado via meta tag personalizada
    };
  }

  // Prepara dados para metadata
  const formattedDate = formatDate(eventDetail.start_date);
  const formattedPrice = eventDetail.tickets && eventDetail.tickets.length > 0 ? 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(Math.min(...eventDetail.tickets.map(t => t.valor))) : 'Grátis';
  
  // Títulos e descrições otimizados para compartilhamento
  const title = `${eventDetail.name} em ${eventDetail.city} - ${formattedDate}`;
  const seoTitle = `${title} | Eventues`;
  
  // Descrição principal com palavras-chave relevantes
  const shortDescription = eventDetail.event_description.length > 160 ? 
    `${eventDetail.event_description.slice(0, 157)}...` : 
    eventDetail.event_description;
  
  // Descrição com emojis para destaque visual em compartilhamentos
  const socialDescription = [
    `🏆 ${eventDetail.event_type}: ${shortDescription}`,
    '',
    `📅 ${formattedDate}`,
    `⏰ ${eventDetail.start_time} às ${eventDetail.end_time}`,
    `📍 ${eventDetail.city} - ${eventDetail.state}`,
    `💰 A partir de ${formattedPrice}`,
    '',
    '🔥 Garanta sua vaga agora!'  
  ].join('\n');

  // URLs e imagens com URLs absolutas
  const absoluteUrl = `${absoluteBaseUrl}/e/${slug}`;
  const absoluteBannerUrl = eventDetail.banner_image_url && eventDetail.banner_image_url.startsWith('http') ? 
    eventDetail.banner_image_url : 
    `${absoluteBaseUrl}${eventDetail.banner_image_url || '/images/default_banner.jpg'}`;

  // Tags específicas para o tipo de evento
  const eventTags = eventDetail.event_type.toLowerCase().includes('corrida') ? 
    ['corrida', 'maratona', 'atletismo', 'esporte'] :
    eventDetail.event_type.toLowerCase().includes('futebol') ?
    ['futebol', 'campeonato', 'torneio', 'esporte'] :
    ['evento esportivo', 'competição', 'torneio'];

  // Keywords relevantes com variações e termos específicos
  const keywords = [
    eventDetail.name.toLowerCase(),
    eventDetail.event_type.toLowerCase(),
    'evento esportivo',
    `eventos em ${eventDetail.city.toLowerCase()}`,
    `${eventDetail.event_type.toLowerCase()} em ${eventDetail.city.toLowerCase()}`,
    eventDetail.city.toLowerCase(),
    eventDetail.state.toLowerCase(),
    'inscrição',
    'ingresso online',
    'comprar ingresso',
    eventDetail.organization_name.toLowerCase(),
    ...eventTags,
    formattedDate.toLowerCase(),
  ].join(', ');

  return {
    title: seoTitle,
    description: socialDescription,
    
    // OpenGraph - Facebook, LinkedIn, WhatsApp
    openGraph: {
      type: "website",
      url: absoluteUrl,
      title: title,
      description: socialDescription,
      siteName: "Eventues - Plataforma de Eventos Esportivos",
      locale: 'pt_BR',
      images: [
        {
          url: absoluteBannerUrl,
          width: 1200,
          height: 630,
          alt: `${eventDetail.name} - ${formattedDate}`,
          type: 'image/jpeg',
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@eventues',
      creator: '@eventues',
      title: title,
      description: socialDescription,
      images: [absoluteBannerUrl],
    },
    
    // Outras meta tags
    alternates: {
      canonical: absoluteUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    keywords: keywords,
  };
}

// Função para registrar visualização de página
const recordPageView = async (eventId: string) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/pageview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Visualização registrada com sucesso');
  } catch (error) {
    // Silencioso em caso de falha - não queremos interromper o carregamento da página
    console.error('Erro ao registrar visualização:', error);
  }
};

// Componente para adicionar dados estruturados JSON-LD para eventos
const EventJsonLd = ({ event }: { event: PublicEventDetail }) => {
  const formattedPrice = event.tickets && event.tickets.length > 0 ? 
    Math.min(...event.tickets.map(t => t.valor)) : 0;
  
  // Formatar datas no formato ISO 8601
  const formatISODate = (date: string, time?: string) => {
    if (!date) return '';
    const [day, month, year] = date.split('/');
    if (!day || !month || !year) return date; // Se não estiver no formato esperado
    
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return time ? `${isoDate}T${time}:00` : isoDate;
  };

  // Dados estruturados do evento para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.event_description,
    "startDate": formatISODate(event.start_date, event.start_time),
    "endDate": formatISODate(event.end_date, event.end_time),
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.address,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.address,
        "addressLocality": event.city,
        "addressRegion": event.state,
        "addressCountry": "BR"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organization_name,
    },
    "offers": event.tickets && event.tickets.length > 0 ? {
      "@type": "Offer",
      "price": formattedPrice,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "validFrom": formatISODate(event.tickets[0].inicioVendas)
    } : undefined,
    "image": event.banner_image_url || "/images/default_banner.jpg"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default async function EventPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const eventDetail = await fetchPublicEventDetail(slug);

  if (!eventDetail) {
    notFound();
  }
  
  // Esta parte será executada no cliente
  // Usamos "use client" diretiva para componentes cliente

  return (
    <Box 
      component="main" 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'grey.100',
        pt: { xs: 4, md: 12 },
        pb: { xs: 4, md: 8 }
      }}
    >
      {/* Adiciona dados estruturados JSON-LD para SEO */}
      <EventJsonLd event={eventDetail} />
      
      {/* Componente invisível que rastreia visualizações de página */}
      <PageViewTracker eventId={eventDetail.event_id} />
      <EventDetails event={eventDetail} />
    </Box>
  );
}
