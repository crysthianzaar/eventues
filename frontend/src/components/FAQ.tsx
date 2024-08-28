import React from 'react';
import { Box, Typography } from '@mui/material';

const FAQ: React.FC = () => {
  return (
    <Box sx={{ padding: '60px 20px', backgroundColor: '#EDF2F7', textAlign: 'center' }}>
      <Typography variant="h4" component="h2" sx={{ mb: 3, color: '#5A67D8' }}>
        Perguntas Frequentes
      </Typography>
      <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
        <Typography variant="h5">Como posso criar meu evento?</Typography>
        <Typography variant="body1" sx={{ mt: 1, color: '#4A5568' }}>
          É fácil! Basta clicar no botão "Crie seu evento" no topo da página e seguir os passos.
        </Typography>
      </Box>
      <Box sx={{ maxWidth: 800, margin: '20px auto' }}>
        <Typography variant="h5">Quais modalidades de pagamento são aceitas?</Typography>
        <Typography variant="body1" sx={{ mt: 1, color: '#4A5568' }}>
          Suportamos várias formas de pagamento, incluindo cartões de crédito, boleto e Pix.
        </Typography>
      </Box>
    </Box>
  );
};

export default FAQ;
