// components/LoginPage.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Card, CircularProgress } from '@mui/material';
import useAuth from '../hooks/useAuth';
import Image from 'next/image';
import AuthForm from './components/AuthForm';

// Componente interno que usa useSearchParams
const LoginContent = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    signingIn,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    handlePasswordReset,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if redirected from a protected route
    const message = searchParams.get('message');
    if (message === 'auth_required') {
      setAuthMessage('Faça login antes de continuar');
    } else {
      setAuthMessage(null);
    }
  }, [searchParams]);

  // Clear auth error only when explicitly switching modes
  const handleModeChange = (newMode: 'login' | 'signup' | 'reset') => {
    clearAuthError();
    setMode(newMode);
  };

  // Debug: Log authError changes
  useEffect(() => {
    console.log('Auth error changed:', authError);
  }, [authError]);

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
      }}
    >
      <Card
        sx={{
          maxWidth: '400px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Image src="/logo.png" alt="Eventues Logo" width={200} height={60} style={{ objectFit: 'contain' }} />

        {authMessage && (
          <Box
            sx={{
              backgroundColor: '#f0f8ff',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '5px',
              border: '1px solid #007bff',
              color: '#007bff',
              fontWeight: 'bold',
            }}
          >
            {authMessage}
          </Box>
        )}

        {authError && (
          <Box
            sx={{
              backgroundColor: '#fff5f5',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '5px',
              border: '1px solid #e53e3e',
              color: '#e53e3e',
              fontWeight: 'bold',
            }}
          >
            {authError}
          </Box>
        )}

        {signingIn ? (
          <CircularProgress />
        ) : (
          <AuthForm
            mode={mode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={mode === 'login' ? signInWithEmail : mode === 'signup' ? signUpWithEmail : handlePasswordReset}
            setMode={handleModeChange}
            signingIn={signingIn}
            signInWithGoogle={signInWithGoogle}
          />
        )}
      </Card>
    </Box>
  );
};

// Componente principal com Suspense
const LoginPage = () => {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
