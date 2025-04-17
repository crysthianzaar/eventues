'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress, Alert, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
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
    totalAmount: 0,
    calculatedTotal: 0 // Added for debugging purposes
  });

  // Adicionar log para debug dos valores
  useEffect(() => {
    if (order && orderSummary) {
      console.log('Antes de renderizar - orderSummary:', orderSummary);
      console.log('Antes de renderizar - order.total_amount:', order.total_amount);
      console.log('Diferença entre valores:', {
        'orderSummary.totalAmount': orderSummary.totalAmount,
        'order.total_amount': order.total_amount,
        'Diferença': orderSummary.totalAmount - (order.total_amount || 0)
      });
    }
  }, [order, orderSummary]);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId || !slug) return;

      try {
        // Fetch order data
        const orderData = await getOrder(orderId);
        console.log('Dados brutos da ordem:', orderData);
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
          return {
            id: ticket.ticket_id,
            name: ticket.ticket_name || '',
            price: ticket.valor || 0,
            quantity: ticket.quantity,
            taxa: ticket.taxa || 0,
            valor_total: ticket.valor_total || 0
          };
        });
        
        setTicketData(tickets);
        
        // Calculate the base subtotal from ticket prices
        const baseSubtotal = tickets.reduce((total: number, ticket: TicketData) => total + (ticket.price * ticket.quantity), 0);
        
        // Calcular as taxas da plataforma usando a mesma função do backend (7.99%)
        const calculatePlatformFee = (price: number): number => {
          if (price === 0) return 0; // Ingressos gratuitos não têm taxa
          if (price < 20) return 2; // Taxa mínima
          return Math.round((price * 7.99) / 100 * 100) / 100; // 7.99% com 2 casas decimais
        };
        
        // Calcular as taxas para cada ingresso
        const calculatedFees = tickets.reduce((total: number, ticket: TicketData) => {
          const fee = calculatePlatformFee(ticket.price);
          return total + (fee * ticket.quantity);
        }, 0);
        
        // Obter os valores do backend
        const subtotalAmount = orderData.subtotal_amount || 0;
        const feeAmount = orderData.fee_amount || 0;
        const totalAmount = orderData.total_amount || 0;
        
        // Para debug, calcular também os valores no frontend
        const calculatedTotal = baseSubtotal + calculatedFees;
        
        console.log('Valores da API vs. calculados:', {
          'API': {
            subtotal: subtotalAmount,
            fees: feeAmount,
            total: totalAmount
          },
          'Calculado': {
            subtotal: baseSubtotal,
            fees: calculatedFees,
            total: calculatedTotal
          }
        });
        
        // Sempre usar os valores do backend quando disponíveis
        setOrderSummary({
          subtotal: subtotalAmount,
          fees: feeAmount,
          totalAmount: totalAmount,
          calculatedTotal: calculatedTotal // Manter para debug
        });
        
        console.log('Usando valores exatos do backend:', {
          subtotal: subtotalAmount,
          fees: feeAmount,
          totalAmount: totalAmount
        });
        
        console.log('Valores calculados para orderSummary:', {
          subtotal: subtotalAmount,
          fees: feeAmount,
          totalAmount,
          calculatedTotal
        });
        
        // Log the total amount to verify it's correct
        console.log('Order total amount with fees:', totalAmount);
        
        // Ensure ticket prices include a portion of the fees for display purposes
        const updatedTickets = tickets.map((ticket: TicketData) => ({
          ...ticket,
          // Add a proportional part of the fees to each ticket for display
          price: ticket.price + (calculatedFees * (ticket.quantity / orderData.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)) / ticket.quantity)
        }));
        
        setTicketData(updatedTickets);
        
        // Log the data for debugging
        console.log('Order data:', orderData);
        console.log('Processed tickets:', updatedTickets);
        console.log('Order summary:', { 
          subtotal: baseSubtotal, 
          fees: calculatedFees, 
          totalAmount, 
          calculatedTotal 
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

  // Initialize theme hooks outside of conditionals to follow React hooks rules
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Os logs foram movidos para o useEffect existente para evitar erros de hooks

  return (
    <Box sx={{ 
      background: 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)',
      minHeight: '100vh',
      pt: { xs: 2, md: 4 },
      pb: { xs: 8, md: 6 }
    }}>
      <Container maxWidth="lg">
        <CheckoutStepper 
          activeStep={2}
          eventSlug={slug}
          orderId={orderId}
        />
        
        <Box sx={{ 
          mb: 4,
          mt: 4,
          textAlign: { xs: 'center', md: 'left' },
          px: { xs: 2, md: 0 }
        }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            Finalizar Pagamento
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: { md: '70%' },
              fontSize: { xs: '0.95rem', md: '1rem' }
            }}
          >
            Revise os detalhes do seu pedido e escolha a forma de pagamento preferida
          </Typography>
        </Box>
        

        <PaymentComponent
          eventId={order.event_id}
          ticketId={ticketData[0].id} // Using first ticket's ID
          customerData={customerData}
          ticketData={ticketData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          orderTotal={orderSummary.totalAmount} // Valor total do backend
          orderSubtotal={orderSummary.subtotal} // Subtotal do backend
          orderFees={orderSummary.fees} // Taxas do backend
        />
      </Container>
    </Box>
  );
}
