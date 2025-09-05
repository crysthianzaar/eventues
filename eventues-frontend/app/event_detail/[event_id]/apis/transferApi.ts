import axios from 'axios';

export interface TransferRequest {
  id: string;
  amount: number;
  net_amount: number;
  fee?: number;
  type: 'NORMAL' | 'ADVANCE';
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  requested_at: string;
  estimated_date?: string;
  completed_at?: string;
  notes?: string;
}

export interface TransferSummary {
  total_requested: number;
  total_completed: number;
  total_pending: number;
  total_fees: number;
  requests_count: number;
  completed_count: number;
  pending_count: number;
}

export interface CreateTransferRequest {
  amount: number;
  is_advance: boolean;
}

/**
 * Busca todas as solicitações de repasse para um evento
 */
export const getTransferRequests = async (eventId: string, token: string): Promise<TransferRequest[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/transfers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Erro ao buscar solicitações de repasse:', error);
    throw error;
  }
};

/**
 * Cria uma nova solicitação de repasse
 */
export const createTransferRequest = async (
  eventId: string, 
  token: string, 
  requestData: CreateTransferRequest
): Promise<TransferRequest> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/transfers`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data as TransferRequest;
  } catch (error) {
    console.error('Erro ao criar solicitação de repasse:', error);
    throw error;
  }
};

/**
 * Atualiza o status de uma solicitação de repasse
 */
export const updateTransferStatus = async (
  eventId: string,
  transferId: string,
  token: string,
  status: string,
  notes?: string
): Promise<void> => {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/transfers/${transferId}/status`,
      { status, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao atualizar status do repasse:', error);
    throw error;
  }
};

/**
 * Busca resumo de repasses para o evento
 */
export const getTransferSummary = async (eventId: string, token: string): Promise<TransferSummary> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/transfers/summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data as TransferSummary;
  } catch (error) {
    console.error('Erro ao buscar resumo de repasses:', error);
    throw error;
  }
};
