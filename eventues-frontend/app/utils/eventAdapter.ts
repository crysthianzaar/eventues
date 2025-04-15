import { Event } from '../types/event';

/**
 * Adapta os eventos da API para o formato usado na UI
 * Adiciona campos como banner_url, location, e aliases para compatibilidade
 */
export function adaptEvents(events: Event[]): Event[] {
  return events.map(event => adaptEvent(event));
}

/**
 * Adapta um único evento da API para o formato usado na UI
 */
export function adaptEvent(event: Event): Event {
  // Cria uma cópia do evento para não modificar o original
  const adaptedEvent: Event = { ...event };
  
  // Adiciona o campo banner_url com base na convenção de nomes
  adaptedEvent.banner_url = `https://eventues.com.br/events/${event.event_id}/banner.jpg`;
  
  // Cria o campo location combinando cidade e estado
  adaptedEvent.location = `${event.city}, ${event.state}`;
  
  // Adiciona aliases para compatibilidade com componentes existentes
  adaptedEvent.id = event.event_id;
  adaptedEvent.description = event.event_description;
  adaptedEvent.date = event.start_date;
  
  return adaptedEvent;
}
