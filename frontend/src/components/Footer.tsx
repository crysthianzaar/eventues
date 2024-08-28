import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#2D3748', color: 'white', textAlign: 'center', padding: '2rem 0' }}>
      <Typography variant="body2">&copy; 2024 Eventues. Todos os direitos reservados.</Typography>
      <Link href="#" color="inherit">
        Termos de Serviço
      </Link>{' '}
      |{' '}
      <Link href="#" color="inherit">
        Política de Privacidade
      </Link>
    </Box>
  );
};

export default Footer;
