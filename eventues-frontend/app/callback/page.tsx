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

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const authenticateUser = async (userData: { email: string; id: string }) => {
      try {
        const response = await axios.post<AuthResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth`,
          userData
        );
        return response.status === 201;
      } catch (error) {
        return false;
      }
    };

    const handleCallback = async () => {
      try {
        if (loading) {
          return;
        }

        if (error) {
          setErrorMessage('Ocorreu um erro com a autenticação.');
          await handleLogout();
          return;
        }

        if (!user) {
          setErrorMessage('Nenhum usuário autenticado.');
          await handleLogout();
          return;
        }

        const email = user.email || '';
        const id = user.uid || '';

        if (!email || !id) {
          setErrorMessage('Erro: Email ou ID inválidos.');
          await handleLogout();
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_id', id);
        }

        const isAuthenticated = await authenticateUser({ email, id });

        if (isAuthenticated) {
          router.replace(from);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('from');
          }
        } else {
          setErrorMessage('Falha ao autenticar o usuário.');
          await handleLogout();
        }
      } catch {
        setErrorMessage('Ocorreu um erro inesperado durante o processo de login.');
        await handleLogout();
      }
    };

    handleCallback();
  }, [user, loading, error, router, handleLogout, from]);

  return (
    <div>
      {errorMessage ? (
        <div>
          <h2>Ops! Algo deu errado.</h2>
          <p>{errorMessage}</p>
          <button onClick={() => router.push('/login')}>Voltar para o login</button>
        </div>
      ) : (
        <LoadingOverlay />
      )}
    </div>
  );
};

export default CallbackPage;
