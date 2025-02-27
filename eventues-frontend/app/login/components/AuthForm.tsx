// components/AuthForm.tsx
import React from 'react';
import { TextField, Button, Box, Typography, Link as MuiLink } from '@mui/material';
import Image from 'next/image';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'reset';
  email: string;
  setEmail: (value: string) => void;
  password?: string;
  setPassword?: (value: string) => void;
  handleSubmit: () => void;
  setMode: (mode: 'login' | 'signup' | 'reset') => void;
  signingIn: boolean;
  signInWithGoogle: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
  setMode,
  signingIn,
  signInWithGoogle,
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#2d3748' }}>
        {mode === 'login' ? 'Acesse sua conta ou crie uma nova' : mode === 'signup' ? 'Crie sua conta' : 'Redefina sua senha'}
      </Typography>

      {mode === 'login' && (
        <>
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
            <Image src="/google.png" alt="Google Logo" width={24} height={24} />
            <Typography sx={{ fontWeight: 'bold', marginLeft: '10px', color: '#757575' }}>
              Entrar com Google
            </Typography>
          </Button>

          <Typography variant="body2" sx={{ marginBottom: '10px', color: '#757575' }}>
            ou entre com seu e-mail
          </Typography>
        </>
      )}

      <TextField
        label="E-mail"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ marginBottom: '10px' }}
      />

      {mode !== 'reset' && setPassword && (
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
      )}

      <Button
        onClick={handleSubmit}
        disabled={signingIn}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ marginBottom: '10px', fontWeight: 'bold' }}
      >
        {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Enviar link'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {mode === 'login' && (
          <>
            <MuiLink component="button" variant="body2" onClick={() => setMode('reset')} sx={{ color: '#5A67D8' }}>
              Esqueci minha senha
            </MuiLink>
            <MuiLink component="button" variant="body2" onClick={() => setMode('signup')} sx={{ color: '#5A67D8' }}>
              Cadastrar
            </MuiLink>
          </>
        )}
        {mode !== 'login' && (
          <MuiLink component="button" variant="body2" onClick={() => setMode('login')} sx={{ color: '#5A67D8' }}>
            Voltar ao login
          </MuiLink>
        )}
      </Box>
    </Box>
  );
};

export default AuthForm;
