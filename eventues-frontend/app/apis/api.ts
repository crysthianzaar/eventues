const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

export interface Ingresso {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  taxa: number;
  totalIngressos: number;
  fimVendas: string;
  status: string;
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

export interface OrderTicket {
  quantity: number;
  ticket_id: string;
  ticket_name?: string;
  ticket_color?: string;
}

export interface Order {
  event_id: string;
  tickets: OrderTicket[];
  created_at: string;
  user_id: string;
  updated_at: string;
  total_amount: number;
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
  cpf?: string;
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
  const response = await fetch(`${API_BASE_URL}/get-order/${orderId}`);
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

export const getEventForm = async (eventId: string, signal?: AbortSignal): Promise<FormField[]> => {
  console.log('Calling getEventForm API with eventId:', eventId);
  try {
    // Log the full URL for debugging
    const url = `${API_BASE_URL}/organizer_detail/${eventId}/get_form`;
    console.log('Full API URL:', url);
    
    const response = await fetch(url, { 
      signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Log response status
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      console.error('API error response:', response.status, response.statusText);
      throw new Error(`Failed to fetch event form: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    // Validate response format
    if (!data || !Array.isArray(data)) {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid form data format received from API');
    }
    
    return data;
  } catch (error: unknown) {
    // Don't log aborted requests as errors
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was aborted');
    } else {
      console.error('Error in getEventForm:', error);
    }
    throw error;
  }
};

export const updateEventForm = async (eventId: string, formFields: FormField[]): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/organizer_detail/${eventId}/update_form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ form_fields: formFields }),
  });
  if (!response.ok) {
    throw new Error('Failed to update event form');
  }
  return response.json();
};

export const createEventForm = async (eventId: string, formFields?: FormField[]): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/organizer_detail/${eventId}/create_form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ form_fields: formFields }),
  });
  if (!response.ok) {
    throw new Error('Failed to create event form');
  }
  return response.json();
};

export const deleteEventForm = async (eventId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/organizer_detail/${eventId}/delete_form`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete event form');
  }
  return response.json().then(data => data.success);
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
      console.error(`Falha ao buscar eventos: ${response.status} ${response.statusText}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar todos os eventos:', error);
    return [];
  }
}
