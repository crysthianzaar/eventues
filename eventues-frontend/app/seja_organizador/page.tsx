// app/seja_organizador/page.tsx

import React from 'react';
import WhyChooseEventues from './components/WhyChooseEventues';

// Metadata export for SEO
export const metadata = {
  title: 'Por que Escolher a Eventues? | Eventues',
  description:
    'Descubra as vantagens de usar a Eventues para organizar e participar de eventos. Economize nas taxas, maximize seus lucros e ofereça a melhor experiência aos participantes.',
  openGraph: {
    type: 'website',
    url: 'https://www.eventues.com/seja_organizador',
    title: 'Por que Escolher a Eventues? | Eventues',
    description:
      'Descubra as vantagens de usar a Eventues para organizar e participar de eventos. Economize nas taxas, maximize seus lucros e ofereça a melhor experiência aos participantes.',
    images: [
      {
        url: 'https://www.eventues.com/imagens/eventues_organizador_og_image.jpg',
        width: 800,
        height: 600,
        alt: 'Eventues Organizer OG Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://www.eventues.com/seja_organizador',
    title: 'Por que Escolher a Eventues? | Eventues',
    description:
      'Descubra as vantagens de usar a Eventues para organizar e participar de eventos. Economize nas taxas, maximize seus lucros e ofereça a melhor experiência aos participantes.',
    images: ['https://www.eventues.com/imagens/eventues_organizador_twitter_image.jpg'],
  },
};

const SejaOrganizadorPage = () => {
  return <WhyChooseEventues />;
};

export default SejaOrganizadorPage;
