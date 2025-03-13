import React from 'react';
import { Metadata } from 'next';
import axios from 'axios';
import { notFound } from 'next/navigation';
import EventDetails from './components/EventDetails';
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

  if (!eventDetail) {
    return {
      title: "Evento não encontrado | Eventues",
      description: "O evento que você está procurando não foi encontrado.",
      openGraph: {
        type: "website",
        url: `https://www.eventues.com/e/${slug}`,
        title: "Evento não encontrado | Eventues",
        description: "O evento que você está procurando não foi encontrado.",
        images: [{ url: "/images/default_banner.jpg", width: 800, height: 600 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: "Evento não encontrado | Eventues",
        description: "O evento que você está procurando não foi encontrado.",
        images: ["/images/default_banner.jpg"],
      }
    };
  }

  const formattedDate = formatDate(eventDetail.start_date);
  const title = `${eventDetail.name} em ${eventDetail.city} - ${formattedDate} | Eventues`;
  const description = `${eventDetail.event_type}: ${eventDetail.event_description.slice(0, 160)}...`;
  const bannerUrl = eventDetail.banner_image_url || "/images/default_banner.jpg";

  // Formatação detalhada do evento em português
  const fullDescription = [
    description,
    '',
    `📅 Data: ${formattedDate}`,
    `⏰ Horário: ${eventDetail.start_time} às ${eventDetail.end_time}`,
    `📍 Local: ${eventDetail.address}, ${eventDetail.city} - ${eventDetail.state}`,
    `👥 Organização: ${eventDetail.organization_name}`,
    '',
    'Garanta sua vaga agora!'
  ].join('\n');

  return {
    title,
    description: fullDescription,
    openGraph: {
      type: "website",
      url: `https://www.eventues.com/e/${slug}`,
      title,
      description: fullDescription,
      siteName: "Eventues",
      images: [
        {
          url: bannerUrl,
          width: 1200,
          height: 630,
          alt: `Banner do evento ${eventDetail.name}`,
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: fullDescription,
      images: [bannerUrl],
      creator: '@eventues',
    },
    alternates: {
      canonical: `https://www.eventues.com/e/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    keywords: [
      eventDetail.event_type,
      'evento',
      eventDetail.city,
      eventDetail.state,
      'inscrição',
      'ingresso',
      'eventos esportivos',
      eventDetail.organization_name,
      'corrida',
      'competição',
    ].join(', '),
  };
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const eventDetail = await fetchPublicEventDetail(slug);

  if (!eventDetail) {
    notFound();
  }

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
      <EventDetails event={eventDetail} />
    </Box>
  );
}
