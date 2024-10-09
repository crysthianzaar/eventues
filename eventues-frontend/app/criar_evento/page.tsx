import React from 'react';
import CreateEvent from './components/CreateEvent';

export const metadata = {
  title: 'Crie Seu Evento | Eventues',
  description:
    'Crie seu evento de forma rápida e fácil com a Eventues. Organize, gerencie e promova seus eventos em uma única plataforma.',
  openGraph: {
    type: 'website',
    url: 'https://www.eventues.com/criar_evento',
    title: 'Crie Seu Evento | Eventues',
    description:
      'Crie seu evento de forma rápida e fácil com a Eventues. Organize, gerencie e promova seus eventos em uma única plataforma.',
    images: [
      {
        url: 'https://www.eventues.com/imagens/eventues_create_event_og_image.jpg',
        width: 800,
        height: 600,
        alt: 'Crie Seu Evento na Eventues',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://www.eventues.com/criar_evento',
    title: 'Crie Seu Evento | Eventues',
    description:
      'Crie seu evento de forma rápida e fácil com a Eventues. Organize, gerencie e promova seus eventos em uma única plataforma.',
    images: ['https://www.eventues.com/imagens/eventues_create_event_twitter_image.jpg'],
  },
};

const CreateEventPage = () => {
  return <CreateEvent />;
};

export default CreateEventPage;
