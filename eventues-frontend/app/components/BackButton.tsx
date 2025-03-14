'use client';
import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

/**
 * Componente de botão para navegação de volta
 * Pode ser usado com href para navegação direta ou com onClick para lógica personalizada
 */
const BackButton: React.FC<BackButtonProps> = ({ 
  href, 
  onClick, 
  label = 'Voltar' 
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!href) {
      router.back();
    }
  };

  const buttonContent = (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={handleClick}
      sx={{ mb: 2 }}
    >
      {label}
    </Button>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
};

export default BackButton;
