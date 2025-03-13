import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eventues | Plataforma de Eventos e Venda de Ingressos',
  description: 'Encontre os melhores eventos, festivais, shows, conferências e workshops. Compre ingressos com facilidade e segurança na plataforma Eventues.',
  keywords: 'eventos, ingressos, shows, festivais, conferências, workshops, comprar ingressos, eventos próximos',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://eventues.com.br',
    siteName: 'Eventues',
    title: 'Eventues | Plataforma de Eventos e Venda de Ingressos',
    description: 'Encontre os melhores eventos, festivais, shows, conferências e workshops. Compre ingressos com facilidade e segurança na plataforma Eventues.',
    images: [
      {
        url: 'https://eventues.com.br/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Eventues - Plataforma de Eventos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventues | Plataforma de Eventos e Venda de Ingressos',
    description: 'Encontre os melhores eventos, festivais, shows, conferências e workshops. Compre ingressos com facilidade e segurança.',
    images: ['https://eventues.com.br/images/twitter-image.jpg'],
    creator: '@eventues',
  },
  alternates: {
    canonical: 'https://eventues.com.br',
    languages: {
      'pt-BR': 'https://eventues.com.br',
    },
  },
  verification: {
    google: 'google-site-verification-code', // Substitua pelo código de verificação do Google Search Console
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
