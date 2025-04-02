'use client';

import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import { TicketData } from './types';

interface PaymentSummaryProps {
  ticketData: TicketData[];
}

export function PaymentSummary({ ticketData }: PaymentSummaryProps) {
  const totalAmount = ticketData.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2)}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Resumo da Compra
      </Typography>

      <Grid container spacing={2}>
        {ticketData.map((ticket, index) => (
          <React.Fragment key={ticket.id}>
            <Grid item xs={8}>
              <Typography variant="body1">
                {ticket.name} x {ticket.quantity}
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body1">
                {formatPrice(ticket.price * ticket.quantity)}
              </Typography>
            </Grid>
            {index < ticketData.length - 1 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
            )}
          </React.Fragment>
        ))}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={8}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {formatPrice(totalAmount)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
