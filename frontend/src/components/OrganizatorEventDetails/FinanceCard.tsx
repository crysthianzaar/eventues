import React from 'react';
import { Box, Typography } from '@mui/material';

const colors = {
  primary: "#5A67D8",
  grayDark: "#2D3748",
};

const FinanceCard: React.FC = () => {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: colors.grayDark }}>
        Finance details go here.
      </Typography>
    </Box>
  );
};

export default FinanceCard;
