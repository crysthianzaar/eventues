// components/AuthErrorMessage.tsx
import React from 'react';
import { useRouter } from 'next/navigation';

interface AuthErrorMessageProps {
  message: string;
}

const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({ message }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-red-600">Ops! Algo deu errado.</h2>
      <p className="text-gray-700">{message}</p>
      <button 
        onClick={() => router.push('/login')} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Voltar para o login
      </button>
    </div>
  );
};

export default AuthErrorMessage;
