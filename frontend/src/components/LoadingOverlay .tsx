import React from 'react';
import { Box, Typography } from '@mui/material';
import loadingGif from '../assets/aquecendo.gif'; // Ajuste o caminho conforme necessário

const colors = {
  primary: '#5A67D8', // Azul da paleta Eventues
};

const LoadingOverlay: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.7)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <img src={loadingGif} alt="Carregando..." style={{ width: '150px' }} />
    <Typography
      variant="h6"
      sx={{ color: colors.primary, marginTop: '16px' }}
    >
      Aquecendo...
    </Typography>
  </Box>
);

export default LoadingOverlay;
