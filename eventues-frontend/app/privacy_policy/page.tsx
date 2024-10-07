// app/seja_organizador/privacy-policy/page.tsx

import React from 'react';
import PrivacyPolicy from './components/PrivacyPolicy';

export const metadata = {
  title: 'Política de Privacidade | Eventues',
  description:
    'Leia a Política de Privacidade da Eventues para entender como coletamos, usamos, compartilhamos e protegemos suas informações pessoais em conformidade com a LGPD.',
  openGraph: {
    type: 'website',
    url: 'https://www.eventues.com/seja_organizador/privacy-policy',
    title: 'Política de Privacidade | Eventues',
    description:
      'Leia a Política de Privacidade da Eventues para entender como coletamos, usamos, compartilhamos e protegemos suas informações pessoais em conformidade com a LGPD.',
    images: [
      {
        url: 'https://www.eventues.com/imagens/privacy_policy_og_image.jpg',
        width: 800,
        height: 600,
        alt: 'Eventues Privacy Policy OG Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://www.eventues.com/seja_organizador/privacy-policy',
    title: 'Política de Privacidade | Eventues',
    description:
      'Leia a Política de Privacidade da Eventues para entender como coletamos, usamos, compartilhamos e protegemos suas informações pessoais em conformidade com a LGPD.',
    images: ['https://www.eventues.com/imagens/privacy_policy_twitter_image.jpg'],
  },
};

const PrivacyPolicyPage: React.FC = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
