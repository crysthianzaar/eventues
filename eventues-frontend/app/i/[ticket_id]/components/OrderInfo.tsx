'use client';

import { Box, Typography, Paper, Chip, Divider, Grid, Button } from '@mui/material';
import { TicketDetails, TicketItem } from '../types';

interface OrderInfoProps {
  ticketDetails: TicketDetails;
  formatDate: (dateString: string) => string;
}

const OrderInfo = ({ ticketDetails, formatDate }: OrderInfoProps) => {
  return (
    <>
        {ticketDetails.payment_url && (
              <Button
                variant="contained"
                color="primary"
                href={ticketDetails.payment_url}
                target="_blank"
                fullWidth
                sx={{ mt: 1 }}
                component="a"
              >
                Acessar Detalhes do Pagamento
              </Button>
        )}
    </>
  );
};

export default OrderInfo;
