'use client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  faqs: FAQItem[];
}

const FAQJsonLd: React.FC<FAQJsonLdProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

// Default FAQs for sports events
export const defaultEventFAQs: FAQItem[] = [
  {
    question: "Como faço para me inscrever no evento?",
    answer: "Clique no botão 'Comprar Ingressos' na página do evento, preencha seus dados e escolha a forma de pagamento. Você receberá a confirmação por email."
  },
  {
    question: "Posso cancelar minha inscrição?",
    answer: "O cancelamento depende das regras específicas de cada evento. Consulte os termos e condições do evento ou entre em contato com o organizador."
  },
  {
    question: "Como recebo meu ingresso?",
    answer: "Após a confirmação do pagamento, você receberá seu ingresso digital por email. Também pode acessá-lo na área 'Meus Ingressos'."
  },
  {
    question: "Posso transferir meu ingresso para outra pessoa?",
    answer: "Alguns eventos permitem transferência de ingressos. Verifique as regras específicas do evento ou entre em contato com o organizador."
  },
  {
    question: "O que devo levar no dia do evento?",
    answer: "Leve seu documento de identidade, ingresso (digital ou impresso) e siga as orientações específicas do evento quanto a equipamentos e vestimentas."
  }
];

export default FAQJsonLd;
