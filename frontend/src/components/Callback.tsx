import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay ';

interface AuthResponse {
  status: string;
}

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [hasFetched, setHasFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recupera o valor de `from` do localStorage ou usa `/` como padrão
  const from = localStorage.getItem('from') || '/';

  console.log('from em Callback (localStorage):', from);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [navigate]);

  const handleCallback = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setErrorMessage('Erro ao obter o token de autenticação.');
        await handleLogout();
        return;
      }

      const email = typeof token.payload?.email === 'string' ? token.payload.email : '';
      const uuid = typeof token.payload?.sub === 'string' ? token.payload.sub : '';

      if (!email || !uuid) {
        setErrorMessage('Erro: Email ou UUID inválidos.');
        await handleLogout();
        return;
      }

      // Armazena o UUID do usuário no localStorage
      localStorage.setItem('user_id', uuid);

      const isAuthenticated = await authenticateUser({ email, uuid });

      if (isAuthenticated) {
        console.log('Redirecionando para:', from);
        navigate(from, { replace: true }); // Redireciona para a rota original

        // Limpa o valor de `from` do localStorage
        localStorage.removeItem('from');
      } else {
        setErrorMessage('Erro ao autenticar o usuário.');
        await handleLogout();
      }
    } catch (error) {
      setErrorMessage('Ocorreu um erro inesperado durante o processo de login.');
      await handleLogout();
    }
  }, [navigate, handleLogout, from]);

  useEffect(() => {
    if (hasFetched) return;

    handleCallback();
    setHasFetched(true);
  }, [hasFetched, handleCallback]);

  const getToken = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken || null;
    } catch (error) {
      console.error('Erro ao obter o token JWT:', error);
      return null;
    }
  };

  const authenticateUser = async (userData: { email: string; uuid: string }) => {
    try {
      const response = await axios.post<AuthResponse>('http://localhost:8000/auth', userData);
      return response.status === 201;
    } catch (error) {
      console.error('Erro ao autenticar o usuário:', error);
      return false;
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundSize: 'cover',
      color: 'white',
      textAlign: 'center',
      padding: '20px',
    }}>
      {errorMessage ? (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '40px',
          borderRadius: '10px',
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Ops! Algo deu errado.</h2>
          <p style={{ fontSize: '18px' }}>{errorMessage}</p>
          <button
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#36d7b7',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/login')}
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

export default Callback;
