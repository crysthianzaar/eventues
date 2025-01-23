import axios from "axios";

// Defina a interface UploadResponse e exporte-a
export interface UploadResponse {
  url: string;
  firebase_path: string;
}

// Defina a interface Lote
export interface Lote {
  valor: number;
  quantidade: number;
  viradaProximoLote: {
    data: string;
    quantidade: number;
  };
}

// Interface para o Ingresso
export interface Ingresso {
  id: string;
  nome: string;
  tipo: 'Simples' | 'Lotes' | 'Gratuito';
  valor: number;
  lotes?: Lote[];
  taxaServico: 'absorver' | 'repassar';
  visibilidade: 'publico' | 'privado';
  totalIngressos: string;
  fimVendas: string;
  inicioVendas: string;
}

// Interface para detalhes do evento
export interface EventDetail {
  name: string;
  event_id: string;
  event_category: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  state: string;
  city: string;
  address: string;
  address_complement: string;
  address_detail: string;
  organization_name: string;
  organization_contact: string;
  event_status: string;
  event_type: string;
  event_description?: string;
  banner_image?: string; // URL do banner
}

// Interface para documentos do evento
export interface DocumentData {
  file_name: string;
  firebase_path: string;
  url: string;
  content_type?: string;
  size?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Função para upload de documento
export const uploadDocumentFile = async (
  eventId: string,
  file: string, // Base64 string
  title: string
): Promise<UploadResponse> => {
  const payload = {
    file,
    title,
  };
  const response = await axios.post<UploadResponse>(
    `${API_BASE_URL}/organizer_detail/${eventId}/upload_document_file`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Função para deletar documento
export const deleteDocumentFile = async (
  eventId: string,
  firebasePath: string
): Promise<void> => {
  const payload = { firebase_path: firebasePath };
  await axios.post(
    `${API_BASE_URL}/organizer_detail/${eventId}/delete_document_file`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Função para obter detalhes do evento
export const getEventDetails = async (
  eventId: string
): Promise<EventDetail> => {
  const response = await axios.get<EventDetail>(
    `${API_BASE_URL}/organizer_detail/${eventId}`
  );
  return response.data;
};

// Função para obter documentos do evento
export const getEventDocuments = async (
  eventId: string
): Promise<DocumentData[]> => {
  const response = await axios.get<DocumentData[]>(
    `${API_BASE_URL}/organizer_detail/${eventId}/get_document_files`
  );
  return response.data;
};

// Função para atualizar detalhes do evento
export const updateEventDetails = async (
  eventId: string,
  data: Partial<EventDetail>
): Promise<void> => {
  // Remover banner_image do objeto de dados, se existir
  const { banner_image, ...dataWithoutBanner } = data;

  await axios.patch(
    `${API_BASE_URL}/organizer_detail/${eventId}/details`,
    dataWithoutBanner,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Função para criar ingresso
export const createTicket = async (
  eventId: string,
  data: any
): Promise<Ingresso> => {
  const response = await axios.post<Ingresso>(
    `${API_BASE_URL}/organizer_detail/${eventId}/create_ticket`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Função para obter ingressos
export const getTickets = async (
  eventId: string
): Promise<Ingresso[]> => {
  const response = await axios.get<Ingresso[]>(
    `${API_BASE_URL}/organizer_detail/${eventId}/get_tickets`
  );
  return response.data;
};

// Função para atualizar um ingresso
export const updateTicket = async (eventId: string, ingressoId: string, ingresso: Partial<Ingresso>): Promise<Ingresso> => {
  const response = await axios.put<Ingresso>(`${API_BASE_URL}/organizer_detail/${eventId}/tickets/${ingressoId}`, ingresso);
  return response.data;
};

// Função para excluir um ingresso
export const deleteTicket = async (eventId: string, ingressoId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/organizer_detail/${eventId}/tickets/${ingressoId}`);
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL, // Substitua pela URL do seu backend
});

export default api;
