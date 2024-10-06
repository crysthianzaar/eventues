import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link'; // Importando o Link do Next.js

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: '#2D3748', 
        color: 'white', 
        textAlign: 'center', 
        padding: '2rem 0', 
        position: 'fixed', // Fixado no rodapé
        bottom: 0, // Colado na parte inferior
        left: 0, // Colado na lateral esquerda
        width: '100%', // Ocupar 100% da largura da página
        zIndex: 1000, // Garante que esteja por cima de outros elementos
      }}
    >
      <Typography variant="body2">&copy; 2024 Eventues. Todos os direitos reservados.</Typography>
      
      {/* Links usando o Next.js Link */}
      <Link href="/terms-of-service" passHref legacyBehavior>
        <a style={{ color: 'inherit', display: 'block', marginTop: '1rem', textDecoration: 'none' }}>
          Termos de Serviço
        </a>
      </Link>

      <Link href="/privacy-policy" passHref legacyBehavior>
        <a style={{ color: 'inherit', display: 'block', marginTop: '1rem', textDecoration: 'none' }}>
          Política de Privacidade
        </a>
      </Link>
    </Box>
  );
};

export default Footer;
