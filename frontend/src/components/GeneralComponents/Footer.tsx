import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: '#2D3748', 
        color: 'white', 
        textAlign: 'center', 
        padding: '2rem 0', 
        position: 'relative',
        bottom: 0,
        width: '100%',
      }}
    >
      <Typography variant="body2">&copy; 2024 Eventues. Todos os direitos reservados.</Typography>
      <Link to="/terms-of-service" style={{ color: 'inherit', display: 'block', marginTop: '1rem', textDecoration: 'none' }}>
        Termos de Serviço
      </Link>
      <Link to="/privacy-policy" style={{ color: 'inherit', display: 'block', marginTop: '1rem', textDecoration: 'none' }}>
        Política de Privacidade
      </Link>
    </Box>
  );
};

export default Footer;
