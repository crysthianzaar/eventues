'use client'; // Isso garante que estamos usando recursos do cliente

import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ReactNode, useEffect } from 'react';
import { auth } from '../../firebase';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Se o usuário não estiver logado, redireciona para a página de login
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    // Exibe uma tela de carregamento enquanto verifica o status de autenticação
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Carregando...</div>
      </div>
    );
  }

  // Se o usuário estiver logado, renderiza o conteúdo protegido
  return <>{user ? children : null}</>;
};

export default ProtectedRoute;
