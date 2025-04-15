// Definição da interface Event para uso em todo o projeto
export interface Event {
  // Campos da API original
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
  
  // Campos adicionais para componentes de UI
  banner_url?: string;
  location?: string;
  
  // Campos de compatibilidade (aliases)
  description?: string; // Alias para event_description
  date?: string; // Alias para start_date
  id?: string; // Alias para event_id
}

export interface EventResponse {
  events: Event[];
  next_cursor: string | null;
}
