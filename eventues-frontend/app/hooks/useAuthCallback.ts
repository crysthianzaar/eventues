// hooks/useAuthCallback.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface AuthResponse {
  status: string;
}

const useAuthCallback = () => {
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
      } catch {
        return false;
      }
    };

    const handleCallback = async () => {
      if (loading) return;

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
    };

    handleCallback();
  }, [user, loading, error, router, handleLogout, from]);

  return { errorMessage };
};

export default useAuthCallback;
