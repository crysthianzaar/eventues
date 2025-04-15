'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import { getOrder, Order, getEventBySlug } from '@/app/apis/api';
import PaymentComponent from '../../tickets/components/payment/PaymentComponent';
import { CustomerData, TicketData } from '../../tickets/components/payment/types';
import CheckoutStepper from '@/app/components/CheckoutStepper';
import { formatPrice } from '@/app/utils/formatPrice';

export default function PaymentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const orderId = params?.order_id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    fees: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId || !slug) return;

      try {
        // Fetch order data
        const orderData = await getOrder(orderId);
        setOrder(orderData);

        // Event data will be fetched later when processing tickets

        // Extract customer data from the first participant's info
        const firstParticipant = orderData.participants?.[0] || {};
        setCustomerData({
          name: firstParticipant.fullName || '',
          email: firstParticipant.email || '',
          cpf: firstParticipant.cpf || '',
          phone: firstParticipant.phone || ''
        });

        // Get the event details to fetch ticket prices if needed
        const eventData = await getEventBySlug(slug);
        
        // Find ticket prices from event data if available
        // Cast eventData to any to access ingressos property which might not be in the type definition
        const eventTickets = (eventData as any)?.ingressos || [];
        
        // Transform tickets data to match PaymentComponent's expected format
        const tickets = orderData.tickets.map((ticket: any) => {
          // Find matching ticket in event data to get price
          const eventTicket = eventTickets.find((et: any) => et.id === ticket.ticket_id);
          const ticketPrice = eventTicket?.valor || 0;
          
          // Calculate individual ticket price if total_amount is provided
          // This ensures we're using the actual prices from the order
          const calculatedPrice = orderData.total_amount && orderData.tickets.length > 0 ? 
            (orderData.total_amount / orderData.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)) : ticketPrice;
          
          return {
            id: ticket.ticket_id,
            name: ticket.ticket_name || '',
            price: calculatedPrice,
            quantity: ticket.quantity
          };
        });
        
        setTicketData(tickets);
        
        // Calculate the base subtotal from ticket prices
        const baseSubtotal = tickets.reduce((total: number, ticket: TicketData) => total + (ticket.price * ticket.quantity), 0);
        
        // Use the total_amount from the API as the actual total
        const totalFromApi = orderData.total_amount || baseSubtotal;
        
        // Calculate fees as the difference between total and subtotal
        // This ensures the total shown in the payment button matches what's in the summary
        const fees = totalFromApi - baseSubtotal > 0 ? totalFromApi - baseSubtotal : 0;
        const subtotal = baseSubtotal;
        
        // Set the order summary with the correct values
        setOrderSummary({
          subtotal: subtotal,
          fees: fees,
          totalAmount: totalFromApi // Use the total from API which includes fees
        });
        
        // Log the total amount to verify it's correct
        console.log('Order total amount with fees:', totalFromApi);
        
        // Ensure ticket prices include a portion of the fees for display purposes
        const updatedTickets = tickets.map((ticket: TicketData) => ({
          ...ticket,
          // Add a proportional part of the fees to each ticket for display
          price: ticket.price + (fees * (ticket.quantity / orderData.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)) / ticket.quantity)
        }));
        
        setTicketData(updatedTickets);
        
        // Log the data for debugging
        console.log('Order data:', orderData);
        console.log('Processed tickets:', updatedTickets);
        console.log('Order summary:', { 
          subtotal, 
          fees, 
          totalFromApi, 
          calculatedTotal: subtotal + fees 
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Não foi possível carregar os dados do pedido. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, slug]);

  const handlePaymentSuccess = (paymentId: string) => {
    // Payment was successful, redirect to success page or show success message
    window.location.href = `/i/${orderId}`;
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order || !customerData || !ticketData.length) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          {error || 'Erro ao carregar dados do pedido'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <CheckoutStepper 
        activeStep={2}
        eventSlug={slug}
        orderId={orderId}
      />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Finalizar Pagamento
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Revise os detalhes do seu pedido e escolha a forma de pagamento
          </Typography>
        </Box>
        
        <PaymentComponent
          eventId={order.event_id}
          ticketId={ticketData[0].id} // Using first ticket's ID
          customerData={customerData}
          ticketData={ticketData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          orderTotal={order.total_amount}
        />
      </Container>
    </Box>
  );
}
