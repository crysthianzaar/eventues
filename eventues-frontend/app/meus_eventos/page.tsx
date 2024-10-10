// app/meus_eventos/page.tsx

import React from 'react';
import { Metadata } from 'next';
import ClientMeusEventosPage from './components/ClientMeusEventosPage';

export const metadata: Metadata = {
  title: 'Meus Eventos | Eventues',
  description: 'Gerencie e visualize todos os seus eventos criados no Eventues. Acompanhe o status, datas e detalhes de cada evento de forma fácil e rápida.',
  keywords: ['eventos', 'meus eventos', 'gerenciar eventos', 'Eventues', 'criar eventos'],
  openGraph: {
    title: 'Meus Eventos | Eventues',
    description: 'Gerencie e visualize todos os seus eventos criados no Eventues. Acompanhe o status, datas e detalhes de cada evento de forma fácil e rápida.',
    url: 'https://www.eventues.com/meus_eventos',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Eventues',
    images: [
      {
        url: 'https://www.eventues.com/images/meus_eventos-og.png',
        width: 1200,
        height: 630,
        alt: 'Meus Eventos - Eventues',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meus Eventos | Eventues',
    description: 'Gerencie e visualize todos os seus eventos criados no Eventues. Acompanhe o status, datas e detalhes de cada evento de forma fácil e rápida.',
    images: ['https://www.eventues.com/images/meus_eventos-twitter.png'],
    creator: '@seu_usuario_twitter',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

const MeusEventosPage = () => {
  return <ClientMeusEventosPage />;
};

export default MeusEventosPage;
