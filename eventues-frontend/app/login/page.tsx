'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
  Link as MuiLink,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useRouter } from 'next/navigation'; // Usar o router para redirecionamento
import Image from 'next/image';

const LoginPage = () => {
  const provider = new GoogleAuthProvider();
  const [user, loading, error] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const router = useRouter(); // Inicializar o router para redirecionamento

  // Função para login com Google
  const signInWithGoogle = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, provider);
      router.push('/'); // Redireciona para a home após login com Google
    } catch (err) {
      setAuthError('Falha ao tentar fazer login com Google.');
    } finally {
      setSigningIn(false);
    }
  };

  // Função para login com email/senha
  const signInWithEmail = async () => {
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redireciona para a home após login
    } catch (err) {
      setAuthError('Falha ao tentar fazer login com e-mail e senha.');
    } finally {
      setSigningIn(false);
    }
  };

  // Função para cadastro com email/senha
  const signUpWithEmail = async () => {
    setSigningIn(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSignupSuccess(true); // Mostra a notificação de sucesso
      setTimeout(() => {
        router.push('/'); // Redireciona para a home após o cadastro
      }, 3000);
    } catch (err) {
      setAuthError('Falha ao tentar criar conta.');
    } finally {
      setSigningIn(false);
    }
  };

  // Função para resetar senha
  const handlePasswordReset = async () => {
    if (!email) {
      setAuthError('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err) {
      setAuthError('Erro ao enviar e-mail de redefinição de senha.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: 'url("/login.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: { xs: '20px', md: '40px' },
      }}
    >
      <Card
        sx={{
          maxWidth: '400px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)', // Sombra preta mais longa e forte
          borderRadius: '12px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo da Eventues */}
        <Box sx={{ marginBottom: '20px' }}>
          <Image
            src="/logo.png"
            alt="Eventues Logo"
            width={200}
            height={60}
            style={{ objectFit: 'contain' }}
          />
        </Box>

        {/* Estado de carregamento durante a autenticação */}
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {mode === 'login' && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: '20px',
                    fontWeight: 'bold',
                    color: '#2d3748',
                  }}
                >
                  Acesse sua conta ou crie uma nova
                </Typography>

                {/* Botão padrão do Google colorido */}
                <Button
                  onClick={signInWithGoogle}
                  disabled={signingIn}
                  sx={{
                    width: '100%',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '20px',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  <Image
                    src="/google.png"
                    alt="Google Logo"
                    width={24}
                    height={24}
                  />
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      marginLeft: '10px',
                      color: '#757575',
                    }}
                  >
                    Entrar com Google
                  </Typography>
                </Button>

                <Typography
                  variant="body2"
                  sx={{ marginBottom: '10px', color: '#757575' }}
                >
                  ou entre com seu e-mail
                </Typography>

                <TextField
                  label="E-mail"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
                <TextField
                  label="Senha"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />

                <Button
                  onClick={signInWithEmail}
                  disabled={signingIn}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: '10px', fontWeight: 'bold' }}
                >
                  Entrar
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => setMode('reset')}
                    sx={{ color: '#5A67D8', cursor: 'pointer' }}
                  >
                    Esqueci minha senha
                  </MuiLink>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => setMode('signup')}
                    sx={{ color: '#5A67D8', cursor: 'pointer' }}
                  >
                    Cadastrar
                  </MuiLink>
                </Box>
              </>
            )}

            {/* Modo de cadastro */}
            {mode === 'signup' && (
              <>
                <Typography
                  variant="h6"
                  sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#2d3748' }}
                >
                  Crie sua conta
                </Typography>

                <TextField
                  label="E-mail"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />
                <TextField
                  label="Senha"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />

                <Button
                  onClick={signUpWithEmail}
                  disabled={signingIn}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: '10px', fontWeight: 'bold' }}
                >
                  Cadastrar
                </Button>

                <MuiLink
                  component="button"
                  variant="body2"
                  onClick={() => setMode('login')}
                  sx={{ color: '#5A67D8', cursor: 'pointer' }}
                >
                  Já tem uma conta? Entrar
                </MuiLink>
              </>
            )}

            {/* Modo de recuperação de senha */}
            {mode === 'reset' && (
              <>
                <Typography
                  variant="h6"
                  sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#2d3748' }}
                >
                  Redefina sua senha
                </Typography>

                <TextField
                  label="E-mail"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ marginBottom: '10px' }}
                />

                <Button
                  onClick={handlePasswordReset}
                  disabled={signingIn}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: '10px', fontWeight: 'bold' }}
                >
                  Enviar link de redefinição
                </Button>

                <MuiLink
                  component="button"
                  variant="body2"
                  onClick={() => setMode('login')}
                  sx={{ color: '#5A67D8', cursor: 'pointer' }}
                >
                  Voltar ao login
                </MuiLink>
              </>
            )}

            {/* Exibição de erros de autenticação */}
            {authError && (
              <Typography color="error" sx={{ marginTop: '10px' }}>
                {authError}
              </Typography>
            )}

            {/* Notificação de sucesso ao cadastrar */}
            <Snackbar
              open={signupSuccess}
              autoHideDuration={4000}
              onClose={() => setSignupSuccess(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={() => setSignupSuccess(false)} severity="success">
                Conta criada com sucesso! Você será redirecionado para o login.
              </Alert>
            </Snackbar>

            {/* Notificação de sucesso ao enviar e-mail de redefinição */}
            <Snackbar
              open={resetEmailSent}
              autoHideDuration={4000}
              onClose={() => setResetEmailSent(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={() => setResetEmailSent(false)} severity="success">
                Link de redefinição de senha enviado!
              </Alert>
            </Snackbar>
          </>
        )}
      </Card>
    </Box>
  );
};

export default LoginPage;
