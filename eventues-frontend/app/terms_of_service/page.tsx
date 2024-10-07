// app/seja_organizador/terms_of_service/page.tsx

import React from 'react';
import TermsOfService from './components/TermsOfService';

export const metadata = {
  title: 'Termos de Serviço | Eventues',
  description:
    'Leia os Termos de Serviço da Eventues para entender os direitos e responsabilidades ao utilizar nossa plataforma para organizar e participar de eventos.',
  openGraph: {
    type: 'website',
    url: 'https://www.eventues.com/seja_organizador/terms_of_service',
    title: 'Termos de Serviço | Eventues',
    description:
      'Leia os Termos de Serviço da Eventues para entender os direitos e responsabilidades ao utilizar nossa plataforma para organizar e participar de eventos.',
    images: [
      {
        url: 'https://www.eventues.com/imagens/terms_of_service_og_image.jpg',
        width: 800,
        height: 600,
        alt: 'Eventues Terms of Service OG Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://www.eventues.com/seja_organizador/terms_of_service',
    title: 'Termos de Serviço | Eventues',
    description:
      'Leia os Termos de Serviço da Eventues para entender os direitos e responsabilidades ao utilizar nossa plataforma para organizar e participar de eventos.',
    images: ['https://www.eventues.com/imagens/terms_of_service_twitter_image.jpg'],
  },
};

const TermsOfServicePage: React.FC = () => {
  return <TermsOfService />;
};

export default TermsOfServicePage;
