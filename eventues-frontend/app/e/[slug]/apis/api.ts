import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export interface PublicEventDetail {
  event_id: string;
  slug: string;
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  city: string;
  state: string;
  address: string;
  event_description: string;
  banner_image_url: string;
  organization_name: string;
  tickets: Array<{
    id: string;
    nome: string;
    tipo: 'Simples' | 'Lotes' | 'Gratuito';
    valor: number;
    totalIngressos: string;
    ingressosDisponiveis: string;
    inicioVendas: string;
    fimVendas: string;
    taxaServico: 'absorver' | 'repassar';
    lotes?: Array<{
      valor: number;
      quantidade: number;
      viradaProximoLote: {
        data: string;
        quantidade: number;
      };
    }>;
  }>;
}

export interface TicketReservation {
  reservation_id: string;
  expires_in: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'expired';
  created_at: string;
  expires_at: string;
}

// Buscar detalhes públicos do evento
export const getPublicEventDetail = async (slug: string): Promise<PublicEventDetail> => {
  const response = await axios.get<PublicEventDetail>(
    `${API_BASE_URL}/events/${slug}`
  );
  return response.data;
};

// Reservar ingressos
export const reserveTickets = async (
  eventId: string,
  ticketId: string,
  quantity: number,
  customerData?: {
    name?: string;
    email?: string;
    phone?: string;
  }
): Promise<TicketReservation> => {
  const response = await axios.post<TicketReservation>(
    `${API_BASE_URL}/events/${eventId}/tickets/${ticketId}/reserve`,
    {
      quantity,
      ...customerData
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};
