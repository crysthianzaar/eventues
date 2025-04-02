'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PaymentSuccessProps {
  message?: string;
}

export function PaymentSuccess({ message = 'Redirecionando para os detalhes da sua inscrição...' }: PaymentSuccessProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideDown 0.5s ease-in-out',
          '@keyframes slideDown': {
            '0%': {
              transform: 'translateY(-20px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: 'success.main',
            borderRadius: '50%',
            padding: 2,
            mb: 3,
            animation: 'scaleIn 0.5s ease-in-out 0.2s both',
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        >
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80,
              color: 'white',
            }} 
          />
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'success.main',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 2,
            animation: 'fadeIn 0.5s ease-in-out 0.4s both',
          }}
        >
          Pagamento Confirmado!
        </Typography>
        <Typography 
          variant="subtitle1"
          sx={{ 
            color: 'text.secondary',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out 0.6s both',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}
