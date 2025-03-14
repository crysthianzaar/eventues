'use client';
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { useParams } from 'next/navigation';
import { getEventBySlug } from '../../apis/api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import EventManagementNav from '../../components/EventManagementNav';

export default function EventManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { event_id } = useParams();
  const [user, loading] = useAuthState(auth);
  const [event, setEvent] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (loading || !user) return;
      
      try {
        setLoadingEvent(true);
        const eventData = await getEventBySlug(event_id as string);
        
        // Verificar se o usuário é o organizador do evento
        if (eventData.user_id !== user.uid) {
          setError('Você não tem permissão para gerenciar este evento');
          return;
        }
        
        setEvent(eventData);
      } catch (err) {
        console.error('Erro ao carregar evento:', err);
        setError('Erro ao carregar informações do evento');
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [event_id, user, loading]);

  if (loading || loadingEvent) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error || 'Evento não encontrado'}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {event.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gerenciamento do Evento
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <EventManagementNav eventId={event.event_id} />
        </Grid>
        <Grid item xs={12} md={9}>
          {children}
        </Grid>
      </Grid>
    </Container>
  );
}
