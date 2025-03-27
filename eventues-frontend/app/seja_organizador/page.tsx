// app/seja_organizador/page.tsx

import React from 'react';
import WhyChooseEventues from './components/WhyChooseEventues';
import { Metadata } from 'next';

// Metadata export for SEO
export const metadata: Metadata = {
  title: 'Eventues | Plataforma de Gestão de Eventos - Taxas a partir de 7,99%',
  description:
    'Plataforma completa para organização de eventos. Taxas a partir de 7,99%, suporte personalizado via WhatsApp, pagamentos antecipados e ferramentas de marketing. Comece grátis!',
  metadataBase: new URL('https://www.eventues.com'),
  alternates: {
    canonical: '/seja_organizador',
  },
  keywords: 'gestão de eventos, venda de ingressos, organização de eventos, plataforma de eventos, eventos online, eventos presenciais',
  openGraph: {
    type: 'website',
    url: 'https://www.eventues.com/seja_organizador',
    title: 'Eventues | Plataforma de Gestão de Eventos - Taxas a partir de 7,99%',
    description:
      'Plataforma completa para organização de eventos. Taxas a partir de 7,99%, suporte personalizado via WhatsApp, pagamentos antecipados e ferramentas de marketing. Comece grátis!',
    images: [
      {
        url: 'https://www.eventues.com/imagens/eventues_organizador_og_image.jpg',
        width: 1200,
        height: 630,
        alt: 'Eventues - Plataforma de Gestão de Eventos',
      },
    ],
    siteName: 'Eventues',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@eventues',
    title: 'Eventues | Plataforma de Gestão de Eventos - Taxas a partir de 7,99%',
    description:
      'Plataforma completa para organização de eventos. Taxas a partir de 7,99%, suporte personalizado via WhatsApp, pagamentos antecipados e ferramentas de marketing. Comece grátis!',
    images: ['https://www.eventues.com/imagens/eventues_organizador_og_image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const SejaOrganizadorPage = () => {
  return <WhyChooseEventues />;
};

export default SejaOrganizadorPage;
