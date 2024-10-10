'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession, signOut } from '@aws-amplify/auth';
import axios from 'axios';
import './../configureAmplify'; // Importe a configuração do Amplify
import LoadingOverlay from '../components/LoadingOverlay';

interface AuthResponse {
  status: string;
}

const CallbackPage: React.FC = () => {
  const router = useRouter();
  const [hasFetched, setHasFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = typeof window !== 'undefined' ? localStorage.getItem('from') || '/' : '/';

  console.log('from em Callback (localStorage):', from);

  const handleLogout = useCallback(async () => {
    await signOut();
    router.push('/login');
  }, [router]);

  const handleCallback = useCallback(async () => {
    console.log('handleCallback foi chamado');
    try {
      const token = await getToken();
      console.log('Token obtido:', token);
  
      if (!token) {
        console.log('Token não obtido, chamando handleLogout');
        setErrorMessage('Erro ao obter o token de autenticação.');
        await handleLogout();
        return;
      }
  
      const email = typeof token.payload?.email === 'string' ? token.payload.email : '';
      const uuid = typeof token.payload?.sub === 'string' ? token.payload.sub : '';
  
      console.log('Email extraído do token:', email);
      console.log('UUID extraído do token:', uuid);
  
      if (!email || !uuid) {
        console.log('Email ou UUID inválidos, chamando handleLogout');
        setErrorMessage('Erro: Email ou UUID inválidos.');
        await handleLogout();
        return;
      }
  
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_id', uuid);
      }
  
      console.log('Chamando authenticateUser com:', { email, uuid });
      const isAuthenticated = await authenticateUser({ email, uuid });
      console.log('Resultado de authenticateUser:', isAuthenticated);
  
      if (isAuthenticated) {
        console.log('Redirecionando para:', from);
        router.replace(from);
  
        if (typeof window !== 'undefined') {
          localStorage.removeItem('from');
        }
      } else {
        console.log('Autenticação falhou, chamando handleLogout');
        setErrorMessage('Erro ao autenticar o usuário.');
        await handleLogout();
      }
    } catch (error) {
      console.error('Erro no handleCallback:', error);
      setErrorMessage('Ocorreu um erro inesperado durante o processo de login.');
      await handleLogout();
    }
  }, [router, handleLogout, from]);
  

  useEffect(() => {
    if (hasFetched) return;

    handleCallback();
    setHasFetched(true);
  }, [hasFetched, handleCallback]);

  const getToken = async () => {
    try {
      console.log('Chamando fetchAuthSession');
      const { tokens } = await fetchAuthSession();
      console.log('Tokens obtidos:', tokens);
      return tokens?.idToken || null;
    } catch (error) {
      console.error('Erro ao obter o token JWT:', error);
      return null;
    }
  };
  
  

  const authenticateUser = async (userData: { email: string; uuid: string }) => {
    console.log('Entrou em authenticateUser com:', userData);
    try {
      const response = await axios.post<AuthResponse>('http://localhost:8000/auth', userData);
      console.log('Resposta da API:', response);
      return response.status === 201;
    } catch (error) {
      console.error('Erro ao autenticar o usuário:', error);
      return false;
    }
  };

  return (
    <div style={{ /* estilos */ }}>
      {errorMessage ? (
        <div style={{ /* estilos */ }}>
          <h2 style={{ /* estilos */ }}>Ops! Algo deu errado.</h2>
          <p style={{ /* estilos */ }}>{errorMessage}</p>
          <button
            style={{ /* estilos */ }}
            onClick={() => router.push('/login')}
          >
            Voltar para o login
          </button>
        </div>
      ) : (
        <LoadingOverlay />
      )}
    </div>
  );
};

export default CallbackPage;
