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
        position: 'relative', // Usando relative para permitir que o conteúdo empurre o footer para baixo
        width: '100%', // Ocupar 100% da largura da página
        marginTop: 'auto', // Garante que o footer fique na parte inferior se o conteúdo for menor que a tela
      }}
    >
      <Typography variant="body2">&copy; 2024 Eventues. Todos os direitos reservados.</Typography>
      
      {/* Links usando o Next.js Link */}
      <Link href="/terms_of_service" passHref legacyBehavior>
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
