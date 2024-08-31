import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const FAQ: React.FC = () => {
  return (
    <Box sx={{ padding: '60px 20px', backgroundColor: '#EDF2F7', textAlign: 'center' }}>
      <Typography variant="h4" component="h2" sx={{ mb: 3, color: '#5A67D8' }}>
        Perguntas Frequentes
      </Typography>
      <Grid 
        container 
        spacing={3} 
        justifyContent="center" 
        sx={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          flexDirection: { xs: 'column', md: 'row' }, // Empilha em telas pequenas, fila em telas grandes
          alignItems: 'center', // Centraliza itens verticalmente
        }}
      >
        <Grid item xs={12} sm={8} md={4}> {/* Ajuste no tamanho para centralizar melhor */}
          <Box sx={{ textAlign: 'left', padding: '10px' }}> {/* Centraliza e adiciona padding em telas pequenas */}
            <Typography variant="h5">Como posso criar meu evento?</Typography>
            <Typography variant="body1" sx={{ mt: 1, color: '#4A5568' }}>
              É fácil! Basta clicar no botão "Crie seu evento" no topo da página e seguir os passos.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={8} md={4}> {/* Ajuste no tamanho para centralizar melhor */}
          <Box sx={{ textAlign: 'left', padding: '10px' }}> {/* Centraliza e adiciona padding em telas pequenas */}
            <Typography variant="h5">Quais modalidades de pagamento são aceitas?</Typography>
            <Typography variant="body1" sx={{ mt: 1, color: '#4A5568' }}>
              Suportamos várias formas de pagamento, incluindo cartões de crédito, boleto e Pix.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FAQ;
