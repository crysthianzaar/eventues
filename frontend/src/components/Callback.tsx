import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@aws-amplify/auth';
import axios from 'axios';

interface AuthResponse {
  status: string;
}

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [hasFetched, setHasFetched] = useState(false); // Flag para controlar a execução

  useEffect(() => {
    async function handleCallback() {
      if (hasFetched) return; // Evita execução duplicada

      try {
        const { userId, signInDetails } = await getCurrentUser();

        const userData = {
          email: signInDetails?.loginId,
          uuid: userId
        };

        console.log(userData);
        const response = await axios.post<AuthResponse>('http://localhost:8000/auth', userData);

        if (response.status === 201) {
          navigate('/');
        } else {
          console.error('Erro ao autenticar o usuário:', response.data);
        }
      } catch (error) {
        console.error('Erro durante o callback:', error);
      }

      setHasFetched(true); // Marca a execução como realizada
    }

    handleCallback();
  }, [navigate, hasFetched]);

  return <div>Processando autenticação...</div>;
};

export default Callback;
