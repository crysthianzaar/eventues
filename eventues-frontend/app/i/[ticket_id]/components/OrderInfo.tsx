'use client';

import { Box, Typography, Paper, Chip, Divider, Grid, Button } from '@mui/material';
import { TicketDetails, TicketItem } from '../types';

interface OrderInfoProps {
  ticketDetails: TicketDetails;
  formatDate: (dateString: string) => string;
}

const OrderInfo = ({ ticketDetails, formatDate }: OrderInfoProps) => {
  // Check if payment is pending or if payment_url exists
  const shouldShowPaymentButton = ticketDetails.payment_url || 
    (ticketDetails.status && ['pending', 'PAYMENT_PENDING', 'INFO_PENDING', 'PAGAMENTO PENDENTE'].includes(ticketDetails.status));

  // Generate payment URL if not provided but payment is pending
  const getPaymentUrl = () => {
    if (ticketDetails.payment_url) {
      return ticketDetails.payment_url;
    }
    
    // For pending payments without payment_url, redirect to the payment page
    if (ticketDetails.status && ['pending', 'PAYMENT_PENDING', 'INFO_PENDING', 'PAGAMENTO PENDENTE'].includes(ticketDetails.status)) {
      // Use event_slug from API response, fallback to extracting from URL or event_id
      let eventSlug = ticketDetails.event_slug;
      
      if (!eventSlug) {
        const currentPath = window.location.pathname;
        const eventSlugMatch = currentPath.match(/\/e\/([^\/]+)\//);
        eventSlug = eventSlugMatch ? eventSlugMatch[1] : ticketDetails.event_id;
      }
      
      return `/e/${eventSlug}/${ticketDetails.order_id}/payment`;
    }
    
    return null;
  };

  const paymentUrl = getPaymentUrl();

  return (
    <>
        {shouldShowPaymentButton && paymentUrl && (
              <Button
                variant="contained"
                color={ticketDetails.status === 'pending' || ticketDetails.status === 'PAYMENT_PENDING' || ticketDetails.status === 'PAGAMENTO PENDENTE' ? 'warning' : 'primary'}
                href={paymentUrl}
                target={ticketDetails.payment_url ? "_blank" : "_self"}
                fullWidth
                sx={{ mt: 1 }}
                component="a"
              >
                {ticketDetails.status === 'pending' || ticketDetails.status === 'PAYMENT_PENDING' || ticketDetails.status === 'PAGAMENTO PENDENTE'
                  ? 'Finalizar Pagamento' 
                  : 'Acessar Detalhes do Pagamento'}
              </Button>
        )}
    </>
  );
};

export default OrderInfo;
