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
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${slug}`
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
    };
  }

  const formattedDate = formatDate(eventDetail.start_date);

  return {
    title: `${eventDetail.name} em ${eventDetail.city} - ${formattedDate} | Eventues`,
    description: eventDetail.event_description,
    openGraph: {
      type: "website",
      url: `https://www.eventues.com/e/${slug}`,
      title: `${eventDetail.name} em ${eventDetail.city} - ${formattedDate} | Eventues`,
      description: eventDetail.event_description,
      images: [
        {
          url: eventDetail.banner_image_url || "/images/default_banner.jpg",
          width: 800,
          height: 600,
          alt: `Banner do evento ${eventDetail.name}`,
        },
      ],
    },
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
