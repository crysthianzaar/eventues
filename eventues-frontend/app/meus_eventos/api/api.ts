import axios from 'axios';

export const fetchMyEvents = async (userId: string) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/list_events`, {
      params: { user_id: userId.replace(/-/g, '') },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao carregar eventos.');
  }
};
