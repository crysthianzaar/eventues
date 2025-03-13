const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

export interface Ingresso {
  descricao: string;
  id: string;
  nome: string;
  tipo: 'Simples' | 'Lotes' | 'Gratuito';
  valor: number;
  totalIngressos: number;
  inicioVendas: string | null;
  fimVendas: string | null;
  lotes: Lote[] | null;
  taxaServico: 'absorver' | 'repassar';
  visibilidade: 'publico' | 'privado';
}

export interface Lote {
  valor: number;
  quantidade: number;
  viradaProximoLote: {
    data: string | null;
    quantidade: number | null;
  };
}

export interface Event {
  event_id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  event_type: string;
  event_status: string;
  event_description: string;
  category: string;
  event_category: string;
  city: string;
  state: string;
  address: string;
  address_complement: string | null;
  address_detail: string;
  organization_name: string;
  organization_contact: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  label: string;
  required: boolean;
  type: string;
  options?: string[];
  order: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  city?: string;
  state?: string;
  address?: string;
  [key: string]: string | undefined;  // Permite indexação dinâmica
}

export const getEventBySlug = async (slug: string): Promise<Event> => {
  const response = await fetch(`${API_BASE_URL}/events/slug/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

export const createPaymentSession = async (data: {
  name: string;
  email: string;
  cpf: string;
  event_id: string;
  ticket_id: string;
  quantity: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/create_payment_session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment session');
  }

  return response.json();
};

export const getOrder = async (orderId: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
};

export const getEventTickets = async (eventId: string): Promise<Ingresso[]> => {
  if (!eventId) {
    throw new Error('Event ID is required to fetch tickets');
  }
  const response = await fetch(`${API_BASE_URL}/organizer_detail/${eventId}/get_tickets`);
  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }
  return response.json();
};

export const getEventForm = async (eventId: string): Promise<FormField[]> => {
  const response = await fetch(`${API_BASE_URL}/organizer_detail/${eventId}/get_form`);
  if (!response.ok) {
    throw new Error('Failed to fetch event form');
  }
  return response.json();
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};

// Função para obter todos os eventos
export async function getAllEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error('Falha ao buscar eventos');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar todos os eventos:', error);
    return [];
  }
}
