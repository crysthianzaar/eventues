import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: '#2D3748', 
        color: 'white', 
        textAlign: 'center', 
        padding: '2rem 0', 
        position: 'relative', // Certifica-se de que o footer fica posicionado corretamente
        bottom: 0,
        width: '100%', // Garante que o footer ocupe toda a largura da tela
      }}
    >
      <Typography variant="body2">&copy; 2024 Eventues. Todos os direitos reservados.</Typography>
      <Link href="#" color="inherit" sx={{ display: 'block', mt: 1 }}>
        Termos de Serviço
      </Link>
      <Link href="#" color="inherit" sx={{ display: 'block', mt: 1 }}>
        Política de Privacidade
      </Link>
    </Box>
  );
};

export default Footer;
