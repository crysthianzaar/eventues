import React from 'react';
import { Box, Typography } from '@mui/material';

const colors = {
  primary: "#5A67D8",
  grayDark: "#2D3748",
};

const FormCard: React.FC = () => {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: colors.grayDark }}>
        Form settings and details go here.
      </Typography>
    </Box>
  );
};

export default FormCard;
