'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress, Alert, Button, Typography, Badge } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { getEventBySlug, getEventTickets, Event, Ingresso } from '@/app/apis/api';
import { calculatePlatformFee } from './utils/calculateFee';
import TicketOptions from './components/ticket_options/TicketOptions';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckoutStepper from '@/app/components/CheckoutStepper';

export default function TicketsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [event, setEvent] = React.useState<Event | null>(null);
  const [tickets, setTickets] = React.useState<Ingresso[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedQuantities, setSelectedQuantities] = React.useState<Record<string, number>>({});
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

  // Fetch event data
  React.useEffect(() => {
    if (!slug) return;

    const fetchEventData = async () => {
      setLoading(true);
      try {
        const eventData = await getEventBySlug(slug);
        setEvent(eventData);
        const ticketsData = await getEventTickets(eventData.event_id);
        setTickets(ticketsData);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Não foi possível carregar os dados do evento. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [slug]);

  // Handle ticket selection
  const handleSelectTicket = (ticket: Ingresso, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [ticket.id]: quantity
    }));
  };

  // Calculate total tickets selected
  const totalTicketsSelected = Object.values(selectedQuantities).reduce((acc, quantity) => acc + quantity, 0);

  const handleContinue = async () => {
    setIsCreatingOrder(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: localStorage.getItem('user_id') || 'defaultUserId',
          event_id: event?.event_id,
          tickets: Object.entries(selectedQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .map(([ticketId, quantity]) => {
              const ticket = tickets.find(t => t.id === ticketId);
              return {
                ticket_id: ticketId,
                quantity,
                ticket_name: ticket?.nome || ''
              };
            }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { order_id } = await response.json();
      window.location.href = `/e/${slug}/${order_id}/infos`;
    } catch (error) {
      console.error('Error creating order:', error);
      setIsCreatingOrder(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error && !event) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <CheckoutStepper 
        activeStep={0}
        eventSlug={slug}
      />
      <Container maxWidth="lg">
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          mt: 2,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
          }
        }}
      >
        <Link href={`/e/${slug}`} passHref style={{ textDecoration: 'none' }}>
          <Button
            variant="text"
            color="primary"
            startIcon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease',
                  '.MuiButton-root:hover &': {
                    transform: 'translateX(-4px)'
                  }
                }}
              >
                <ArrowBackIcon />
              </Box>
            }
            sx={{
              fontSize: '0.95rem',
              fontWeight: 500,
              textTransform: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Voltar ao evento
          </Button>
        </Link>
      </Box>
      <Box sx={{ mt: 4, mb: 6 }}>
        <TicketOptions 
          tickets={tickets} 
          onSelectTicket={handleSelectTicket} 
          selectedQuantities={selectedQuantities}
        />
        {totalTicketsSelected > 0 && (
          <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 },
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)',
            '@supports (-webkit-touch-callout: none)': {
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            }
          }}>
            <Box sx={{
              maxWidth: 'lg',
              mx: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {totalTicketsSelected} {totalTicketsSelected === 1 ? 'ingresso selecionado' : 'ingressos selecionados'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    tickets.reduce((total, ticket) => {
                      const ticketTotal = (selectedQuantities[ticket.id] || 0) * ticket.valor;
                      const fee = calculatePlatformFee(ticketTotal);
                      return total + ticketTotal + fee;
                    }, 0)
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inclui taxas de serviço
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge 
                  badgeContent={totalTicketsSelected} 
                  color="primary"
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    '& .MuiBadge-badge': { fontWeight: 600 } 
                  }}
                >
                  <ConfirmationNumberIcon color="primary" />
                </Badge>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isCreatingOrder}
                  onClick={handleContinue}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-1px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    }
                  }}
                >
                  {isCreatingOrder ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Processando
                    </Box>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
    </Box>
  );
}
