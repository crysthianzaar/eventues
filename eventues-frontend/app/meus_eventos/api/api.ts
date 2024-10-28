// app/meus_eventos/api/api.ts

import axios from 'axios';
import { auth } from '../../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const fetchMyEvents = async (userId: string) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Usuário não autenticado.');
  }

  const token = await currentUser.getIdToken();

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/list_events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao carregar eventos.');
  }
};
