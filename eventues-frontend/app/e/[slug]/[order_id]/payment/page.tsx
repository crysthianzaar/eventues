'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress, Alert, Typography, Paper, useMediaQuery, useTheme, Button, Divider, List, ListItem, ListItemText, styled, Grid } from '@mui/material';
import { getOrder, Order, getEventBySlug, updateOrderStatus } from '@/app/apis/api';
import PaymentComponent from '../../tickets/components/payment/PaymentComponent';
import { CustomerData, TicketData } from '../../tickets/components/payment/types';
import CheckoutStepper from '@/app/components/CheckoutStepper';
import { formatPrice } from '@/app/utils/formatPrice';
import Link from 'next/link';

// Styled components for the summary section (from PaymentSummary.tsx)
const SummaryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 0,
    backgroundColor: 'transparent'
  }
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0
  }
}));

const SummaryLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem'
  }
}));

const SummaryValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem'
  }
}));

const TotalLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem'
  }
}));

const TotalValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem'
  }
}));

// Status que não permitem edição (estados finais ou intermediários após geração do pagamento)
const FINAL_STATUSES = [
  'CONFIRMADO', 'CONFIRMADO', 'RECEIVED', 
  'CANCELADO', 'OVERDUE', 'REFUNDED', 'PARTIALLY_REFUNDED',
  'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'DELETED', 'RESTORED', 'CANCELADO', 'RECEIVED_IN_CASH_UNDONE'
];

