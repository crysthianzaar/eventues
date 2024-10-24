// pages/callback.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../firebase'; // Certifique-se de que este caminho está correto
import { useAuthState } from 'react-firebase-hooks/auth';
import LoadingOverlay from '../components/LoadingOverlay';

interface AuthResponse {
  status: string;
}

const CallbackPage: React.FC = () => {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = typeof window !== 'undefined' ? localStorage.getItem('from') || '/' : '/';

  console.log('from no Callback (localStorage):', from);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const authenticateUser = async (userData: { email: string; id: string }) => {
      console.log('Entrou em authenticateUser com:', userData);
      try {
        const response = await axios.post<AuthResponse>('http://127.0.0.1:8000/auth', userData);
        console.log('Resposta da API:', response);
        return response.status === 201;
      } catch (error) {
        console.error('Erro ao autenticar o usuário:', error);
        return false;
      }
    };

    const handleCallback = async () => {
      console.log('handleCallback foi chamado');
      try {
        if (loading) {
          // Ainda carregando, não faz nada
          return;
        }

        if (error) {
          console.error('Erro com a autenticação:', error);
          setErrorMessage('Ocorreu um erro com a autenticação.');
          await handleLogout();
          return;
        }

        if (!user) {
          console.log('Nenhum usuário autenticado, chamando handleLogout');
          setErrorMessage('Nenhum usuário autenticado.');
          await handleLogout();
          return;
        }

        const email = user.email || '';
        const id = user.uid || '';

        console.log('Email do usuário:', email);
        console.log('id do usuário:', id);

        if (!email || !id) {
          console.log('Email ou id inválidos, chamando handleLogout');
          setErrorMessage('Erro: Email ou id inválidos.');
          await handleLogout();
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_id', id);
        }

        console.log('Chamando authenticateUser com:', { email, id });
        const isAuthenticated = await authenticateUser({ email, id });
        console.log('Resultado de authenticateUser:', isAuthenticated);

        if (isAuthenticated) {
          console.log('Redirecionando para:', from);
          router.replace(from);

          if (typeof window !== 'undefined') {
            localStorage.removeItem('from');
          }
        } else {
          console.log('Autenticação falhou, chamando handleLogout');
          setErrorMessage('Falha ao autenticar o usuário.');
          await handleLogout();
        }
      } catch (error) {
        console.error('Erro no handleCallback:', error);
        setErrorMessage('Ocorreu um erro inesperado durante o processo de login.');
        await handleLogout();
      }
    };

    handleCallback();
  }, [user, loading, error, router, handleLogout, from]);

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
