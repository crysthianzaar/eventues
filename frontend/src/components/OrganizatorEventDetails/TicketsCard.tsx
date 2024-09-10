import React from 'react';
import { Box, Typography } from '@mui/material';

const colors = {
  primary: "#5A67D8",
  grayDark: "#2D3748",
};

const TicketsCard: React.FC = () => {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: colors.grayDark }}>
        Ticket details go here.
      </Typography>
    </Box>
  );
};

export default TicketsCard;