export default function PaymentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const orderId = params?.order_id as string;
  
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderPaid, setOrderPaid] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    fees: 0,
    totalAmount: 0,
    calculatedTotal: 0 // Added for debugging purposes
  });
  const [isFreeOrder, setIsFreeOrder] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId || !slug) return;

      try {
        // Fetch order data
        const orderData = await getOrder(orderId);
        console.log('Dados brutos da ordem:', orderData);
        setOrder(orderData);
        
        // Verificar se o pedido está em um status final
        const currentStatus = orderData.status || '';
        setOrderStatus(currentStatus);
        
        // Se o pedido já tiver sido pago ou cancelado, definir orderPaid como true
        if (FINAL_STATUSES.includes(currentStatus)) {
          setOrderPaid(true);
          setLoading(false);
          return; // Não carrega mais informações, já que não poderá ser pago novamente
        }

        // Event data will be fetched later when processing tickets

        // Extract customer data from the first participant's info in the first ticket
        // A estrutura real é: orderData.tickets[0].participants[0]
        const firstTicket = orderData.tickets?.[0] || {};
        const firstParticipant = firstTicket.participants?.[0] || {};
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
        
        // Check if this is a free order (all tickets have price 0)
        const isAllTicketsFree = tickets.every((ticket: TicketData) => ticket.price === 0);
        setIsFreeOrder(isAllTicketsFree);
        
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
        setLoadError('Não foi possível carregar os dados do pedido. Por favor, tente novamente mais tarde.');
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
    setPaymentError(errorMessage);
  };
  
  const handleFreeOrderConfirmation = async () => {
    if (!orderId) return;
    
    setConfirmingOrder(true);
    try {
      // Update order status to CONFIRMADO
      await updateOrderStatus(orderId, 'CONFIRMADO');
      
      // Redirect to order details page
      window.location.href = `/i/${orderId}`;
    } catch (err) {
      console.error('Error confirming free order:', err);
      setPaymentError('Não foi possível confirmar sua inscrição. Por favor, tente novamente.');
      setConfirmingOrder(false);
    }
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

  if (orderPaid) {
    const isPaid = orderStatus === 'CONFIRMADO' || orderStatus === 'CONFIRMED' || orderStatus === 'RECEIVED' || orderStatus === 'ANTICIPATED';
    const statusMessage = isPaid 
      ? 'Este pedido já foi confirmado e não pode ser pago novamente.' 
      : 'Este pedido foi cancelado ou expirado e não pode ser pago.'
    
    return (
      <Container maxWidth="lg">
        <CheckoutStepper 
          activeStep={2}
          eventSlug={slug}
          orderId={orderId}
        />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}>
          <Alert 
            severity={isPaid ? "success" : "warning"} 
            sx={{ mb: 4, width: '100%', maxWidth: 600 }}
          >
            {statusMessage}
          </Alert>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {isPaid ? 'Pagamento já realizado' : 'Pedido não disponível'}
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ maxWidth: 600, mb: 4 }}>
            {isPaid 
              ? 'Seu pedido já foi processado e confirmado. Você pode ver seus ingressos na página de detalhes do pedido.'
              : 'Este pedido não está mais disponível para pagamento.'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              component={Link} 
              href={`/i/${orderId}`}
            >
              VER INGRESSO
            </Button>
            
            <Button 
              variant="outlined" 
              component={Link} 
              href={`/e/${slug}`}
            >
              VOLTAR AO EVENTO
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }
  
  if (loadError || !order || !customerData || !ticketData.length) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          {loadError || 'Erro ao carregar dados do pedido'}
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
            {isFreeOrder ? 'Confirmar Inscrição' : 'Finalizar Pagamento'}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: { md: '70%' },
              fontSize: { xs: '0.95rem', md: '1rem' }
            }}
          >
            {isFreeOrder 
              ? 'Revise os detalhes da sua inscrição e confirme para finalizar' 
              : 'Revise os detalhes do seu pedido e escolha a forma de pagamento preferida'
            }
          </Typography>
        </Box>
        {paymentError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {paymentError}
          </Alert>
        )}
        
        {isFreeOrder ? (
          <Paper elevation={2} sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 2,
            mb: 4,
            backgroundColor: 'white'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Resumo da Inscrição
            </Typography>
            
            {/* Ticket summary - Using styled components from PaymentSummary */}
            <SummaryContainer>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Ingressos
              </Typography>
  
              {ticketData.map((ticket) => (
                <Box key={ticket.id} sx={{ mb: 2 }}>
                  <SummaryRow>
                    <SummaryLabel>
                      {ticket.name} x {ticket.quantity}
                    </SummaryLabel>
                    <SummaryValue>
                      {formatPrice(ticket.price * ticket.quantity)}
                    </SummaryValue>
                  </SummaryRow>
                  {ticket.taxa !== undefined && ticket.taxa > 0 && (
                    <SummaryRow>
                      <SummaryLabel sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                        Taxa de serviço
                      </SummaryLabel>
                      <SummaryValue sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {formatPrice((ticket.taxa || 0) * ticket.quantity)}
                      </SummaryValue>
                    </SummaryRow>
                  )}
                </Box>
              ))}
  
              <Divider sx={{ my: 2 }} />
              
              {/* Total row always shows */}
              <SummaryRow>
                <TotalLabel>Total</TotalLabel>
                <TotalValue>GRATUITO</TotalValue>
              </SummaryRow>
            </SummaryContainer>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Participant info - Styled similar to PersonalInfoForm */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                mb: 2,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center'
              }}>
                Informações do participante
              </Typography>
              
              {order?.tickets?.map((ticket, ticketIndex: number) => (
                ticket.participants?.map((participant: {[key: string]: any}, participantIndex: number) => (
                  <Paper 
                    key={`${ticketIndex}-${participantIndex}`}
                    elevation={0}
                    sx={{
                      p: 2.5, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      mb: 2
                    }}
                  >
                    {ticketIndex > 0 || participantIndex > 0 ? (
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        {ticket.ticket_name} - Participante {participantIndex + 1}
                      </Typography>
                    ) : null}
                    
                    <Grid container spacing={2}>
                      {/* Nome completo */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Nome completo
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {participant.fullName || 'Não informado'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Email */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {participant.email || 'Não informado'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Mostra campos adicionais que possam existir (exceto termsAccepted) */}
                      {Object.entries(participant).map(([key, value]) => {
                        // Pula os campos já exibidos ou campos que não devem ser mostrados
                        if (key === 'fullName' || key === 'email' || key === 'termsAccepted' || !value) return null;
                        
                        // Formata o nome do campo para exibição (camelCase para Title Case)
                        const fieldLabel = key
                          .replace(/([A-Z])/g, ' $1') // Adiciona espaço antes de letras maiúsculas
                          .replace(/^./, (str: string) => str.toUpperCase()); // Primeira letra maiúscula
                        
                        return (
                          <Grid item xs={12} sm={6} key={key}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {fieldLabel}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                ))
              ))}
            </Box>
            
            {/* Confirmation button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={confirmingOrder}
                onClick={handleFreeOrderConfirmation}
                sx={{ 
                  py: 1.5, 
                  px: 6, 
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark'
                  }
                }}
              >
                {confirmingOrder ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Processando...
                  </>
                ) : 'CONFIRMAR INSCRIÇÃO'}
              </Button>
            </Box>
          </Paper>
        ) : (
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
            orderId={orderId}
          />
        )}
      </Container>
    </Box>
  );
}
