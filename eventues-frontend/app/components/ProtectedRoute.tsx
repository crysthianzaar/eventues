// components/ProtectedRoute.tsx
"use client"; // Garante que estamos usando recursos do cliente

import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ReactNode, useEffect } from 'react';
import { auth } from '../../firebase';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname(); // Obtém o caminho atual

  useEffect(() => {
    if (!loading && !user) {
      // Salva o caminho original no localStorage antes de redirecionar
      localStorage.setItem('redirectPath', pathname || '/');
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

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
