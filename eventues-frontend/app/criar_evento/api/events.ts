import axios from 'axios';

export interface EventResponse {
  event_id: string;
}

export const createEvent = async (payload: any): Promise<EventResponse> => {
  try {
    const response = await axios.post<EventResponse>(
      'http://127.0.0.1:8000/events',
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
};
