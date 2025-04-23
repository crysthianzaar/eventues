// hooks/useAuthCallback.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Helper function to update order user_id
async function updateOrderUserId(orderId: string, userId: string): Promise<void> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/update-user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order user_id');
    }
  } catch (error) {
    console.error('Error updating order user_id:', error);
    throw error;
  }
}

interface AuthResponse {
  status: string;
}

const useAuthCallback = () => {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if we have a specific redirect path from the protected routes first, otherwise use the general 'from' path
  const redirectPath = typeof window !== 'undefined' 
    ? localStorage.getItem('redirectAfterLogin') || localStorage.getItem('from') || '/' 
    : '/';

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
        // Check if we need to update order user_id
        const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
        if (redirectPath && typeof window !== 'undefined') {
          // Extract order_id from redirectPath if it's a protected route
          // Format example: /e/slug/order_id/infos or /e/slug/order_id/payment
          const pathParts = redirectPath.split('/');
          // Check if it has the right format and get order_id (should be the 4th part)
          if (pathParts.length >= 5 && pathParts[1] === 'e') {
            const orderId = pathParts[3];
            const userId = localStorage.getItem('user_id');
            
            // Update the order with the logged-in user_id
            try {
              await updateOrderUserId(orderId, userId || '');
              console.log('Order user_id updated successfully');
            } catch (error) {
              console.error('Failed to update order user_id:', error);
              // Continue with redirect even if update fails
            }
          }
        }
        
        router.replace(redirectPath || '/');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('from');
          localStorage.removeItem('redirectAfterLogin');
        }
      } else {
        setErrorMessage('Falha ao autenticar o usuário.');
        await handleLogout();
      }
    };

    handleCallback();
  }, [user, loading, error, router, handleLogout, redirectPath]);

  return { errorMessage };
};

export default useAuthCallback;
