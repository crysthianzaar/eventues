import { User } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface UserData {
  name: string;
  email: string;
  phone_number: string;
  cpf?: string;
}

export async function fetchUserData(user: User): Promise<UserData> {
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/users/${user.uid}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar dados do usuário');
  }

  return response.json();
}
