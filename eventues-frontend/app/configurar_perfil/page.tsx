'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase'; // Ajuste o caminho conforme necessário
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ConfigurarPerfilPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    birthDate: '', // Campo editável
    phoneNumber: '', // Campo editável
    userType: '', // Campo editável
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Carregar informações do usuário do Firebase ou do backend
      setUserInfo({
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '/default-profile.png',
        birthDate: '1990-01-01', // Deve ser obtido do backend
        phoneNumber: '(27) 99999-9999', // Deve ser obtido do backend
        userType: 'Participante', // Deve ser obtido do backend
      });
    } else if (!loading) {
      // Se não estiver logado, redirecionar para a página de login
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Enviar informações atualizadas para o backend
      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar as informações do perfil.');
      }

      // Opcional: atualizar o perfil do usuário no Firebase Auth
      // await user.updateProfile({
      //   displayName: userInfo.displayName,
      //   photoURL: userInfo.photoURL,
      // });

      // Redirecionar para a página "Minha Conta" ou mostrar uma mensagem de sucesso
      router.push('/minha_conta');
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '20px', md: '40px' },
        backgroundImage: 'url("/cycling.jpg")', // Imagem de fundo
        backgroundSize: 'cover', // Cobrir toda a área
        backgroundPosition: 'center', // Centralizar a imagem
        backgroundRepeat: 'no-repeat', // Não repetir a imagem
      }}
    >
      <Card
        sx={{
          maxWidth: '600px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)', // Sombra mais forte
          borderRadius: '12px',
          backgroundColor: '#ffffff', // Fundo branco sólido
          position: 'relative',
        }}
      >

        {/* Estado de carregamento durante a autenticação ou salvamento */}
        {(loading || isSaving) ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (error || saveError) ? (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {error?.message || saveError}
          </Typography>
        ) : (
          <>
            <Typography
              variant="h5"
              sx={{ marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}
            >
              Configurar Perfil
            </Typography>

            {/* Foto de Perfil */}
            <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar
                src={userInfo.photoURL}
                alt="Foto de perfil"
                sx={{ width: 120, height: 120, margin: '0 auto' }}
              />
            </Box>

            {/* Campos do Formulário */}
            <TextField
              label="Nome de Usuário"
              name="displayName"
              value={userInfo.displayName}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '15px' }}
            />

            {/* E-mail (somente leitura) */}
            <TextField
              label="E-mail"
              name="email"
              value={userInfo.email}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '15px' }}
              InputProps={{
                readOnly: true,
              }}
            />

            {/* Data de Nascimento */}
            <TextField
              label="Data de Nascimento"
              name="birthDate"
              type="date"
              value={userInfo.birthDate}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '15px' }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Telefone */}
            <TextField
              label="Telefone"
              name="phoneNumber"
              value={userInfo.phoneNumber}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '15px' }}
            />

            {/* Tipo de Usuário */}
            <TextField
              label="Tipo de Usuário"
              name="userType"
              value={userInfo.userType}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '25px' }}
            />

            {/* Botão de Salvar */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSave}
              disabled={isSaving}
              sx={{ fontWeight: 'bold' }}
            >
              Salvar
            </Button>
          </>
        )}

        {/* Notificações de Erro */}
        {saveError && (
          <Snackbar
            open={!!saveError}
            autoHideDuration={4000}
            onClose={() => setSaveError(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setSaveError(null)} severity="error">
              {saveError}
            </Alert>
          </Snackbar>
        )}
      </Card>
    </Box>
  );
};

export default ConfigurarPerfilPage;
