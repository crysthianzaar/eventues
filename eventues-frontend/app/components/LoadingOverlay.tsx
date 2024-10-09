// components/LoadingOverlay.tsx

import { Box, Typography } from '@mui/material';
import Image from 'next/image';

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
      backgroundColor: 'rgba(255,255,255,0.7)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <Image
      src="/aquecendo.gif"
      alt="Carregando..."
      width={150}
      height={150}
    />
    <Typography
      variant="h6"
      sx={{ color: colors.primary, marginTop: '16px' }}
    >
      Aquecendo...
    </Typography>
  </Box>
);

export default LoadingOverlay;
