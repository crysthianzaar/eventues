import { Suspense } from 'react';
import { getAllEvents } from '../apis/api';
import Link from 'next/link';
import { Metadata } from 'next';
import type { Event } from '../types/event';
import { adaptEvents } from '../utils/eventAdapter';

export const metadata: Metadata = {
  title: 'Eventos Esportivos | Eventues',
  description: 'Encontre os melhores eventos esportivos perto de você! Calendário completo com corridas, maratonas, ciclismo e muito mais.',
  keywords: 'eventos esportivos, corridas de rua, maratonas, ciclismo, competições esportivas',
  openGraph: {
    title: 'Eventos Esportivos | Eventues',
    description: 'Encontre os melhores eventos esportivos perto de você!',
    url: 'https://eventues.com.br/e',
  },
};

// Componente de carregamento
function EventsLoading() {
  return <div className="text-center py-10">Carregando eventos...</div>;
}

// Componente de listagem de eventos
async function EventsList({ category }: { category?: string }) {
  // Buscar todos os eventos
  const apiEvents = await getAllEvents();
  
  // Adaptar eventos para o formato UI
  const events = adaptEvents(apiEvents);
  
  // Filtrar eventos por categoria se necessário
  const filteredEvents = category 
    ? events.filter(event => 
        event.category?.toLowerCase() === category.toLowerCase()
      )
    : events;

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Nenhum evento encontrado</h2>
        <p>No momento não temos eventos disponíveis nesta categoria.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Ver todos os eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <Link href={`/e/${event.slug}`} key={event.event_id} className="block">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {event.banner_url && (
                <img 
                  src={event.banner_url} 
                  alt={event.name} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(event.start_date).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-gray-700 line-clamp-2">
                  {event.event_description?.substring(0, 120)}...
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Página principal de eventos
export default function EventsPage({ 
  searchParams 
}: { 
  searchParams: { category?: string } 
}) {
  const category = searchParams.category || '';
  const pageTitle = category 
    ? `Eventos de ${category.charAt(0).toUpperCase() + category.slice(1)}`
    : 'Todos os Eventos Esportivos';

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mt-8 mb-2">{pageTitle}</h1>
      <p className="text-gray-600 mb-6">
        Encontre os melhores eventos esportivos e garanta sua participação!
      </p>
      
      <Suspense fallback={<EventsLoading />}>
        <EventsList category={category} />
      </Suspense>
    </div>
  );
}
