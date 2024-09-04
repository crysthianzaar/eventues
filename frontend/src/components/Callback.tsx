import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '@aws-amplify/auth'; // Inclua o signOut
import axios from 'axios';
import { ClipLoader } from 'react-spinners'; // Componente de loading

interface AuthResponse {
  status: string;
}

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [hasFetched, setHasFetched] = useState(false); // Flag para controlar a execução

  useEffect(() => {
    async function handleCallback() {
      if (hasFetched) return;

      try {
        const { userId, signInDetails } = await getCurrentUser();

        const userData = {
          email: signInDetails?.loginId,
          uuid: userId
        };

        console.log(userData);
        const response = await axios.post<AuthResponse>('http://localhost:8000/auth', userData);

        if (response.status === 201) {
          navigate('/');  // Redireciona para a página principal em caso de sucesso
        } else {
          console.error('Erro ao autenticar o usuário:', response.data);
          await signOut();  // Desloga o usuário
          navigate('/');  // Redireciona para a página inicial após o logout
        }
      } catch (error) {
        console.error('Erro durante o callback:', error);
        await signOut();  // Desloga o usuário em caso de erro
        navigate('/');  // Redireciona para a página inicial após o logout
      }

      setHasFetched(true); // Marca a execução como realizada
    }

    handleCallback();
  }, [navigate, hasFetched]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <ClipLoader color="#36d7b7" size={50} /> {/* Indicador de carregamento */}
      <p>Aquecendo...</p>
    </div>
  );
};

export default Callback;
