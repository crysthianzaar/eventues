export interface Participant {
  termsAccepted: boolean;
  email: string;
  birthDate: string;
  phone: string;
  fullName: string;
  cpf: string;
}

export interface TicketItem {
  participants: Participant[];
  quantity: number;
  ticket_name: string;
  qr_code_uuid: string;
  ticket_id: string;
}

export interface TicketDetails {
  order_id: string;
  event_id: string;
  event_slug: string;
  event_type: string;
  event_name: string;
  event_date: string;
  event_location: string | null;
  user_id: string;
  ticket_name: string | null;
  ticket_value: number | null;
  quantity: number | null;
  total_value: number;
  payment_details: any | null;
  status: string;
  created_at: string;
  payment_url: string | null;
  tickets: TicketItem[];
}

export interface ApiResponse extends TicketDetails { }
