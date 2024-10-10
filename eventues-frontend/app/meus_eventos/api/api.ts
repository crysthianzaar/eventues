// app/meus_eventos/lib/api.ts

import axios from 'axios';

const API_BASE_URL = process.env.BACKEND_API_URL;

export const fetchMyEvents = async (userId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list_events`, {
      params: { user_id: userId.replace(/-/g, '') },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao carregar eventos.');
  }
};
