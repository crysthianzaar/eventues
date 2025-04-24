// pages/ConfigurarPerfilPage.tsx
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
import { getIdToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  birth_date: string; // Data formatada
  phone_number: string;
  cpf: string;
}

const ConfigurarPerfilPage = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    cpf: '',
    email: '',
    birth_date: '', // Campo editável
    phone_number: '', // Campo editável
    id: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const token = await getIdToken(user);
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${user.uid}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Falha ao carregar informações da conta.');
          }

          const data: UserInfo = await response.json();

          setUserInfo({
            name: data.name || '',
            cpf: data.cpf || '',
            email: data.email || '',
            birth_date: data.birth_date || '',
            phone_number: data.phone_number || '',
            id: data.id || '',
          });
        } catch (err) {
          setSaveError((err as Error).message);
        }
      } else if (!loadingAuth) {
        // Se não estiver logado, redirecionar para a página de login
        router.push('/login');
      }
    };

    fetchUserInfo();
  }, [user, loadingAuth, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    // Validações básicas
    if (!userInfo.name.trim()) {
      setSaveError('O nome de usuário é obrigatório.');
      setIsSaving(false);
      return;
    }
    if (!userInfo.birth_date) {
      setSaveError('A data de nascimento é obrigatória.');
      setIsSaving(false);
      return;
    }
    if (!userInfo.phone_number.trim()) {
      setSaveError('O telefone é obrigatório.');
      setIsSaving(false);
      return;
    }

    try {
      const token = await getIdToken(user!);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${user!.uid}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userInfo.name,
          cpf: userInfo.cpf,
          birth_date: userInfo.birth_date,
          phone_number: userInfo.phone_number,
          email: userInfo.email,
          id: userInfo.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar as informações do perfil.');
      }

      // Opcional: atualizar o perfil do usuário no Firebase Auth
      // await user.updateProfile({
      //   displayName: userInfo.name,
      //   photoURL: userInfo.photoURL,
      // });

      setSaveSuccess('Perfil atualizado com sucesso.');
      // Redirecionar para a página "Minha Conta" após um breve delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        router.push('/minha_conta');
      }, 2000);
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
        backgroundImage: 'url("/banner_template.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Card
        sx={{
          maxWidth: '600px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >

        {/* Estado de carregamento durante a autenticação ou salvamento */}
        {(loadingAuth || isSaving) ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (errorAuth || saveError) ? (
            <Typography color="error" sx={{ textAlign: 'center' }}>
            {errorAuth?.message || saveError}
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
              src={user?.photoURL || '/default-profile.png'}
              alt="Foto de perfil"
              sx={{ width: 120, height: 120, margin: '0 auto' }}
              />
            </Box>

            {/* Campos do Formulário */}
            <TextField
              label="Nome de Usuário"
              name="name"
              value={userInfo.name}
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
              sx={{ marginBottom: '15px', backgroundColor: '#f0f0f0' }}
              InputProps={{
              readOnly: true,
              }}
            />

            {/* Data de Nascimento */}
            <TextField
              label="Data de Nascimento"
              name="birth_date"
              type="date"
              value={userInfo.birth_date}
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
              name="phone_number"
              value={userInfo.phone_number}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '15px' }}
            />
            
            {/* CPF */}
            <TextField
              label="CPF"
              name="cpf"
              value={userInfo.cpf}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: '15px' }}
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

        {/* Notificações de Sucesso */}
        {saveSuccess && (
          <Snackbar
            open={!!saveSuccess}
            autoHideDuration={4000}
            onClose={() => setSaveSuccess(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setSaveSuccess(null)} severity="success">
              {saveSuccess}
            </Alert>
          </Snackbar>
        )}
      </Card>
    </Box>
  );
};

export default ConfigurarPerfilPage;
