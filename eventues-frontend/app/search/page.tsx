import { Suspense } from 'react';
import { getAllEvents } from '../apis/api';
import Link from 'next/link';
import type { Event } from '../types/event';
import { adaptEvents } from '../utils/eventAdapter';

// Componente de carregamento
function SearchLoading() {
  return <div className="text-center py-10">Buscando eventos...</div>;
}

// Componente de resultados da busca
async function SearchResults({ query }: { query: string }) {
  // Buscar todos os eventos
  const apiEvents = await getAllEvents();
  
  // Adaptar eventos para o formato UI
  const events = adaptEvents(apiEvents);
  
  // Filtrar eventos com base na consulta
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(query.toLowerCase()) ||
    (event.event_description && event.event_description.toLowerCase().includes(query.toLowerCase())) ||
    (event.location && event.location.toLowerCase().includes(query.toLowerCase()))
  );

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Nenhum evento encontrado para "{query}"</h2>
        <p>Tente buscar com outros termos ou explore nossos eventos em destaque.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Ver todos os eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Resultados para "{query}"</h2>
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

// Página principal de busca
export default function SearchPage({ 
  searchParams 
}: { 
  searchParams: { q?: string } 
}) {
  const query = searchParams.q || '';

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mt-8 mb-2">Busca de Eventos</h1>
      
      {query ? (
        <Suspense fallback={<SearchLoading />}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-4">Busque por eventos esportivos</h2>
          <p>Digite um termo de busca na barra de pesquisa acima para encontrar eventos.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Ver todos os eventos
          </Link>
        </div>
      )}
    </div>
  );
}
