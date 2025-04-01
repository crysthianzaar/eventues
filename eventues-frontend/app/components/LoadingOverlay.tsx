// components/LoadingOverlay.tsx

import { Box, Typography, CircularProgress } from '@mui/material';

const colors = {
  primary: '#5A67D8', // Azul da paleta Eventues
};

const LoadingOverlay = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.85)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)',
    }}
  >
    <CircularProgress
      size={60}
      thickness={4}
      sx={{ 
        color: colors.primary,
        marginBottom: 2
      }}
    />
    <Typography
      variant="h6"
      sx={{ 
        color: colors.primary,
        fontWeight: 500,
        letterSpacing: '0.5px'
      }}
    >
      Carregando...
    </Typography>
  </Box>
);

export default LoadingOverlay;
