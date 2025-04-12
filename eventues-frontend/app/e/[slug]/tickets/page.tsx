'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, CircularProgress, Alert, Button } from '@mui/material';
import { getEventBySlug, getEventTickets, Event, Ingresso } from '@/app/apis/api';
import TicketOptions from './components/ticket_options/TicketOptions';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TicketsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [event, setEvent] = React.useState<Event | null>(null);
  const [tickets, setTickets] = React.useState<Ingresso[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedQuantities, setSelectedQuantities] = React.useState<Record<string, number>>({});

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
            .map(([ticketId, quantity]) => ({ ticket_id: ticketId, quantity })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { order_id } = await response.json();
      window.location.href = `/e/${slug}/${order_id}/infos`;
    } catch (error) {
      console.error('Error creating order:', error);
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
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
        <Link href={`/e/${slug}`} passHref>
          <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />}>Voltar para os detalhes do Evento</Button>
        </Link>
      </Box>
      <Box sx={{ mt: 4 }}>
        <TicketOptions 
          tickets={tickets} 
          onSelectTicket={handleSelectTicket} 
          selectedQuantities={selectedQuantities}
        />
        {totalTicketsSelected > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                padding: '12px 24px',
              }}
              onClick={handleContinue}
            >
              Continuar
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
