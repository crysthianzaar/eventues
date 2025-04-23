'use client';

import { useEffect } from 'react';

interface PageViewTrackerProps {
  eventId: string;
}

const PageViewTracker: React.FC<PageViewTrackerProps> = ({ eventId }) => {
  useEffect(() => {
    const recordPageView = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/pageview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Visualização registrada com sucesso');
      } catch (error) {
        // Silencioso em caso de falha - não queremos interromper o carregamento da página
        console.error('Erro ao registrar visualização:', error);
      }
    };

    // Registrar visualização apenas uma vez quando o componente montar
    recordPageView();
  }, [eventId]);

  // Este componente não renderiza nada visualmente
  return null;
};

export default PageViewTracker;
